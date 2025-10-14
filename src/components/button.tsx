import React, { type ReactNode } from 'react';

type ButtonProps = React.ComponentProps<'button'> & {
    children: ReactNode;
    className?: string;
};

function Button({ children, className = '', ...props }: ButtonProps) {
    const baseStyles = 'h-12 rounded font-bold text-white transition py-2 px-4';
    const variantStyles = 'bg-indigo-600 hover:bg-indigo-700';

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            {...props}
        >
            <div className="flex justify-center items-center w-full">
                {children}
            </div>
        </button>
    );
}

export default Button;