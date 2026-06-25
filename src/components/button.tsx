import React, { type ReactNode } from 'react';

type ButtonProps = React.ComponentProps<'button'> & {
    children: ReactNode;
    className?: string;
};

function Button({ children, className = '', ...props }: ButtonProps) {
    const baseStyles = 'inline-flex h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
    const variantStyles = 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.98]';

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            {...props}
        >
            <div className="flex justify-center items-center gap-2 w-full">
                {children}
            </div>
        </button>
    );
}

export default Button;
