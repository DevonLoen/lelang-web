import React from 'react';

type FilterButtonProps = React.ComponentProps<'button'> & {
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
};

function FilterButton({ children, className = '', isActive, ...props }: FilterButtonProps) {
    const baseStyles = 'hover:bg-gray-50 transition duration-300 ease-in-out w-full text-sm font-medium py-2 px-4 rounded-md';

    return (
        <button
            className={`${baseStyles} ${className} ${isActive ? "bg-white text-indigo-600 shadow-md" : ""}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default FilterButton;