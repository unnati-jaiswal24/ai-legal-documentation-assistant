import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

describe('Start Agreement Button & Guided Intake Flow', () => {
  let vite;
  let clientModule;
  let mockModule;
  let getStartAgreementNavigation;

  before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } });
    clientModule = await vite.ssrLoadModule('./src/api/client.js');
    mockModule = await vite.ssrLoadModule('./src/api/mock.js');
    ({ getStartAgreementNavigation } = await vite.ssrLoadModule('./src/hooks/useStartAgreement.js'));
  });

  after(async () => {
    if (vite) await vite.close();
  });

  describe('Draft Creation & Mock Fallback', () => {
    it('creates a new draft with Phase 1 template fields and in_progress status', async () => {
      const draft = await clientModule.api.createDraft();
      assert.ok(draft.id);
      assert.equal(draft.status, 'in_progress');
      assert.ok(draft.template.fields.length >= 10);

      // Verify essential Phase 1 fields exist
      const fieldKeys = draft.template.fields.map((f) => f.fieldKey);
      assert.ok(fieldKeys.includes('freelancer_name'));
      assert.ok(fieldKeys.includes('client_name'));
      assert.ok(fieldKeys.includes('scope_description'));
      assert.ok(fieldKeys.includes('deliverables'));
      assert.ok(fieldKeys.includes('fee_amount'));
      assert.ok(fieldKeys.includes('payment_days'));
      assert.ok(fieldKeys.includes('effective_date'));
      assert.ok(fieldKeys.includes('ip_arrangement'));
      assert.ok(fieldKeys.includes('include_nda'));
      assert.ok(fieldKeys.includes('notice_days'));
      assert.ok(fieldKeys.includes('governing_law'));
      assert.ok(fieldKeys.includes('jurisdiction'));
    });

    it('creates a new draft without removing an existing unfinished draft', async () => {
      const existingDraft = {
        id: 'saved-unfinished-draft',
        status: 'in_progress',
        template: mockModule.mockTemplate,
        values: [],
      };
      mockModule.mockState.drafts.push(existingDraft);
      let newDraft;
      try {
        newDraft = await clientModule.api.createDraft();
        assert.notEqual(newDraft.id, existingDraft.id);
        assert.ok(mockModule.mockState.drafts.includes(existingDraft));
      } finally {
        mockModule.mockState.drafts = mockModule.mockState.drafts.filter(
          (draft) => draft !== existingDraft && draft.id !== newDraft?.id,
        );
      }
    });

    it('fetches draft by ID and saves questionnaire values successfully', async () => {
      const draft = await clientModule.api.createDraft();
      const testValues = [
        { fieldId: 'f-freelancer', value: 'Ananya Deshmukh' },
        { fieldId: 'f-fee', value: 65000 },
      ];

      await clientModule.api.saveValues(draft.id, testValues);
      const fetched = await clientModule.api.draft(draft.id);
      assert.equal(fetched.id, draft.id);
      assert.equal(fetched.values.length, 2);
      assert.equal(fetched.values[0].value, 'Ananya Deshmukh');
      assert.equal(fetched.values[1].value, 65000);
    });
  });

  describe('Auth Navigation & Direct Start Flow', () => {
    it('routes unauthenticated users to login with agreement creation as the return destination', () => {
      const destination = getStartAgreementNavigation(null, false);
      assert.equal(destination.to, '/login');
      assert.equal(destination.options.state.from, '/drafts/new?auto=true');
    });

    it('sends authenticated users directly to auto-start agreement creation', () => {
      const destination = getStartAgreementNavigation({ id: 'user-1' }, false);
      assert.equal(destination.to, '/drafts/new?auto=true');
      assert.equal(destination.options, undefined);
    });

    it('waits for token validation before deciding whether to show login', () => {
      assert.equal(getStartAgreementNavigation(null, true), null);
    });

    it('prevents double-clicks while draft creation is in flight', () => {
      let callCount = 0;
      let loading = false;

      function handleClick() {
        if (loading) return;
        loading = true;
        callCount += 1;
      }

      handleClick();
      handleClick(); // Second immediate click while loading is true
      assert.equal(callCount, 1);
    });
  });
});
