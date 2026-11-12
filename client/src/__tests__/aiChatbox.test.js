import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

describe('AI Chatbox Component States', () => {
  let vite;
  let AiChatbox;
  let AiStatusIndicator;

  before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
    const chatMod = await vite.ssrLoadModule('./src/components/ai/AiChatbox.jsx');
    AiChatbox = chatMod.default;
    const statusMod = await vite.ssrLoadModule('./src/components/ai/AiStatusIndicator.jsx');
    AiStatusIndicator = statusMod.default;
  });

  after(async () => {
    if (vite) await vite.close();
  });

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(React.createElement(AiChatbox, { isOpen: false }));
    assert.equal(html, '');
  });

  it('renders empty conversation state with starter prompts and disclaimer', () => {
    const html = renderToString(React.createElement(AiChatbox, {
      isOpen: true,
      title: 'Freelance Assistant',
    }));
    assert.ok(html.includes('Freelance Assistant'));
    assert.ok(html.includes('Notice:'));
    assert.ok(html.includes('AI provides drafting assistance, not legal advice'));
    assert.ok(html.includes('Indian Freelance Agreement Intake'));
    assert.ok(html.includes('0<!-- --> / <!-- -->1000') || html.includes('1000'));
    assert.ok(html.includes('Enter to send · Shift+Enter for newline'));
  });

  it('renders docked mode layout with toggle controls', () => {
    const html = renderToString(React.createElement(AiChatbox, {
      isOpen: true,
      isDocked: true,
      title: 'Docked Assistant',
    }));
    assert.ok(html.includes('fixed bottom-4 right-4'));
    assert.ok(html.includes('Collapse chatbox') || html.includes('Expand chatbox'));
  });

  it('renders status indicators for configured, mock, not_configured, and error states', () => {
    const configuredHtml = renderToString(React.createElement(AiStatusIndicator, { status: 'configured' }));
    assert.ok(configuredHtml.includes('AI Connected'));

    const mockHtml = renderToString(React.createElement(AiStatusIndicator, { status: 'mock' }));
    assert.ok(mockHtml.includes('Mock Mode'));

    const disabledHtml = renderToString(React.createElement(AiStatusIndicator, { status: 'not_configured' }));
    assert.ok(disabledHtml.includes('Not Configured'));

    const errorHtml = renderToString(React.createElement(AiStatusIndicator, { status: 'error' }));
    assert.ok(errorHtml.includes('AI Unavailable'));
  });
});
