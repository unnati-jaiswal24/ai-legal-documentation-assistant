import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

describe('AI report generation API', () => {
  let vite;
  let generateDraftReport;
  let originalFetch;

  before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
    ({ generateDraftReport } = await vite.ssrLoadModule('./src/api/ai.js'));
    originalFetch = globalThis.fetch;
  });

  after(async () => {
    globalThis.fetch = originalFetch;
    if (vite) await vite.close();
  });

  it('sends the report input and explicit consent to the server AI endpoint', async () => {
    const reportInput = {
      templateTitle: 'Freelance Service Agreement',
      fields: [{ key: 'scope_description', label: 'Scope of work', value: 'Design a website' }],
    };
    let request;
    globalThis.fetch = async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        json: async () => ({ status: 'ready', report: { overview: 'A project overview.' } }),
      };
    };

    const result = await generateDraftReport(reportInput);
    assert.equal(request.url, 'http://localhost:4000/api/ai/report-content');
    assert.equal(request.options.method, 'POST');
    assert.deepEqual(JSON.parse(request.options.body), { ...reportInput, consent: true });
    assert.deepEqual(result, { status: 'ready', report: { overview: 'A project overview.' } });
  });
});
