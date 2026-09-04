import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';

const Header = () => {
    const { selectedMonth, setSelectedMonth } = usePlanner();
    const { playClick, toggleMute, isMuted } = useSound();

    const handlePrevMonth = () => {
        playClick();
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 2, 1);
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        playClick();
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month, 1);
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const [year, month] = selectedMonth.split('-');
    const dateObj = new Date(year, month - 1);
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(dateObj);

    return (
        <header className="flex items-center justify-between gap-3 mb-3 py-1">
            <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-1.5 font-hand text-slate-700 tracking-tight">
                    📋 Planner
                </h1>
                {/* Mobile sound toggle */}
                <button
                    onClick={toggleMute}
                    className="md:hidden touch-target rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
                    title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            <div className="flex items-center bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-slate-200/60">
                <button
                    onClick={handlePrevMonth}
                    className="touch-target rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    aria-label="Mes anterior"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold capitalize min-w-[120px] sm:min-w-[140px] text-center font-hand text-base sm:text-lg text-slate-800 select-none">
                    {monthName}
                </span>
                <button
                    onClick={handleNextMonth}
                    className="touch-target rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    aria-label="Mes siguiente"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
