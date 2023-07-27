import * as os from 'node:os';
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import type { AstroIntegration } from 'astro';
import { eq } from 'drizzle-orm/expressions';
import * as drizzleDB from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as obs from './observability.drizzle';
import { dbConnsFactory } from '../universal/pg-conn';
import * as h from "../universal/health";
import * as uFS from "../universal/fs";
import { cwd } from 'node:process';

export const relocatableAssetEffects = uFS.copyFileIfNewerMemoizeEffects();

export interface ObservabilityPersister {
	readonly db: drizzleDB.BetterSQLite3Database;
	readonly destFsPath: string;
	readonly drizzleConfigFsPath?: string | undefined;
	accessCount: number;
}

/**
 * Construct a function that, when called, will setup the observability persistence
 * database idempotently. If it's called multiple times it will return the singleton
 * instance. This is useful so that the first call can do the setup and all subsequent
 * calls will return the initial instance.
 * @param destFsPath where to create the SQLite file
 * @param options ORM and other configuration options
 * @returns a function that can be called idempotently to create or open the database
 */
export const observabilityPersister = (destFsPath = "./observability.sqlite.db", options?: { drizzleConfigFsPath?: string }): () => ObservabilityPersister => {
	let singleton: ObservabilityPersister | undefined = undefined;
	return () => {
		if (!singleton) {
			const sqlite = new Database(destFsPath);
			const db = drizzleDB.drizzle(sqlite);
			const dcfs = options?.drizzleConfigFsPath ?? "./drizzle.config.json";
			// if you update schema, run `npm exec drizzle-kit generate:sqlite`
			// so that the migration can be done properly;
			migrate(db, dcfs);
			singleton = { db, destFsPath, drizzleConfigFsPath: options?.drizzleConfigFsPath, accessCount: 0 };
		}
		singleton.accessCount++;
		return singleton;
	}
}

export interface ObservabilityStrategy {
	readonly sqlitePersister?: () => ObservabilityPersister;
}

