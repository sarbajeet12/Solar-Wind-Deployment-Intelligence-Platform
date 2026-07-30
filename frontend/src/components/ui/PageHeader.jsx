import { motion } from "framer-motion";

function PageHeader({
    badge,
    title,
    subtitle,
    children,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
        >
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8 shadow-xl">

                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div>

                        {badge && (
                            <p className="uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                                {badge}
                            </p>
                        )}

                        <h1 className="mt-2 text-5xl font-extrabold text-white">
                            {title}
                        </h1>

                        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
                            {subtitle}
                        </p>

                    </div>

                    {children && (
                        <div>
                            {children}
                        </div>
                    )}

                </div>

            </div>
        </motion.div>
    );
}

export default PageHeader;