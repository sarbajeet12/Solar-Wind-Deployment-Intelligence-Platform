import { motion } from "framer-motion";

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition"
        >
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-slate-400 text-sm">
                        {title}
                    </p>

                    <h2 className="text-4xl font-bold text-white mt-2">
                        {value}
                    </h2>
                </div>

                <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}
                >
                    <Icon className="text-white" size={26} />
                </div>

            </div>
        </motion.div>
    );
}

export default StatCard;