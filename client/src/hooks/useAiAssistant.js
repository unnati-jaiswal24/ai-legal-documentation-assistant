import { useState, useCallback } from 'react';
import {
  sendIntakeChat,
  checkSensitiveInformation,
  AiError,
  AiNotConfiguredError,
  AiConsentRequiredError,
} from '../api/ai/client';
import {
  getAiConfigStatus,
  hasUserConsented,
  setUserConsent,
  isAiEnabled,
} from '../api/ai/config';

export const MAX_MESSAGE_LENGTH = 1000;

export default function useAiAssistant({ draftId = null, onFieldsExtracted = null } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Read initial states safely
  const [aiStatus, setAiStatus] = useState(() => getAiConfigStatus());
  const [hasConsent, setHasConsent] = useState(() => hasUserConsented());
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [sensitiveWarning, setSensitiveWarning] = useState(null);

  const grantConsent = useCallback(() => {
    setUserConsent(true);
    setHasConsent(true);
    setShowConsentModal(false);
    setError(null);
  }, []);

  const revokeConsent = useCallback(() => {
    setUserConsent(false);
    setHasConsent(false);
  }, []);

  const clearSensitiveWarning = useCallback(() => {
    setSensitiveWarning(null);
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim()) return;
      const trimmed = text.trim();

      // Enforce character length limit
      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setError(`Message exceeds the maximum limit of ${MAX_MESSAGE_LENGTH} characters.`);
        return;
      }

      // Check for sensitive personal identifiers (Aadhaar, PAN, Bank Details)
      const sensitiveCheck = checkSensitiveInformation(trimmed);
      if (sensitiveCheck.hasSensitiveData) {
        setSensitiveWarning(sensitiveCheck.warnings[0]);
        return;
      }
      setSensitiveWarning(null);

      // Check config status
      if (!isAiEnabled()) {
        setError('The AI assistant is not configured yet. Drafting features remain available manually.');
        return;
      }

      // Check consent
      if (!hasUserConsented()) {
        setShowConsentModal(true);
        return;
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const response = await sendIntakeChat({
          draftId,
          message: trimmed,
          history: [...messages, userMessage],
          consent: true,
        });

        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply_text,
          extracted_fields: response.extracted_fields,
          missing_fields: response.missing_fields,
          next_question: response.next_question,
          needs_legal_review: Boolean(response.needs_legal_review),
          disclaimer: response.disclaimer,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Notify parent if fields were extracted
        if (response.extracted_fields && onFieldsExtracted) {
          onFieldsExtracted(response.extracted_fields);
        }
      } catch (err) {
        if (err instanceof AiConsentRequiredError) {
          setShowConsentModal(true);
        } else if (err instanceof AiNotConfiguredError) {
          setError(err.message);
          setAiStatus('not_configured');
        } else if (err instanceof AiError) {
          setError(err.message);
        } else {
          setError('Unable to reach the assistant. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [draftId, messages, onFieldsExtracted],
  );

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setSensitiveWarning(null);
  }, []);

  return {
    messages,
    loading,
    error,
    aiStatus,
    hasConsent,
    showConsentModal,
    setShowConsentModal,
    grantConsent,
    revokeConsent,
    sendMessage,
    retryLastMessage,
    resetConversation,
    sensitiveWarning,
    clearSensitiveWarning,
    MAX_MESSAGE_LENGTH,
  };
}
