/**
 * This file is imported by all _route.ts files that need to supply
 * "intermediate route" properties. If possible, don't include imports and
 * instead used structured typing so that we don't create complex dependency
 * graphs. Structured typing creates some copy/paste problems but will be more
 * resilient.
 */

export type FrontmatterValue =
  | string
  | number
  | boolean
  | { [x: string]: FrontmatterValue }
  | Array<FrontmatterValue>;
export type TransformableFrontmatter = { [x: string]: FrontmatterValue };

// vfile https://www.npmjs.com/package/vfile instance but instead of using the
// type directly we create a structured typed so that we don't have to  worry
// about imports
export type RemarkVfile = {
  readonly value?: string | Buffer;
  readonly cwd?: string;
  readonly path: URL | string;
  readonly basename: string | undefined;
  readonly extname: string | undefined;
  readonly dirname: string | undefined;
  readonly data: any;
};

export type RouteFrontmatterTransformer = (
  tf: () => TransformableFrontmatter,
  vfile: RemarkVfile,
) => Promise<void>;

// tree is Remark Mardkown content AST, we use structured typing instead of
// imports to reduce dependencies
export type RouteRemarkPlugin = (
  remarkProcessors: () => {
    // same as import { visit } from 'unist-util-visit'
    visit: (...args: any[]) => void;
    // same as import type { h } from 'hastscript'
    h: (...args: any[]) => any;
    // see src/lib/astro/remark-path-plugins.ts, returns AST for embedded markdown
    embedded?: (markdown: string) => any;
  },
  tree: any,
  vfile: RemarkVfile,
) => Promise<void>;

export interface RouteFrontmatter {
  readonly transformFM?: RouteFrontmatterTransformer;
}

export interface RouteContent {
  readonly remarkPlugin?: RouteRemarkPlugin;
}

export interface IntermediateRouteUnit {
  readonly label: string;
  readonly abbreviation?: string;
  readonly frontmatter?: RouteFrontmatter;
  readonly content?: RouteContent;
}

// this is the signature of each _route.ts file
export type IntermediateRouteUnitSupplier = () => IntermediateRouteUnit;

export interface DiscoveredRouteUnit extends IntermediateRouteUnit {
  readonly slug: string;
  readonly originFsPath: string;
}

export function modelIruProperties<
  ModelShape extends { [x: string]: FrontmatterValue },
  Property extends keyof ModelShape = keyof ModelShape,
>(
  model: ModelShape,
  accessorName = "PCII",
): Pick<IntermediateRouteUnit, "frontmatter" | "content"> {
  const frontmatter: RouteFrontmatter = {
    transformFM: async (astroFmSupplier) => {
      const astroFM = astroFmSupplier();
      astroFM[accessorName] = model;
    },
  };

  const content: RouteContent = {
    remarkPlugin: async (processors, tree, vfile) => {
      const { visit, embedded } = processors();
      visit(tree, ["textDirective"], (node: any) => {
        if (node.name !== accessorName) return;
        if (node.children.length === 0) {
          console.error(`No '${accessorName}' content in directive: ${JSON.stringify(vfile)}`);
          return;
        }

        // attributes are what's in the {...} after the directive name
        const attributes = node.attributes || {}
        const token = node.children[0].value;
        if (attributes.formatmd && embedded) {
          const newMarkdown = embedded(model[token as Property] as string) as any;
          node.type = newMarkdown.type;
          node.value = newMarkdown.value;
          node.children = newMarkdown.children;
        } else {
          node.type = "text";
          if (token == "*") {
            node.value = Object.keys(model).map(k => `'${k}'`).join(", ");
          } else {
            node.value = model[token as Property] ?? `?${token}?`;
          }
          node.children = undefined;
        }
      });
    },
  };

  return {
    frontmatter,
    content,
  };
}
