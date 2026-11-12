import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

describe('AI Consent Dialog & Gate', () => {
  let vite;
  let AiConsentDialog;
  let configModule;

  before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
    const dialogMod = await vite.ssrLoadModule('./src/components/ai/AiConsentDialog.jsx');
    AiConsentDialog = dialogMod.default;
    configModule = await vite.ssrLoadModule('./src/api/ai/config.js');
  });

  after(async () => {
    if (vite) await vite.close();
  });

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(React.createElement(AiConsentDialog, {
      isOpen: false,
      onConsent: () => {},
      onCancel: () => {},
    }));
    assert.equal(html, '');
  });

  it('renders accessible modal dialog when isOpen is true', () => {
    const html = renderToString(React.createElement(AiConsentDialog, {
      isOpen: true,
      onConsent: () => {},
      onCancel: () => {},
    }));
    assert.ok(html.includes('role="dialog"'));
    assert.ok(html.includes('aria-modal="true"'));
    assert.ok(html.includes('aria-labelledby="ai-consent-title"'));
    assert.ok(html.includes('AI Drafting Assistance Consent'));
  });

  it('displays clear DPDPA and data minimization explanation', () => {
    const html = renderToString(React.createElement(AiConsentDialog, {
      isOpen: true,
      onConsent: () => {},
      onCancel: () => {},
    }));
    assert.ok(html.includes('Digital Personal Data Protection Act'));
    assert.ok(html.includes('Aadhaar'));
    assert.ok(html.includes('PAN numbers'));
    assert.ok(html.includes('I consent &amp; continue') || html.includes('I consent'));
    assert.ok(html.includes('Do not allow'));
  });

  it('manages consent state in storage', () => {
    // Mock localStorage for node environment
    const storage = new Map();
    globalThis.localStorage = {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, val) => storage.set(key, String(val)),
      removeItem: (key) => storage.delete(key),
    };

    assert.equal(configModule.hasUserConsented(), false);
    configModule.setUserConsent(true);
    assert.equal(configModule.hasUserConsented(), true);
    configModule.setUserConsent(false);
    assert.equal(configModule.hasUserConsented(), false);
  });
});
