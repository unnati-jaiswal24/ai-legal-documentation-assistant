import { call } from './client';

export function getQuestionnaireHelp(fieldKey) {
  return call('/ai/questionnaire-help', {
    method: 'POST',
    auth: false,
    body: {
      fieldKeys: [fieldKey],
      consent: true,
    },
  });
}

export function generateDraftReport(reportInput) {
  return call('/ai/report-content', {
    method: 'POST',
    auth: false,
    body: { ...reportInput, consent: true },
  });
}
