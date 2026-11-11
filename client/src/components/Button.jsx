export default function Button({ as: Element = 'button', children, variant = 'primary', size = 'md', className = '', onClick, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 disabled:pointer-events-none disabled:opacity-55';
  
  const variants = {
    primary: 'bg-[#31583b] text-white shadow-sm hover:bg-[#284b32] focus-visible:outline-[#31583b] dark:bg-[#779779] dark:text-[#101a12] dark:hover:bg-[#8eaa8f]',
    secondary: 'bg-[#edf0e9] text-[#3d4c3e] hover:bg-[#e2e8de] focus-visible:outline-[#55775d] dark:bg-[#29352b] dark:text-[#dfe6dc] dark:hover:bg-[#344237]',
    gradient: 'bg-[#31583b] text-white shadow-sm hover:bg-[#284b32] focus-visible:outline-[#31583b]',
    outline: 'border border-[#dfe2d9] bg-white text-[#465147] hover:border-[#c5d0c3] hover:bg-[#f8f9f6] focus-visible:outline-[#55775d] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#d4dbd2] dark:hover:bg-[#242d25]',
  };

  const sizes = {
    sm: 'min-h-9 px-4 py-2 text-xs',
    md: 'min-h-11 px-5 py-2.5 text-sm',
    lg: 'min-h-12 px-6 py-3 text-sm',
  };

  return (
    <Element
      type={Element === 'button' ? props.type || 'button' : undefined}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
}