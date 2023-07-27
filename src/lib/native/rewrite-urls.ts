import { textInterpolator } from "../universal/interpolate";

export interface UrlRewriteRule {
    readonly purpose: string;
    readonly rewrite: string | ((ruleKey: string) => string);
}

export const urlRewriteRules: Record<string, string | UrlRewriteRule> = {
    "self": {
        purpose: "Allow site URLs to be portable",
        rewrite: '/knowledge-center',
    },
    "self-gpm": {
        purpose: "Allow site URLs to be portable",
        rewrite: (_key) => '/knowledge-center/gpm', // example how the rule can be a function
    },
    "git-medigy-prime-issue":
        "https://git.netspective.io/netspective-medigy/properties/www.medigy.com/-/issues/",
    "gl-infra-medigy-digital-properties-path":
        "https://gl.infra.medigy.com/medigy-digital-properties/",
    "git-medigy-dpo-cicd-job":
        "https://git.netspective.io/netspective-medigy/properties/orchestrator/-/jobs/",
    "git-medigy-dpo-file":
        "https://git.netspective.io/netspective-medigy/properties/orchestrator/-/blob/master/",
    "git-medigy-dpo-issue":
        "https://git.netspective.io/netspective-medigy/properties/orchestrator/-/issues/",
    "git-medigy-dpo-path":
        "https://git.netspective.io/netspective-medigy/properties/orchestrator/-/tree/master/",
    "git-medigy-landing-page-issue":
        "https://git.netspective.io/netspective-medigy/netspective-medigy-landing/innovator-claim/-/issues/",
    "git-medigy-prime-cicd-job":
        "https://git.netspective.io/netspective-medigy/properties/www.medigy.com/-/jobs/",
    "git-medigy-prime-file":
        "https://git.netspective.io/netspective-medigy/properties/www.medigy.com/-/blob/master/",
    "git-medigy-prime-path":
        "https://git.netspective.io/netspective-medigy/properties/www.medigy.com/-/tree/",
    "git-medigy-publication-path":
        "https://git.netspective.io/netspective-medigy/netspective-medigy-publishing/",
    "git-medigy-caa-path":
        "https://git.netspective.io/netspective-medigy/governed-content/content-assembler-aide/",
    "git-netspective-prime": "https://git.netspective.io/",
    "git-workspace-file":
        "https://git.netspective.io/netspective-studios/netspective-workspaces/-/blob/master/",
    "gl-infra-medigy-content-orchestration-path":
        "https://gl.infra.medigy.com/medigy-content-orchestration/",
    "gl-infra-medigy-knowledge-path":
        "https://gl.infra.medigy.com/medigy-knowledge-content/",
    "gl-infra-medigy-presentation-content-generators":
        "https://gl.infra.medigy.com/medigy-content-orchestration/medigy-presentation-content-generators/",
    "gl-infra-medigy-presentation-path":
        "https://gl.infra.medigy.com/medigy-presentation-content/",
    "gl-infra-medigy-presentation-claim-path":
        "https://gl.infra.medigy.com/medigy-presentation-claim-content/",
    "op-dbcc-issue":
        "https://openproject.netspective.com/projects/data-blocking-command-center/work_packages/",
    "op-medigy-issue":
        "https://openproject.netspective.com/projects/www-medigy-com/work_packages/",
    "self-gpm-automation-rules": "/gpm/management/quality/automation-rules",
    "self-gpm-soc2-path":
        "/initiatives/-process/unified-process/nup-disciplines/regulatory-and-legal-compliance/",
    "self-gpm-verification-results":
        "/gpm/management/quality/verification-results",
    "gl-infra-medigy-prime-issue":
        "https://gl.infra.medigy.com/medigy-digital-properties/sflds-next-medigy/-/issues/",
    "box": "https://app.box.com",
    "dropbox": "https://www.dropbox.com",
};

export const { interpolate: rewrittenURL } = textInterpolator({
    replace: (token): string | false => {
        const urr = urlRewriteRules[token];
        if(typeof urr === "undefined" || urr === null) return false;
        return (typeof urr === "string" ? urr : (typeof urr.rewrite === "string" ? urr.rewrite : urr.rewrite(token)));
    },
});