import { InferModel, sqliteTable, text, integer, blob, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { tableBuilderAide, snakeToCamelCase } from "../universal/drizzle-aide";

// TODO: ESSENTIAL
// - [ ] see https://github.com/cannadayr/git-sqlite for revisioning in Git as a strategy
//       and easy bash code to learn from.

// prepare the entity builder helpers to ensure names and types are consistent
export const supplierTBA = tableBuilderAide('build_supplier');
export const hostTBA = tableBuilderAide('build_host');
export const buildEventTBA = tableBuilderAide('build_event');

// -------------------------------------------------------------------------
// prepare the entities (tables, etc.) and export tables so that Drizzle ORM
// migration Kit picks them up for DDL generation
// -------------------------------------------------------------------------

export const supplier = sqliteTable(supplierTBA.tableName, {
	id: supplierTBA.primaryKey(),
	vendor: text('vendor').notNull(),
}, (supplier) => ({
	uniqueIdx: uniqueIndex(supplierTBA.indexName(supplier.vendor)).on(supplier.vendor),
}));

export type Supplier = InferModel<typeof supplier>;
export type SupplierInsertable = InferModel<typeof supplier, 'insert'>;

export const host = sqliteTable(hostTBA.tableName, {
	id: hostTBA.primaryKey(),
	host: text('host').notNull(),
	hostIdentity: blob('host_identity', { mode: 'json' })
}, (host) => ({
	uniqueIdx: uniqueIndex(hostTBA.indexName(host.host)).on(host.host),
}));

export type Host = InferModel<typeof host>;
export type HostInsertable = InferModel<typeof host, 'insert'>;

export const buildEvent = sqliteTable(buildEventTBA.tableName, {
	id: buildEventTBA.primaryKey(),
	hostId: buildEventTBA.primaryKeyFK(host.id).notNull(),
	supplierId: buildEventTBA.primaryKeyFK(supplier.id).notNull(),
	buildInitiatedAt: buildEventTBA.atTimestamp('build_initiated').notNull(),
	buildCompletedAt: buildEventTBA.atTimestamp('build_completed').notNull(),
	durationMillis: integer('duration_millis').notNull(),
	resourcesPersistedCount: integer('resources_persisted_count').notNull()
});

export type BuildEvent = InferModel<typeof buildEvent>;
export type BuildEventInsertable = InferModel<typeof buildEvent, 'insert'>;

// -----------------------------------------------------------------------------
// prepare the schema, Drizzle ORM doesn't need the entire schema, but we create
// it for our convenience (especially for linting, catalog'ing, etc).
// -----------------------------------------------------------------------------

export const schema = {
	tables: { supplier, host, buildEvent },
	lint: (encounterIssue: (...i: { issue: string }[]) => void) => {
		supplierTBA.lintTable(supplier, { encounterIssue, snakeToCamelCase });
		hostTBA.lintTable(host, { encounterIssue, snakeToCamelCase });
		buildEventTBA.lintTable(buildEvent, { encounterIssue, snakeToCamelCase, ignore: {
			// propNames more ergonomic without "build" (buildEvent.hostId not buildEvent.buildHostId)
			propNameConsistency: (column) => column === buildEvent.hostId || column === buildEvent.supplierId
		}});
	}
}

// TODO: add lint details into the database itself?
// or, add it to observability state?
schema.lint((...issues) => issues.forEach(i => console.warn(`[observability.drizzle.ts]`, i.issue)));