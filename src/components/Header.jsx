import { ChevronLeft, ChevronRight, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const { selectedMonth, setSelectedMonth } = usePlanner();
    const { playClick, toggleMute, isMuted } = useSound();
    const { isDark, toggleTheme } = useTheme();

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
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 py-1">
            {/* Top row on mobile / Left on desktop */}
            <div className="flex items-center justify-between w-full md:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 font-hand text-slate-800 dark:text-slate-100 tracking-tight">
                    📋 Planner
                </h1>

                {/* Quick actions (Theme toggle & Sound toggle) */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={toggleTheme}
                        className="touch-target rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-xs"
                        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    >
                        {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
                    </button>

                    <button
                        onClick={toggleMute}
                        className="touch-target rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-xs"
                        title={isMuted ? 'Activar sonido' : 'Silenciar'}
                        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Month Selector: Full-width on mobile (w-full), self-contained on desktop */}
            <div className="flex items-center justify-between w-full md:w-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors">
                <button
                    onClick={handlePrevMonth}
                    className="touch-target rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    aria-label="Mes anterior"
                >
                    <ChevronLeft size={22} />
                </button>
                <span className="font-sans font-bold capitalize flex-1 md:flex-initial md:min-w-[150px] text-center text-base sm:text-lg text-slate-800 dark:text-slate-100 select-none px-3">
                    {monthName}
                </span>
                <button
                    onClick={handleNextMonth}
                    className="touch-target rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    aria-label="Mes siguiente"
                >
                    <ChevronRight size={22} />
                </button>
            </div>
        </header>
    );
};

export default Header;
