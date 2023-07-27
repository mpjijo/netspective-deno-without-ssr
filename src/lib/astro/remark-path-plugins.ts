import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { h } from 'hastscript'

// this is a "copy" of src/governance/information-model/route.ts so keep it in
// sync -- stay with structural typing and don't use imports so that
// dependencies can be reduced
export type FrontmatterValue =
	| string
	| number
	| boolean
	| { [x: string]: FrontmatterValue }
	| Array<FrontmatterValue>;
export type TransformableFrontmatter = { [x: string]: FrontmatterValue };

/**
 * Create path-specific plugin handlers. This is useful for cases like _route.ts
 * handlers that need to do path-specific content / frontmatter transformations.
 * @returns
 */
export function remarkVFilePlugins(
	handlerSupplier: (vfile: VFile) =>
		| {
			transformFM?: (
				mutatableAstroFrontmatter: () => TransformableFrontmatter,
				vfile: VFile,
			) => Promise<void>;
			processAST?: (
				remarkProcessors: () => {
					visit: typeof visit;
					h: typeof h;
					embedded: (text: string) => string;
				},
				tree: any,
				vfile: VFile,
			) => Promise<void>;
			embeddedMarkdownAST?: (text: string) => string;
		}
		| undefined,
) {
	return () => {
		return async (tree: any, vfile: VFile) => {
			const handler = handlerSupplier(vfile);
			if (handler) {
				const { transformFM, processAST, embeddedMarkdownAST } = handler;

				// first do any frontmatter transformations
				if (transformFM) {
					await transformFM(() => {
						let mutatableFM = (vfile.data?.astro as any)?.frontmatter;
						if (!mutatableFM) {
							mutatableFM = (vfile.data.astro as any).frontmatter = {};
						}
						return mutatableFM;
					}, vfile);
				}

				// now handle any plugins (using new frontmatter)
				if (processAST) {
					await processAST(
						() => {
							return {
								visit,
								h,
								embedded: embeddedMarkdownAST ?? ((text) => `no formatter: ${text}`),
							};
						},
						tree,
						vfile,
					);
				}
			}
		};
	};
}
