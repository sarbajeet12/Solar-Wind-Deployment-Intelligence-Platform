import { motion } from "framer-motion";

function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
}) {
    const variants = {
        primary:
            "bg-blue-600 hover:bg-blue-500 text-white",

        secondary:
            "bg-slate-700 hover:bg-slate-600 text-white",

        success:
            "bg-emerald-600 hover:bg-emerald-500 text-white",

        danger:
            "bg-red-600 hover:bg-red-500 text-white",

        outline:
            "border border-slate-600 hover:border-blue-500 text-white bg-transparent",
    };

    return (
        <motion.button
            whileHover={{
                scale: disabled ? 1 : 1.03,
                y: disabled ? 0 : -2,
            }}
            whileTap={{
                scale: disabled ? 1 : 0.98,
            }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                px-5
                py-3
                font-medium
                shadow-lg
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </motion.button>
    );
}

export default Button;