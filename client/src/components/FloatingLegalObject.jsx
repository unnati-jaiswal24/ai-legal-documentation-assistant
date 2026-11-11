import { motion, useReducedMotion, useTransform } from 'framer-motion';

const palette = {
  sage: {
    card: 'border-[#d4dfd1] bg-[#edf3e9]',
    icon: 'bg-[#dce8d9] text-[#45674c]',
    text: 'text-[#4d634f]',
  },
  stone: {
    card: 'border-[#dfded5] bg-[#f0efe8]',
    icon: 'bg-white/80 text-[#697368]',
    text: 'text-[#62685f]',
  },
  butter: {
    card: 'border-[#e8dfb7] bg-[#faf4d9]',
    icon: 'bg-[#f1e7b5] text-[#857446]',
    text: 'text-[#74663e]',
  },
  rose: {
    card: 'border-[#ead6d0] bg-[#f8ece8]',
    icon: 'bg-white/80 text-[#a66e62]',
    text: 'text-[#815c55]',
  },
  blue: {
    card: 'border-[#d1dce5] bg-[#eaf0f5]',
    icon: 'bg-white/80 text-[#54728a]',
    text: 'text-[#4d6576]',
  },
  lilac: {
    card: 'border-[#ded8e8] bg-[#f0edf5]',
    icon: 'bg-white/80 text-[#77698e]',
    text: 'text-[#655b76]',
  },
};

function ObjectArtwork({ object, colors }) {
  const Icon = object.Icon;

  if (object.kind === 'stamp' || object.kind === 'approved') {
    return (
      <div className={`saral-stamp flex aspect-square items-center justify-center rounded-full border-2 border-dashed ${colors.card} ${colors.text}`}>
        <div className="flex flex-col items-center gap-1">
          <Icon size={17} strokeWidth={1.6} />
          <span className="text-[8px] font-bold tracking-[0.12em]">{object.title}</span>
          <span className="text-[7px] opacity-70">{object.detail}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`saral-paper-card rounded-[10px] border p-2.5 shadow-[0_8px_24px_-17px_rgba(47,54,45,0.38)] ${colors.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${colors.icon}`}>
          <Icon size={12} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className={`truncate text-[9px] font-semibold leading-tight ${colors.text}`}>{object.title}</p>
          <p className="mt-0.5 truncate text-[7px] leading-tight text-[#84887f]">{object.detail}</p>
        </div>
      </div>
      {object.kind === 'agreement' || object.kind === 'employment' || object.kind === 'draft' || object.kind === 'template' ? (
        <div className="mt-2 space-y-1.5">
          <div className="h-px w-full bg-current opacity-10" />
          <div className="h-1 w-[82%] rounded-full bg-current opacity-10" />
          <div className="h-1 w-[65%] rounded-full bg-current opacity-10" />
        </div>
      ) : object.kind === 'notification' ? (
        <div className="mt-2 flex items-center gap-1.5 text-[7px] text-[#746987]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9a87b2]" /> Consider clarifying payment timing
        </div>
      ) : object.kind === 'pdf' ? (
        <div className="mt-2 flex items-center justify-between border-t border-current/10 pt-1.5 text-[7px] text-[#65788a]">
          <span>PDF · 2 pages</span>
          <span className="font-semibold">↓</span>
        </div>
      ) : object.kind === 'signature' ? (
        <div className="mt-2 border-b border-dashed border-current/20 pb-0.5 font-serif text-[13px] italic text-[#87784d]">
          {object.title}
        </div>
      ) : object.kind === 'clause' || object.kind === 'note' ? (
        <div className="mt-2 rounded-md bg-white/55 px-1.5 py-1 text-[7px] leading-tight text-[#786e50]">
          {object.detail}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1 text-[7px] text-[#627667]">
          <Icon size={9} /> {object.detail}
        </div>
      )}
    </div>
  );
}

export default function FloatingLegalObject({ object, progress, index }) {
  const reduceMotion = useReducedMotion();
  const x = useTransform(progress, [0, 0.48, 0.82, 1], ['0vw', object.gatherX, `${parseFloat(object.gatherX) * 0.78}vw`, `${parseFloat(object.gatherX) * 0.52}vw`]);
  const y = useTransform(progress, [0, 0.48, 0.82, 1], ['0vh', object.gatherY, `${parseFloat(object.gatherY) * 0.7}vh`, `${parseFloat(object.gatherY) * 0.44}vh`]);
  const scale = useTransform(progress, [0, 0.46, 0.72, 1], [1, 0.82, 0.56, 0.18]);
  const rotate = useTransform(progress, [0, 0.5, 1], [object.rotation, object.rotation * -0.22, object.rotation * -0.5]);
  const opacity = useTransform(progress, [0, 0.55, 0.82, 1], [1, 1, 0.66, 0.18]);
  const colors = palette[object.color];
  const cssVariables = {
    '--hero-left': object.left,
    '--hero-top': object.top,
    '--hero-mobile-left': object.mobileLeft,
    '--hero-mobile-top': object.mobileTop,
    '--float-drift': `${object.drift}px`,
    '--float-duration': `${object.duration}s`,
    '--float-delay': `${object.delay}s`,
  };

  return (
    <motion.div
      aria-hidden="true"
      style={{ ...cssVariables, x: reduceMotion ? 0 : x, y: reduceMotion ? 0 : y, scale: reduceMotion ? 1 : scale, rotate: reduceMotion ? 0 : rotate, opacity: reduceMotion ? 1 : opacity }}
      className="saral-floating-object absolute z-10"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.72, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.08 + index * 0.055, duration: reduceMotion ? 0 : 0.75, type: 'spring', stiffness: 72, damping: 17 }}
      >
        <div className={`saral-floating-inner ${reduceMotion ? '' : 'saral-object-float'}`}>
          <ObjectArtwork object={object} colors={colors} />
        </div>
      </motion.div>
    </motion.div>
  );
}
