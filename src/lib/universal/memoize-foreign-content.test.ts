import { describe, expect, it } from "vitest";
import * as mod from "./memoize-foreign-content";

describe("custom foreignReadableHtmlMemoizer", () => {
  const memoizableReadable = mod.foreignReadableHtmlMemoizer({
    isForeignContentAvailable: () => true,
  });
  it("retrieves and memoizes readable content", async () => {
    const memoizableReadableContent = memoizableReadable(
      "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
    );
    const mrc = await memoizableReadableContent();
    expect(mrc?.content).toBeDefined();
    expect(mrc?.textContent).toBeDefined();
  }, 20000);
});

describe("typical memoizableForeignReadable", () => {
  it("retrieves and memoizes unsanitized HTML as DOM", async () => {
    const mfh = mod.memoizableForeignHTML(
      "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
      {
        extractHTML: (dom) =>
          dom.window.document.querySelectorAll("div.post")[0]?.outerHTML ??
          "NOT FOUND",
      },
    );
    const html = await mfh();
    expect(html == "NOT FOUND").toBeFalsy();
  });

  it("retrieves and memoizes sanitized HTML as DOM", async () => {
    const mfh = mod.memoizableForeignHTML(
      "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
      {
        sanitized: true,
        extractHTML: (dom) =>
          dom.window.document.querySelectorAll("div.post")[0]?.outerHTML ??
          "NOT FOUND",
      },
    );
    const html = await mfh();
    expect(html == "NOT FOUND").toBeFalsy();
  });

  it("retrieves and memoizes readable content", async () => {
    const mrc = await mod.memoizableForeignReadable(
      "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
    )();
    expect(mrc?.content).toBeDefined();
    expect(mrc?.textContent).toBeDefined();
  }, 20000);
});

describe("flexible memoizableForeignContent", () => {
  it("retrieves and memoizes unsanitized HTML as DOM", async () => {
    const html = await mod.memoizableForeignContent({
      url: "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
    });
    expect(html.startsWith("memoizableForeignContent:")).toBeFalsy();
  });

  it("retrieves and memoizes sanitized HTML as DOM", async () => {
    const html = await mod.memoizableForeignContent({
      url: "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
      content: { selectFirst: "div.post" },
    });
    expect(html.startsWith("memoizableForeignContent:")).toBeFalsy();
  });

  it("retrieves and memoizes readable content", async () => {
    const html = await mod.memoizableForeignContent({
      url: "https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/",
      content: { readable: true },
    });
    expect(html.startsWith("memoizableForeignContent:")).toBeFalsy();
  }, 20000);
});
