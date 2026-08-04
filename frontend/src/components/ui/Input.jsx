import { forwardRef } from "react";

const Input = forwardRef(
    (
        {
            label,
            error,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}

                <input
                    ref={ref}
                    {...props}
                    className={`
                        w-full
                        rounded-xl
                        border
                        border-slate-700
                        bg-slate-800
                        px-4
                        py-3
                        text-white
                        placeholder:text-slate-500
                        outline-none
                        transition-all
                        duration-300
                        focus:border-cyan-500
                        focus:ring-2
                        focus:ring-cyan-500/20
                        ${className}
                    `}
                />

                {error && (
                    <p className="mt-2 text-sm text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;