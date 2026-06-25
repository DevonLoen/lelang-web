import React from 'react';

type FilterButtonProps = React.ComponentProps<'button'> & {
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
};

function FilterButton({ children, className = '', isActive, ...props }: FilterButtonProps) {
    const baseStyles = 'w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2';

    return (
        <button
            className={`${baseStyles} ${className} ${isActive ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white/70 hover:text-slate-950"}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default FilterButton;
