import { singleton } from '../../../lib/universal/memoize';
import * as ac from 'astro:content';
import type { IntermediateRouteUnit } from '../../../governance/information-model/route';
import { NavigationTree, knowledgeGraphPreparer } from '../../../lib/astro/navigation';
import * as t from '../../../lib/universal/tree';
import * as tp from '../../../lib/universal/tree-pathway';
import * as s from '../../../governance/information-model/schemas';
import * as h from "../../../lib/universal/human";

// generated by src/content/_cc-routes-sync.deno.ts
import autoRoutes from "./_routes.auto.json";
export type AutoRouteKey = keyof typeof autoRoutes;

// internal type-safety convenience entries to prevent copy/paste errors
const collectionIdentity = 'thought-leadership' as const;
type CollectionEntry = ac.CollectionEntry<typeof collectionIdentity>;

// used by Astro src/content/config.ts; we want this to be as type-safe
// as possible so it's OK to duplicate code if you cannot make it generic.
export const thoughtleadershipSevicesCollection = ac.defineCollection({ schema: s.consultingSevicesSchema });
export const consultingSevicesNavigationTree = singleton(async () => {
  const entries = await ac.getCollection(collectionIdentity);
  const tree = t.pathTree<CollectionEntry, IntermediateRouteUnit>(
    entries,
    (ts) => ts.terminal.slug.split("/"),
    (node) => {
      const diu = autoRoutes[node.qualifiedPath as AutoRouteKey];
      return { intermediary: diu ? diu : { label: h.humanFriendlyPhrase(node.unit) }, ...node };
    });
  const qualifiedPathIndex = t.pathTreeIndex(tree);
  const result: NavigationTree<CollectionEntry> = {
    ...tree,
    qualifiedPathIndex,
    breadcrumbs: tp.treePathwaysPreparer(tree, (node) => ({
      // this is where type-safety is imporant, we want to be able to access the typed intermediary
      label: node.intermediary?.label ?? node.unit,
      slug: node.qualifiedPath
    }), (node) => ({
      // this is where type-safety is imporant, we want to be able to access the typed frontmatter
      label: node.terminal?.data.title ?? node.unit,
      slug: node.qualifiedPath
    }), { index: qualifiedPathIndex }),
    knowledgeGraph: knowledgeGraphPreparer(tree, (node) => ({
      openGraph: { ogTitle: node.terminal?.data.title ?? `No ${collectionIdentity} terminal` }
    }), { index: qualifiedPathIndex })
  };
  return result;
});

export default thoughtleadershipSevicesCollection;