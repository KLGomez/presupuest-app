import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';

const Almanac = () => {
    const { selectedMonth, data, setActiveTab } = usePlanner();
    const { playClick } = useSound();

    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startOffset }, (_, i) => i);

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const getDayInfo = (day) => {
        const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const maturities = (data.maturities || []).filter(m => m.date === dateStr);
        const hasPending = maturities.some(m => m.status === 'pending');
        const hasAny = maturities.length > 0;
        return { hasPending, hasAny };
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-hand font-bold text-base text-slate-700">📅 Vencimientos</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {monthNames[month - 1]} {year}
                </span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <span key={`${d}-${i}`} className="text-[10px] font-bold text-slate-400 py-1">{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`b-${b}`} />)}
                {days.map(day => {
                    const { hasPending, hasAny } = getDayInfo(day);
                    return (
                        <div
                            key={day}
                            className={`
                                min-h-[36px] sm:min-h-[40px] aspect-square flex items-center justify-center text-xs font-bold cursor-pointer rounded-lg relative transition-all active:scale-95
                                ${hasPending ? 'hand-circle text-red-600' : hasAny ? 'text-emerald-600 bg-emerald-50 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}
                            `}
                            onClick={() => { playClick(); setActiveTab('calendar'); }}
                            title={hasAny ? 'Ver vencimientos' : ''}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Almanac;
