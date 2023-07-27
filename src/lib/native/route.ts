import type { AstroGlobal } from "astro";
import { cwd } from "process";
import { z } from "zod";
import type { NavigationTree, BreadcrumbUnit } from "../astro/navigation";
import type { ContentCollection } from "../../content/config";
import * as h from "../universal/human";
import * as ws from "../universal/workspace";
import type { KnowledgeGraph } from "../universal/knowledge";

export const routesBaseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL.slice(0, import.meta.env.BASE_URL.length - 1)
  : import.meta.env.BASE_URL;

// TODO: move workspace manager into an Astro Integration and open source it
export const wsEditorResolverSchema = z.enum(ws.workspaceEditorTargetResolvers);
export const wsEditorEnvConfig = import.meta.env.UPI_WS_EDITOR
  ? wsEditorResolverSchema.parse(import.meta.env.UPI_WS_EDITOR)
  : undefined;

export const wsEditorResolver = wsEditorEnvConfig
  ? ws.workspaceEditorResolver(wsEditorEnvConfig, {
      vscodeWslRemoteDistro: () =>
        import.meta.env.UPI_WS_EDITOR_VSCODE_REMOTE_DISTRO,
      vscodeSsshRemoteHostname: () =>
        import.meta.env.UPI_WS_EDITOR_VSCODE_REMOTE_HOSTNAME,
    })
  : () => undefined;


export type OriginContentEntry = { readonly slug: string; readonly id: string };

export interface OriginEndpointSupplier<Entry extends OriginContentEntry> {
  readonly originEndpointURL: URL;
  readonly originFsPath: string | string[];
  readonly pathTree?: NavigationTree<Entry>;
}

export interface OriginContentEntrySupplier<
  Collection extends ContentCollection,
  Entry extends OriginContentEntry,
> {
  readonly collection: Collection;
  readonly entry: Entry;
  readonly pathTree?: NavigationTree<Entry>;
}

export type Provenance<
  Collection extends ContentCollection,
  Entry extends OriginContentEntry,
> = OriginEndpointSupplier<Entry> &
  Partial<OriginContentEntrySupplier<Collection, Entry>>;

export interface Route<
  Collection extends ContentCollection,
  Entry extends OriginContentEntry,
> extends KnowledgeGraph {
  readonly provenance: Provenance<Collection, Entry>;
  readonly breadcrumbs: BreadcrumbUnit[];
}

export function inferredBreadcrumbs(url: URL) {
  const result: BreadcrumbUnit[] = [];
  const units = url.pathname.split("/");
  let buildUrl = "";
  for (const unit of units) {
    buildUrl += unit + "/";
    const bcu = { label: h.humanFriendlyPhrase(unit), slug: buildUrl };
    switch (bcu.slug) {
      case `${routesBaseUrl}/gpm/`:
      case `${routesBaseUrl}/enterprise-architecture/`:
      case `${routesBaseUrl}/pkc/`:
        //bcu.label = bcu.label.toUpperCase();

        break;
    }
    if (unit != "") result.push(bcu);
  }
  return result;
}

// TODO: since this might be expensive, cache the results
export function route<
  Collection extends ContentCollection = ContentCollection,
  Entry extends OriginContentEntry = OriginContentEntry,
>(
  Astro: Readonly<AstroGlobal>,
  origin: Partial<Pick<OriginEndpointSupplier<Entry>, "originEndpointURL">> &
    Omit<OriginEndpointSupplier<Entry>, "originEndpointURL">,
  options?: {
    readonly entry?: OriginContentEntrySupplier<Collection, Entry>;
    readonly breadcrumbs?: (url: URL) => BreadcrumbUnit[];
    readonly knowledgeGraph?: (
      suggested: KnowledgeGraph | undefined,
      url: URL,
      prov: Provenance<Collection, Entry>,
      breadcrumbs: BreadcrumbUnit[],
    ) => KnowledgeGraph;
  },
): Route<Collection, Entry> {
  const provenance: Provenance<Collection, Entry> = {
    originEndpointURL: origin.originEndpointURL ?? Astro.url,
    originFsPath: origin.originFsPath,
    ...options?.entry,
  };
  let breadcrumbs = options?.breadcrumbs?.(Astro.url);
  if (!breadcrumbs && provenance.pathTree) {
    const { byNodeKey, terminalUnit } = provenance.pathTree.breadcrumbs;
    if (provenance.entry?.slug) {
      const result = byNodeKey(provenance.entry.slug, {
        refine: (result) => {
          // slugs will not be fully qualified so we refine the pathways;
          // the refined result will be cached so it's not too expensive
          result.forEach(
            (u) => ((u as any).slug = `${routesBaseUrl}/${u.slug}/`),
          );
          // our typical breadcrumbs won't have 'home' and the
          result.unshift({ label: "Home", slug: `${routesBaseUrl}/` });
          return result;
        },
        includeTerminal: terminalUnit,
      });
      if (result) breadcrumbs = result;
    }
  }
  if (!breadcrumbs) breadcrumbs = inferredBreadcrumbs(Astro.url);
  let kg = provenance.entry?.slug
    ? provenance.pathTree?.knowledgeGraph?.byNodeKey(provenance.entry.slug)
    : undefined;
  if (options?.knowledgeGraph) {
    kg = options.knowledgeGraph(kg, Astro.url, provenance, breadcrumbs);
  }
  if (!kg)
    kg = {
      openGraph: { ogTitle: provenance.entry?.id ?? "Invalid Provenance" },
    };
  return {
    provenance,
    breadcrumbs,
    ...kg,
  };
}

export function routeWsEditorTarget<
  Collection extends ContentCollection = ContentCollection,
  Entry extends OriginContentEntry = OriginContentEntry,
>(route: Route<Collection, Entry>) {
  if (!wsEditorEnvConfig) return undefined;
  const provenance = route.provenance;
  if (provenance.entry) {
    return wsEditorResolver(
      cwd() +
        "/src/content/" +
        provenance.collection +
        "/" +
        provenance.entry.id,
    );
  } else {
    return wsEditorResolver(cwd() + "/" + provenance.originFsPath);
  }
}

export const uaFlexibleURL = (relativePath: string) => {
  return `${routesBaseUrl}${relativePath}`;
};

export const uaHomeURL = () => {
  return `${routesBaseUrl}/`;
};



export const uaAssetURL = {
  brand: (relativePath: string) =>
    `${routesBaseUrl}/assets-natural/brand${relativePath}`,
  ds: (relativePath: string) =>
    `${routesBaseUrl}/assets-natural/ds${relativePath}`,
  native: (relativePath: string) =>
    `${routesBaseUrl}/assets-natural/native${relativePath}`,
  universal: (relativePath: string) =>
    `${routesBaseUrl}/assets-natural/universal${relativePath}`,
};

export function routes<
  Collection extends ContentCollection = ContentCollection,
  Entry extends OriginContentEntry = OriginContentEntry,
>(
  _Astro: Readonly<AstroGlobal>, // for future use
  activeRoute?: Route<Collection, Entry>,
) {
  return {
    activeRoute,
    uaFlexibleURL,
    uaHomeURL,
    uaAssetURL,
    wsEditorResolver,
  };
}

export function endpointRoutes<
  Collection extends ContentCollection = ContentCollection,
  Entry extends OriginContentEntry = OriginContentEntry,
>(
  _request: Request, // for future
  activeRoute?: Route<Collection, Entry>,
) {
  return {
    activeRoute,
    uaFlexibleURL,
    uaHomeURL,
    uaAssetURL,
  };
}

export default routes;
