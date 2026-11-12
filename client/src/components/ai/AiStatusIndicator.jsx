import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getAiConfigStatus } from '../../api/ai/config';

export default function AiStatusIndicator({ status = null, className = '', showLabel = true }) {
  const currentStatus = status || getAiConfigStatus();

  const configs = {
    configured: {
      label: 'AI Connected',
      title: 'AI assistant is connected and ready to assist.',
      icon: CheckCircle2,
      dotClass: 'bg-[#40714c]',
      badgeClass: 'bg-[#edf5ee] text-[#31583b] border-[#c2dec6] dark:bg-[#1f2f22] dark:text-[#a5d8ac] dark:border-[#2f4f34]',
    },
    mock: {
      label: 'Mock Mode',
      title: 'AI is running with simulated responses (offline safe mode).',
      icon: Sparkles,
      dotClass: 'bg-[#c58b68]',
      badgeClass: 'bg-[#fcf5ef] text-[#8e522d] border-[#ebd4c4] dark:bg-[#34241a] dark:text-[#f3bfa0] dark:border-[#52392b]',
    },
    not_configured: {
      label: 'Not Configured',
      title: 'AI assistant is not configured on this deployment. Manual drafting remains available.',
      icon: AlertCircle,
      dotClass: 'bg-[#8c9489]',
      badgeClass: 'bg-[#f1f2ee] text-[#61685e] border-[#dcded7] dark:bg-[#252a25] dark:text-[#9ea69b] dark:border-[#384038]',
    },
    error: {
      label: 'AI Unavailable',
      title: 'AI service encountered an error or reached its rate limit.',
      icon: ShieldAlert,
      dotClass: 'bg-[#b34033]',
      badgeClass: 'bg-[#fdf0ee] text-[#8a2920] border-[#f0c3be] dark:bg-[#341b18] dark:text-[#f29f98] dark:border-[#532b27]',
    },
  };

  const active = configs[currentStatus] || configs.not_configured;
  const Icon = active.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${active.badgeClass} ${className}`}
      title={active.title}
      aria-label={`AI status: ${active.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active.dotClass}`} aria-hidden="true" />
      <Icon size={12} className="shrink-0" aria-hidden="true" />
      {showLabel && <span>{active.label}</span>}
    </span>
  );
}
