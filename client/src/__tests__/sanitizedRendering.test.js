import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

describe('SafeMarkdown Sanitized Rendering', () => {
  let vite;
  let SafeMarkdown;

  before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
    const mod = await vite.ssrLoadModule('./src/components/ai/SafeMarkdown.jsx');
    SafeMarkdown = mod.default;
  });

  after(async () => {
    if (vite) await vite.close();
  });

  it('renders plain text safely without innerHTML', () => {
    const html = renderToString(React.createElement(SafeMarkdown, { content: 'Draft agreement for Indian freelancer' }));
    assert.ok(html.includes('Draft agreement for Indian freelancer'));
    assert.ok(!html.includes('dangerouslySetInnerHTML'));
  });

  it('escapes and neutralizes HTML tags and scripts (XSS prevention)', () => {
    const malicious = '<script>alert("xss")</script><img src="x" onerror="stealCookies()">';
    const html = renderToString(React.createElement(SafeMarkdown, { content: malicious }));
    assert.ok(html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
    assert.ok(html.includes('&lt;img src=&quot;x&quot; onerror=&quot;stealCookies()&quot;&gt;'));
    assert.ok(!html.includes('<script>'));
  });

  it('renders bold markdown formatting properly', () => {
    const content = 'This is **essential** for legal validity.';
    const html = renderToString(React.createElement(SafeMarkdown, { content }));
    assert.ok(html.includes('<strong'));
    assert.ok(html.includes('essential</strong>'));
  });

  it('renders bulleted lists correctly', () => {
    const content = 'Checklist:\n- Parties defined\n- Payment milestones\n- Termination notice';
    const html = renderToString(React.createElement(SafeMarkdown, { content }));
    assert.ok(html.includes('<ul'));
    assert.ok(html.includes('<li>Parties defined</li>') || html.includes('Parties defined'));
    assert.ok(html.includes('Payment milestones'));
  });

  it('renders inline code formatting safely', () => {
    const content = 'Use the field `effective_date` in the agreement.';
    const html = renderToString(React.createElement(SafeMarkdown, { content }));
    assert.ok(html.includes('<code'));
    assert.ok(html.includes('effective_date</code>'));
  });
});
