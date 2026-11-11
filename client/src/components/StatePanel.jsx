import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="surface-card flex min-h-40 items-center justify-center gap-3 p-8 text-sm text-[#747c73] dark:text-[#adb6ab]" role="status">
      <LoaderCircle size={18} className="animate-spin text-[#55775d]" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="surface-card flex flex-col items-start gap-3 p-6" role="alert">
      <span className="flex items-center gap-2 text-sm font-semibold text-[#8d4e3e] dark:text-[#e3a18d]">
        <AlertCircle size={17} /> Something needs attention
      </span>
      <p className="text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="app-link text-sm font-medium">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="surface-card flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f3ed] text-[#688169] dark:bg-[#29352b] dark:text-[#abc2aa]">
        <SearchX size={19} />
      </span>
      <h2 className="mt-4 text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{title}</h2>
      {description && <p className="mt-2 max-w-md text-xs leading-5 text-[#7b837a] dark:text-[#aab3a9]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
