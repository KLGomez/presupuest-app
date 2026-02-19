import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';

const Header = () => {
    const { selectedMonth, setSelectedMonth } = usePlanner();
    const { playClick } = useSound();

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
        <header className="flex items-center justify-between mb-4 py-3">
            <h1 className="text-2xl font-bold flex items-center gap-2 font-hand text-slate-700">
                📋 Planner de Gastos
            </h1>

            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-white/50">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold capitalize min-w-[140px] text-center font-hand text-lg text-slate-800">
                    {monthName}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    <ChevronRight size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
