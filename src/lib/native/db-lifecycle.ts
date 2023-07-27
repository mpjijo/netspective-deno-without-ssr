import type { AstroIntegration } from 'astro';
import { dbConnsFactory } from '../universal/pg-conn';

//https://docs.astro.build/en/reference/integrations-reference/
export const dbLifecyclePlugin = (): AstroIntegration => {
	// do this as early as possible in the lifecycle so that the factory is initialized before anyone else needs it
	const dbcf = dbConnsFactory();
	return {
		name: "@netspective-labs/db-lifecyle",

		hooks: {
			'astro:config:done': async () => {
				console.log(`Initialized DB Lifecycle Plugin (astro:config:done), env configured: ${dbcf.dbConfig.isConfigured}, use 'npm run test-pg-conns' to verify connectability`);
			},

			'astro:build:done': async () => {
				await dbcf.end();
				console.log(`Ended DB Lifecycle (astro:build:done), env configured: ${dbcf.dbConfig.isConfigured} ${Array.from(dbcf.connSqlInstances.values()).map(csi => `${csi.connID} (${csi.state})`).join(", ")}`);
			},
		},
	};
};