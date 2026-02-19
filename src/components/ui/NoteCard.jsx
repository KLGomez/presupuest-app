import { motion } from 'framer-motion';

const NoteCard = ({ children, className = '', rotate = 0, color = 'white', type = 'pinned', delay = 0 }) => {

    const getBackground = () => {
        switch (color) {
            case 'yellow': return 'bg-yellow-100';
            case 'blue': return 'bg-blue-100';
            case 'green': return 'bg-green-100';
            case 'pink': return 'bg-pink-100';
            case 'cream': return 'bg-cream';
            default: return 'bg-white';
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
            className={`relative p-6 ${getBackground()} paper-shadow ${className}`}
            style={{ borderRadius: '2px' }} // Slightly less rounded for paper feel
        >
            {/* Visual Fastener */}
            {type === 'pinned' && (
                <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 z-10 filter drop-shadow-sm">
                    {/* CSS Pin */}
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-700 shadow-inner"></div>
                    <div className="w-0.5 h-3 bg-slate-400 mx-auto -mt-1"></div>
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
