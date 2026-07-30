import { motion } from "framer-motion";

function Card({
    children,
    className = "",
    hover = true,
}) {
    return (
        <motion.div
            whileHover={
                hover
                    ? {
                          y: -5,
                          scale: 1.01,
                      }
                    : {}
            }
            transition={{
                duration: 0.2,
            }}
            className={`
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/80
                backdrop-blur-lg
                shadow-lg
                p-6
                transition-all
                duration-300
                hover:border-cyan-500/40
                hover:shadow-cyan-500/10
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
}

export default Card;