//https://docs.astro.build/en/reference/integrations-reference/
export const observabiltyPlugin = (strategy?: ObservabilityStrategy): AstroIntegration => {
	const op = strategy?.sqlitePersister ? strategy?.sqlitePersister() : undefined;
	const hostname = os.hostname();
	const vendor = "Astro 2.0";

	let host: obs.Host | undefined = undefined;
	let astro: obs.Supplier | undefined = undefined;
	let astroConfigSetupStartAt: Date = new Date();

	// TODO: add OpenTelemetry instrumentation
	// see https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/
	// TODO: use JSON.stringifgy code from resFactory/GPM to mask passwords before writing all of sqlConnState
	const observations: Record<string, unknown> = {
		persistSqliteDB: op
	};
	return {
		name: "@netspective-labs/observability",

		hooks: {
			'astro:config:setup': async () => {
				astroConfigSetupStartAt = new Date();
				if (op) {
					try {
						host = op.db.insert(obs.host).values({ id: uuidv4(), host: hostname }).onConflictDoNothing().returning().get();
					} catch {
						host = op.db.select().from(obs.host).where(eq(obs.host.host, hostname)).get();
					}
					try {
						astro = op.db.insert(obs.supplier).values({ id: uuidv4(), vendor }).onConflictDoNothing().returning().get();
					} catch {
						astro = op.db.select().from(obs.supplier).where(eq(obs.supplier.vendor, vendor)).get();
					}
				}
			},

			'astro:build:done': async ({ dir, pages /*, routes */ }) => {
				const astroBuildDoneAt = new Date();
				observations.astroConfigSetupStartAt = astroConfigSetupStartAt;
				observations.astroBuildDoneAt = astroBuildDoneAt;

				const dbcf = dbConnsFactory();
				observations.dbConns = { isConfigured: dbcf.dbConfig.isConfigured };
				for (const csi of dbcf.connSqlInstances.values()) {
					(observations.dbConns as any)[csi.connID] = {
						state: csi.state,
						connUrl: csi.connUrlInfo, conn: csi.connection
					};
				}

				if (op && host && astro) {
					op.db.insert(obs.buildEvent).values({
						id: uuidv4(),
						hostId: host.id,
						supplierId: astro.id,
						buildInitiatedAt: astroConfigSetupStartAt,
						buildCompletedAt: astroBuildDoneAt,
						durationMillis: astroBuildDoneAt.valueOf() - astroConfigSetupStartAt.valueOf(),
						resourcesPersistedCount: pages.length
					}).onConflictDoNothing().run();
				}

				const astroHealth: h.ServiceHealthComponentStatus[] = [
					h.healthyComponent({
						componentType: "component",
						componentId: `build`,
						metricName: "setup-start-at",
						observedValue: astroConfigSetupStartAt,
						observedUnit: "timestamp",
						links: {},
						time: new Date(),
					}),
					h.healthyComponent({
						componentType: "component",
						componentId: `build`,
						metricName: "build-done-at",
						observedValue: astroBuildDoneAt,
						observedUnit: "timestamp",
						links: {},
						time: new Date(),
					}),
					h.healthyComponent({
						componentType: "component",
						componentId: `build`,
						metricName: "pages-count",
						observedValue: pages.length,
						observedUnit: "cardinal",
						links: {},
						time: new Date(),
					}),
				];

				const currentPath = cwd();
				const currentPathSliceStart = currentPath.length + 1;
				const relocatables = Array.from(relocatableAssetEffects.memoized.entries());
				const relocatablesHealth: h.ServiceHealthComponentStatus[] = [
					h.healthyComponent({
						componentType: "component",
						componentId: `relocated`,
						links: relocatables.reduce((srcDest, e) => { 
							let [src, dest] = e;
							if(src.startsWith(currentPath)) src = src.slice(currentPathSliceStart);
							if(dest.copied.length) srcDest[src] = dest.copied.map(d => { 
								if(d.startsWith(currentPath)) return d.slice(currentPathSliceStart);
								return d;
							 }).join(", ");
							return srcDest;
						 }, {} as Record<string, string>),
						time: new Date(),
					}),
					h.healthyComponent({
						componentType: "component",
						componentId: `relocation-not-required`,
						links: relocatables.reduce((srcDest, e) => { 
							let [src, dest] = e;
							if(src.startsWith(currentPath)) src = src.slice(currentPathSliceStart);
							if(dest.notRequired.length) srcDest[src] = dest.notRequired.map(d => { 
								if(d.startsWith(currentPath)) return d.slice(currentPathSliceStart);
								return d;
							 }).join(", ");
							return srcDest;
						 }, {} as Record<string, string>),
						time: new Date(),
					}),
				];
				for (const dde of relocatableAssetEffects.destDirErrors.entries()) {
					const [dest, err] = dde;
					relocatablesHealth.push(h.unhealthyComponent("warn", {
						componentType: "component",
						componentId: dest,
						output: String(err),
						links: {},
						time: new Date(),
					}))
				};
				const relocated = relocatables.reduce((stats, r) => {
					const [srcFile, effects] = r;
					stats.copied += effects.copied.length;
					stats.copyNotRequired += effects.notRequired.length;
					stats.srcStatErrors += effects.statError.length;
					effects.statError.forEach(se => relocatablesHealth.push(h.unhealthyComponent("warn", {
						componentType: "component",
						componentId: srcFile,
						output: String(se),
						links: {},
						time: new Date(),
					})));
					return stats;
				}, { copied: 0, copyNotRequired: 0, srcStatErrors: 0 });

				const siteStateHealth: h.ServiceHealthComponentStatus[] = [
					h.healthyComponent({
						componentType: "component",
						componentId: `state`,
						node: JSON.stringify(op),
						links: {},
						time: new Date(),
					}),
					h.healthyComponent({
						componentType: "component",
						componentId: `relocation-dest-dir-errors`,
						node: JSON.stringify(Array.from(relocatableAssetEffects.destDirErrors.entries())),
						links: {},
						time: new Date(),
					}),
				];

				const outFile = fileURLToPath(new URL('./observability/health.json', dir));
				let health = h.healthyService({ releaseId: "1.0", version: "1.0", checks: { astro: astroHealth, siteState: siteStateHealth, relocatables: relocatablesHealth } });
				try {
					// if we have an endpoint that already created part of the health.json file, merge it
					const existing = JSON.parse(String(await readFile(outFile)));
					if (existing) {
						existing.checks["astro"] = astroHealth;
						existing.checks["siteState"] = siteStateHealth;
						existing.checks["relocatables"] = relocatablesHealth;
						health = existing;
					}
				} catch {
					// ignore, doesn't exist
				}
				await writeFile(outFile, JSON.stringify(health, null, "  "));
				console.log(`${relocatableAssetEffects.memoized.size} files relocatable, ${relocated.copied} copied, ${relocated.copyNotRequired} copy not required, ${relocated.srcStatErrors} src stat errors, ${relocatableAssetEffects.destDirErrors.size} dest dir error(s)`);
				console.log(`Service health emitted (astro:build:done) to`, outFile);
			},
		},
	};
};

