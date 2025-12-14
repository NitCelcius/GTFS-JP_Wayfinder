import { jest } from "@jest/globals";

describe("initializeApiClient", () => {
  const MODULE_PATH = "@/lib/initializeApiClient";
  const CLIENT_PATH = "@/api/client.gen";

  it("sets generated client baseUrl from env", async () => {
    // Set an env value via window.__ENV__ (preferred in browser/runtime)
    const testUrl = "https://env-test.example";

    // Make sure global window object is available and set __ENV__ before import
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Jest's JSDOM provides a global window
    global.window =
      global.window || ({} as Window & { __ENV__?: Record<string, string> });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window.__ENV__ = { NEXT_PUBLIC_API_BASE_URL: testUrl };

    // purge requires to force re-import and re-evaluate module initialization
    jest.resetModules();

    // import initializer (side-effect) and the client
    const { baseUrl } = await import(MODULE_PATH);
    const { client } = await import(CLIENT_PATH);

    expect(baseUrl).toBe(testUrl);
    expect(client.getConfig().baseUrl).toBe(testUrl);
  });
});
