import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

describe('AI Client & Safety Safeguards', () => {
  let vite;
  let clientModule;
  let mockAdapter;

  before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
    clientModule = await vite.ssrLoadModule('./src/api/ai/client.js');
    mockAdapter = await vite.ssrLoadModule('./src/api/ai/mockAdapter.js');
  });

  after(async () => {
    if (vite) await vite.close();
  });

  describe('Sensitive Personal Data Interception', () => {
    it('detects 12-digit Indian Aadhaar numbers and issues a blocking warning', () => {
      const text = 'My Aadhaar number is 5489 1234 5678, please include it.';
      const check = clientModule.checkSensitiveInformation(text);
      assert.equal(check.hasSensitiveData, true);
      assert.ok(check.warnings[0].includes('Aadhaar'));
    });

    it('detects Indian PAN numbers (ABCDE1234F) and warns the user', () => {
      const text = 'Invoice to PAN ABCDE1234F registered in Bangalore.';
      const check = clientModule.checkSensitiveInformation(text);
      assert.equal(check.hasSensitiveData, true);
      assert.ok(check.warnings[0].includes('PAN'));
    });

    it('detects bank account numbers and blocks input', () => {
      const text = 'Send wire transfer to bank account no: 9876543210123';
      const check = clientModule.checkSensitiveInformation(text);
      assert.equal(check.hasSensitiveData, true);
      assert.ok(check.warnings[0].includes('Bank account'));
    });

    it('permits safe contract descriptions and fee amounts', () => {
      const text = 'I am designing a website for Acme Corp with fee of ₹50,000 to be paid in 30 days.';
      const check = clientModule.checkSensitiveInformation(text);
      assert.equal(check.hasSensitiveData, false);
      assert.equal(check.warnings.length, 0);
    });
  });

  describe('Mock Intake Dialogue & Field Extraction', () => {
    it('extracts freelancer name, client name, fee, and scope accurately', async () => {
      const input = 'My name is Rahul Sharma and client is Acme Pvt Ltd. I will build mobile app for ₹80,000.';
      const res = await mockAdapter.mockIntakeChat({
        message: input,
        consent: true,
      });

      assert.ok(res.reply_text);
      assert.equal(res.extracted_fields.freelancer_name, 'Rahul Sharma');
      assert.equal(res.extracted_fields.client_name, 'Acme Pvt Ltd');
      assert.equal(res.extracted_fields.fee_amount, 80000);
      assert.ok(res.extracted_fields.scope_description.includes('build mobile app'));
      assert.ok(Array.isArray(res.missing_fields));
      assert.ok(typeof res.next_question === 'string');
      assert.equal(res.needs_legal_review, false);
    });

    it('detects high-risk covenants and flags needs_legal_review: true', async () => {
      const riskyInput = 'The client wants unlimited liability and a penalty of 50% for any delay.';
      const res = await mockAdapter.mockIntakeChat({
        message: riskyInput,
        consent: true,
      });

      assert.equal(res.needs_legal_review, true);
      assert.ok(res.reply_text.includes('Indian Contract Act') || res.reply_text.includes('advocate'));
    });
  });

  describe('AI Error Hierarchy', () => {
    it('creates structured error instances with codes', () => {
      const baseErr = new clientModule.AiError('Network down', 'NETWORK_ERR', 502);
      assert.equal(baseErr.code, 'NETWORK_ERR');
      assert.equal(baseErr.status, 502);

      const unconfigured = new clientModule.AiNotConfiguredError();
      assert.equal(unconfigured.code, 'AI_NOT_CONFIGURED');
      assert.equal(unconfigured.status, 503);

      const consentErr = new clientModule.AiConsentRequiredError();
      assert.equal(consentErr.code, 'CONSENT_REQUIRED');
      assert.equal(consentErr.status, 400);
    });
  });
});
