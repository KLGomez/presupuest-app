import { motion } from 'framer-motion';

const NoteCard = ({ children, className = '', rotate = 0, color = 'white', type = 'pinned', delay = 0 }) => {

    const getBackground = () => {
        switch (color) {
            case 'yellow':
                return 'bg-yellow-100 dark:bg-amber-950/40 dark:border dark:border-amber-700/50 text-slate-800 dark:text-amber-50';
            case 'blue':
                return 'bg-blue-100 dark:bg-blue-950/40 dark:border dark:border-blue-700/50 text-slate-800 dark:text-blue-50';
            case 'green':
                return 'bg-green-100 dark:bg-emerald-950/40 dark:border dark:border-emerald-700/50 text-slate-800 dark:text-emerald-50';
            case 'pink':
                return 'bg-pink-100 dark:bg-rose-950/40 dark:border dark:border-rose-700/50 text-slate-800 dark:text-rose-50';
            case 'cream':
                return 'bg-cream dark:bg-slate-900/90 dark:border dark:border-slate-800 text-slate-800 dark:text-slate-100';
            default:
                return 'bg-white dark:bg-slate-900/90 dark:border dark:border-slate-800 text-slate-800 dark:text-slate-100';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: rotate }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: delay
            }}
            className={`relative p-4 sm:p-6 ${getBackground()} paper-shadow rounded-2xl transition-colors ${className}`}
        >
            {/* Visual Fastener */}
            {type === 'pinned' && (
                <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 z-10 filter drop-shadow-sm">
                    {/* CSS Pin */}
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-700 shadow-inner"></div>
                    <div className="w-0.5 h-3 bg-slate-400 dark:bg-slate-600 mx-auto -mt-1"></div>
                </div>
            )}

            {type === 'taped' && (
                <div className="tape-top"></div>
            )}

            {children}
        </motion.div>
    );
};

export default NoteCard;
