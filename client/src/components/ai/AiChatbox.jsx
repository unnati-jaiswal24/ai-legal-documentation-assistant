import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Scale,
  X,
  Minimize2,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Info,
} from 'lucide-react';
import Button from '../Button';
import SafeMarkdown from './SafeMarkdown';
import AiStatusIndicator from './AiStatusIndicator';
import AiConsentDialog from './AiConsentDialog';
import useAiAssistant, { MAX_MESSAGE_LENGTH } from '../../hooks/useAiAssistant';

export default function AiChatbox({
  isOpen = true,
  onClose = null,
  draftId = null,
  onFieldsExtracted = null,
  isDocked = false,
  title = 'AI Drafting Assistant',
}) {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(!isDocked);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    loading,
    error,
    aiStatus,
    showConsentModal,
    setShowConsentModal,
    grantConsent,
    sendMessage,
    retryLastMessage,
    resetConversation,
    sensitiveWarning,
    clearSensitiveWarning,
  } = useAiAssistant({ draftId, onFieldsExtracted });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    const textToSend = inputText;
    setInputText('');
    clearSensitiveWarning();
    sendMessage(textToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputText(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <>
      <AiConsentDialog
        isOpen={showConsentModal}
        onConsent={grantConsent}
        onCancel={() => setShowConsentModal(false)}
      />

      <aside
        className={`${
          isDocked
            ? 'fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#dde1d8] bg-white shadow-2xl dark:border-[#323f33] dark:bg-[#182119]'
            : 'flex h-full w-full flex-col border-l border-[#e4e7df] bg-[#fbfbf8] dark:border-[#2f3a30] dark:bg-[#171f18]'
        } flex flex-col overflow-hidden transition-all`}
        aria-label="AI Drafting Assistant Chat"
      >
        {/* Chatbox Header */}
        <header className="flex items-center justify-between border-b border-[#e6e8e1] bg-white px-4 py-3.5 dark:border-[#2e392f] dark:bg-[#1b241c]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eff4ee] text-[#31583b] dark:bg-[#253627] dark:text-[#a8dcae]">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-[#29332a] dark:text-[#e8ece6]">{title}</h2>
                <AiStatusIndicator status={aiStatus} showLabel={false} />
              </div>
              <p className="text-[10px] text-[#788177] dark:text-[#9ea89d]">
                Guided intake & contract reasoning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={resetConversation}
                className="rounded-lg p-1.5 text-[#7c857b] hover:bg-[#eff1ec] dark:text-[#9fa89e] dark:hover:bg-[#253026]"
                aria-label="Clear conversation history"
                title="Start new conversation"
              >
                <RotateCcw size={14} />
              </button>
            )}
            {isDocked && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="rounded-lg p-1.5 text-[#7c857b] hover:bg-[#eff1ec] dark:text-[#9fa89e] dark:hover:bg-[#253026]"
                aria-label={isExpanded ? 'Collapse chatbox' : 'Expand chatbox'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[#7c857b] hover:bg-[#eff1ec] dark:text-[#9fa89e] dark:hover:bg-[#253026]"
                aria-label="Close assistant panel"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {(!isDocked || isExpanded) && (
          <>
            {/* Persistent Disclaimer Banner */}
            <div className="border-b border-[#e9ece4] bg-[#f5f7f3] px-3.5 py-2 text-[10px] leading-4 text-[#6c766b] dark:border-[#2b362c] dark:bg-[#1d271e] dark:text-[#9da69c]">
              <div className="flex items-start gap-1.5">
                <Scale size={12} className="shrink-0 mt-0.5 text-[#4a6f50]" aria-hidden="true" />
                <span>
                  <strong>Notice:</strong> AI provides drafting assistance, not legal advice. Binding clauses are assembled from reviewed templates.
                </span>
              </div>
            </div>

            {/* Unconfigured / Disabled State */}
            {aiStatus === 'not_configured' ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff1ed] text-[#717b70] dark:bg-[#252f26] dark:text-[#9fa99e]">
                  <Info size={24} />
                </div>
                <h3 className="text-sm font-semibold text-[#29332a] dark:text-[#e8ece6]">
                  AI assistant is not configured yet
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#6c766b] dark:text-[#a0a99f]">
                  The platform is running in safe mode. You can still complete and generate agreements using our verified questionnaire forms and templates.
                </p>
                <p className="mt-4 text-[11px] text-[#838c82] dark:text-[#8f998e]">
                  When an administrator configures the backend AI key, interactive intake will activate automatically.
                </p>
              </div>
            ) : (
              <>
                {/* Message Scroll Area */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  role="log"
                  aria-live="polite"
                  aria-label="Conversation messages"
                  style={{ maxHeight: isDocked ? '380px' : 'calc(100vh - 240px)', minHeight: '260px' }}
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4ee] text-[#31583b] dark:bg-[#253627] dark:text-[#a8dcae]">
                        <Sparkles size={20} />
                      </span>
                      <h3 className="mt-3 text-xs font-semibold text-[#29332a] dark:text-[#e8ece6]">
                        Indian Freelance Agreement Intake
                      </h3>
                      <p className="mt-1.5 max-w-xs text-xs text-[#757e74] dark:text-[#9fa99e]">
                        Tell me about the parties, services, payment, or timelines, and I will help capture the right terms.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        {[
                          'I am drafting a web design contract for ₹75,000.',
                          'Who owns the intellectual property after payment?',
                          'Include a 30-day payment term and mutual NDA.',
                        ].map((promptText) => (
                          <button
                            key={promptText}
                            type="button"
                            onClick={() => handleSuggestedQuestion(promptText)}
                            className="rounded-full border border-[#dde2d8] bg-white px-2.5 py-1 text-[11px] text-[#4d564c] transition-colors hover:border-[#40714c] hover:bg-[#edf5ee] dark:border-[#313f32] dark:bg-[#1f2820] dark:text-[#c4cec3] dark:hover:border-[#40714c]"
                          >
                            {promptText}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        {/* Bubble */}
                        <div
                          className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                            msg.role === 'user'
                              ? 'bg-[#31583b] text-white dark:bg-[#779779] dark:text-[#101a12]'
                              : 'border border-[#e1e5dd] bg-white text-[#29332a] dark:border-[#323f33] dark:bg-[#1d261e] dark:text-[#e8ece6]'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#40714c] dark:text-[#a5d8ac]">
                              <Sparkles size={11} />
                              AI-generated
                            </div>
                          )}

                          <SafeMarkdown content={msg.content} />

                          {/* Extracted Fields Summary */}
                          {msg.extracted_fields && Object.keys(msg.extracted_fields).length > 0 && (
                            <div className="mt-3 border-t border-[#e3e7df] pt-2 dark:border-[#2f3d30]">
                              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6a7569] dark:text-[#9ba69a] mb-1">
                                Fields Captured:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(msg.extracted_fields).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="inline-flex items-center gap-1 rounded bg-[#edf4ee] px-2 py-0.5 text-[10px] font-medium text-[#2f5538] dark:bg-[#253627] dark:text-[#b0dfb6]"
                                  >
                                    <CheckCircle2 size={10} />
                                    <strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Still Missing Checklist */}
                          {msg.missing_fields && msg.missing_fields.length > 0 && (
                            <div className="mt-2.5 rounded-lg bg-[#f8f9f6] p-2 dark:bg-[#222c23]">
                              <span className="block text-[10px] font-semibold text-[#667265] dark:text-[#9ea99d] mb-1">
                                Still needed for complete agreement:
                              </span>
                              <ul className="space-y-0.5">
                                {msg.missing_fields.map((field) => (
                                  <li key={field} className="flex items-center gap-1 text-[10px] text-[#6d776c] dark:text-[#a2aca1]">
                                    <span className="h-1 w-1 rounded-full bg-[#8b948a]" />
                                    <span>{field}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Suggested Next Question Action */}
                          {msg.next_question && (
                            <div className="mt-3 border-t border-[#e3e7df] pt-2 dark:border-[#2f3d30]">
                              <button
                                type="button"
                                onClick={() => handleSuggestedQuestion(msg.next_question)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3b6644] hover:underline dark:text-[#a0d6a7]"
                              >
                                <HelpCircle size={12} />
                                Suggested prompt: &ldquo;{msg.next_question}&rdquo;
                              </button>
                            </div>
                          )}

                          {/* Lawyer Review Prompt */}
                          {msg.needs_legal_review && (
                            <div className="mt-3 rounded-lg border border-[#eecda0] bg-[#fffbf2] p-2.5 text-[11px] text-[#86511a] dark:border-[#523c21] dark:bg-[#2c2014] dark:text-[#f2ca9f]">
                              <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                                <AlertTriangle size={13} className="shrink-0" />
                                Consult an Advocate
                              </div>
                              <p className="leading-4">
                                This response involves clauses (such as uncapped liability, non-compete, or penalty fees) that may be void or restricted under Section 27 of the Indian Contract Act. We recommend review by a qualified legal professional.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Loading / Typing indicator */}
                  {loading && (
                    <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-[#6e776d] shadow-xs dark:bg-[#1d261e] dark:text-[#a0aba0]">
                      <Sparkles size={14} className="animate-spin text-[#40714c]" />
                      <span>Assistant is reviewing agreement logic...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Error Banner with Retry */}
                {error && (
                  <div className="border-t border-[#f0c3be] bg-[#fff5f4] px-4 py-2.5 text-xs text-[#8c2b22] dark:border-[#532b27] dark:bg-[#2d1715] dark:text-[#f29f98]">
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{error}</span>
                      <Button size="sm" variant="outline" onClick={retryLastMessage} className="shrink-0">
                        <RotateCcw size={12} /> Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sensitive Personal ID Warning Banner */}
                {sensitiveWarning && (
                  <div className="border-t border-[#fad6a5] bg-[#fffcf5] px-4 py-2 text-xs text-[#86511a] dark:border-[#5a4220] dark:bg-[#2a1f12] dark:text-[#f0c493]">
                    <div className="flex items-start gap-1.5">
                      <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-[11px]">Sensitive ID Detected</p>
                        <p className="text-[10px] leading-4">{sensitiveWarning}</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSensitiveWarning}
                        className="text-[#86511a] hover:opacity-75 dark:text-[#f0c493]"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <footer className="border-t border-[#e6e8e1] bg-white p-3 dark:border-[#2e392f] dark:bg-[#1b241c]">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={MAX_MESSAGE_LENGTH}
                      rows={2}
                      placeholder="Ask about terms or describe your agreement details..."
                      aria-label="Type your drafting question or agreement details"
                      className="w-full resize-none rounded-xl border border-[#dde1d8] bg-[#f9faf7] p-2.5 pr-10 text-xs text-[#29332a] placeholder-[#879086] transition-colors focus:border-[#40714c] focus:bg-white focus:outline-hidden dark:border-[#334034] dark:bg-[#202921] dark:text-[#e8ece6] dark:placeholder-[#7a8579] dark:focus:border-[#40714c]"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!inputText.trim() || loading}
                      className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#31583b] text-white transition-opacity hover:bg-[#26472e] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#779779] dark:text-[#101a12]"
                      aria-label="Send message"
                    >
                      <Send size={13} />
                    </button>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#868f84] dark:text-[#8d968b]">
                    <span>Enter to send · Shift+Enter for newline</span>
                    <span className={inputText.length > MAX_MESSAGE_LENGTH * 0.9 ? 'text-[#a3382c] font-semibold' : ''}>
                      {inputText.length} / {MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </footer>
              </>
            )}
          </>
        )}
      </aside>
    </>
  );
}
