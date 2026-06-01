import { Buffer } from "node:buffer";
import { expect, test } from "../fixtures";
import { ChatPage } from "../pages/chat";

const DOC_CONTENT =
  "The capital of France is Paris. The Eiffel Tower is 330 metres tall.";

const MOCK_DOCUMENT = {
  id: "kb-doc-test-001",
  title: "paris-facts",
  fileName: "paris-facts.txt",
  fileType: "text/plain",
  fileSize: DOC_CONTENT.length,
  chunkCount: 1,
  createdAt: new Date().toISOString(),
};

test.describe("Knowledge Base (RAG)", () => {
  test("upload a document and verify it appears in the list", async ({
    adaContext,
  }) => {
    const { page } = adaContext;
    let uploaded = false;

    await page.route("**/api/knowledge-base**", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        uploaded = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ document: MOCK_DOCUMENT }),
        });
      } else if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            documents: uploaded ? [MOCK_DOCUMENT] : [],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/knowledge-base");
    await expect(page.getByText("No documents yet.")).toBeVisible();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Drop a file here, or click to upload").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "paris-facts.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(DOC_CONTENT),
    });

    await expect(
      page.getByText("paris-facts").first()
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("1 chunk")).toBeVisible();
  });

  test("delete a knowledge base document", async ({ adaContext }) => {
    const { page } = adaContext;
    let deleted = false;

    await page.route("**/api/knowledge-base**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            documents: deleted ? [] : [MOCK_DOCUMENT],
          }),
        });
      } else if (method === "DELETE") {
        deleted = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/knowledge-base");
    await expect(page.getByText("paris-facts")).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).first().click();

    await expect(
      page.getByText("No documents yet.")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("chat response references knowledge base content", async ({
    adaContext,
  }) => {
    const { page } = adaContext;
    const chatPage = new ChatPage(page);

    await page.route("**/api/knowledge-base**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ documents: [MOCK_DOCUMENT] }),
        });
      } else {
        await route.continue();
      }
    });

    await chatPage.createNewChat();

    await chatPage.sendUserMessage(
      "What information do you have about France in my knowledge base?"
    );
    await chatPage.isGenerationComplete();

    const assistantMessage = await chatPage.getRecentAssistantMessage();
    expect(assistantMessage?.content).toContain(
      "According to your knowledge base, Paris is the capital of France."
    );
  });
});
