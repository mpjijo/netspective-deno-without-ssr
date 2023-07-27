// See https://git.netspective.io/precision-knowledge-content/knowledge-center/-/issues/19
// this is a Deno script written in "NPM-compatible" manner;
// run it using `npm run sync-cc-routes` as part of the Astro build process
import * as rGovn from "../governance/information-model/route.ts";
import { walkFsEntries } from "../../lib/universal/fs-walk.ts";
import { cwd } from "node:process";

type ContentCollection = string;
type Slug = string;
const discoveredIrUnits: Record<
  ContentCollection,
  Record<Slug, rGovn.DiscoveredRouteUnit>
> = {};

const contentPath = (relPath?: string) =>
  `${cwd()}/src/content${relPath ? `/${relPath}` : ""}`;

// assumes we're going to run this from the project root
await walkFsEntries(contentPath(), {
  onDirectory: async (we) => {
    if (we.level == 0) {
      // setup the content collection store
      discoveredIrUnits[we.relPath] = {};
    }
    return "enter";
  },
  onFile: async (we) => {
    // we don't know what to do with a root path (because it's a content collection)
    if (!we.parentRelPath) return;

    if (we.absPath.endsWith("_route.ts")) {
      const { intermediateRouteUnit: iruFn } = await import(we.absPath) as {
        intermediateRouteUnit: () => rGovn.IntermediateRouteUnit;
      };
      if (typeof iruFn === "function") {
        const intermediateRouteUnit = iruFn();
        let collectionName, slug;
        const collectionIdx = we.parentRelPath?.indexOf("/");
        if (collectionIdx == -1) {
          collectionName = we.parentRelPath;
          slug = ".";
        } else if (collectionIdx > 0) {
          collectionName = we.parentRelPath?.slice(0, collectionIdx);
          slug = we.parentRelPath?.slice(collectionIdx + 1);
        }
        if (!(collectionName in discoveredIrUnits)) discoveredIrUnits[collectionName] = {};
        const diru = discoveredIrUnits[collectionName];
        if (diru) {
          diru[slug] = {
            ...intermediateRouteUnit,
            slug,
            originFsPath: we.relPath,
          };
        }
      }
    }
  },
});

for (const entry of Object.entries(discoveredIrUnits)) {
  const [collectionName, irUnits] = entry;
  await Deno.writeTextFile(
    `${contentPath(collectionName)}/_routes.auto.json`,
    JSON.stringify(irUnits, (key, value) => {
      // frontmatter and content are functions for UPI at build-time not for the
      // catalog of entries
      if (key == "frontmatter" || key == "content") return undefined;
      return value;
    }, "  "),
  );
}
