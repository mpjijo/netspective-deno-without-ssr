import { PathTree, PathTreeNode, pathTreeIndex } from '../universal/tree';
import type { TreePathwaysSupplier, TreePathwayUnitSupplier } from '../universal/tree-pathway';
import type { IntermediateRouteUnit } from '../../governance/information-model/route';
import type { KnowledgeGraph } from "../universal/knowledge";

export interface BreadcrumbUnit {
  readonly label: string;
  readonly tooltip?: string;
  readonly slug: string;
};

export type BreadcrumbUnitSupplier<Terminal, Intermediary> =
  TreePathwayUnitSupplier<Terminal, Intermediary, BreadcrumbUnit>;

export interface KnowledgeGraphSupplier<Terminal, Intermediary> {
  readonly byNodeKey: (indexKey: string) => KnowledgeGraph | undefined;
  readonly byNode: (node: PathTreeNode<Terminal, Intermediary>) => KnowledgeGraph;
}

/**
 * A PathTree combined with node tree index (to lookup by qualifiedPath) and
 * breadcrumbs ("node pathways" or "node trail") supplier.
 */
export interface NavigationTree<
  Terminal,
  Intermediary extends IntermediateRouteUnit = IntermediateRouteUnit,
  PathwayUnit extends BreadcrumbUnit = BreadcrumbUnit> extends PathTree<Terminal, Intermediary> {
  readonly qualifiedPathIndex: Map<string, PathTreeNode<Terminal, Intermediary>>,
  readonly breadcrumbs: TreePathwaysSupplier<Terminal, Intermediary, PathwayUnit>;
  readonly knowledgeGraph: KnowledgeGraphSupplier<Terminal, Intermediary>;
}

export function knowledgeGraphPreparer<Terminal, Intermediary>(
  tree: PathTree<Terminal, Intermediary>,
  knowledgeGraph: (node: PathTreeNode<Terminal, Intermediary>) => KnowledgeGraph,
  options?: {
    index?: Map<string, PathTreeNode<Terminal, Intermediary>>,
    refine?: (suggested: KnowledgeGraph) => KnowledgeGraph,
  }): KnowledgeGraphSupplier<Terminal, Intermediary> {
  const index = options?.index ?? pathTreeIndex(tree);
  const cachedNodeKeys = new Map<string, KnowledgeGraph>();
  const cachedNodeQPs = new Map<string, KnowledgeGraph>();
  return {
    byNodeKey: (indexKey) => {
      let result = cachedNodeKeys.get(indexKey);
      if(!result) {
        const node = index.get(indexKey);
        if(node) {
          result = knowledgeGraph(node);
          if(options?.refine) result = options.refine(result);
          cachedNodeKeys.set(indexKey, result)  
        }
      }
      return result;
    },
    byNode: (node) => {
      let result = cachedNodeQPs.get(node.qualifiedPath);
      if(!result) {
          result = knowledgeGraph(node);
          if(options?.refine) result = options.refine(result);
          cachedNodeQPs.set(node.qualifiedPath, result)  
      }
      return result;
    }
  }
}