import { describe, expect, it } from 'vitest'
import * as mod from "./rewrite-urls";

describe("rewrite-urls", async () => {
  it("rewrite rule should leave string alone if tokens not found", () => {
    const fixture0 = "${some-bad-token}5";
    expect(mod.rewrittenURL(fixture0)).toBe(fixture0);

    const fixture1 = "invalid${some-bad-token5";
    expect(mod.rewrittenURL(fixture1)).toBe(fixture1);
  });

  it("rewrite rule should replace tokens", () => {
    const fixture = "${self-gpm}/management/quality/automation-rules/rules-seo-verification-in-dpo/";
    expect(mod.rewrittenURL(fixture)).toBe("/knowledge-center/gpm/management/quality/automation-rules/rules-seo-verification-in-dpo/");
  });

  it("rewrite rule should replace tokens", () => {
    const fixture = "${git-medigy-prime-issue}5";
    expect(mod.rewrittenURL(fixture)).toBe("https://git.netspective.io/netspective-medigy/properties/www.medigy.com/-/issues/5");
  });
});
