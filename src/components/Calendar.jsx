import { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';
import { EXPENSE_TYPES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import NoteCard from './ui/NoteCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, AlertCircle, ArrowRight } from 'lucide-react';

const Calendar = () => {
    const { selectedMonth, data, addMaturity, toggleMaturityStatus, deleteMaturity, setExpenseToPrefill, setActiveTab } = usePlanner();
    const { playClick, playScribble, playSuccess } = useSound();
    const [selectedDay, setSelectedDay] = useState(null);

    // Calendar Generation
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun

    // Adjust so Monday is first day if desired, but sticking to Sun for standard grid for now
    // Let's make Monday first day for better "Planner" feel
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startOffset }, (_, i) => i);

    // Form State
    const [formData, setFormData] = useState({
        service: '',
        amount: '',
        type: EXPENSE_TYPES[0].id
    });

    const handleDayClick = (day) => {
        playClick();
        setSelectedDay(day);
        setFormData({ service: '', amount: '', type: EXPENSE_TYPES[0].id });
    };

    const handleSaveMaturity = (e) => {
        e.preventDefault();
        if (!formData.service || !formData.amount) return;

        playScribble();
        addMaturity({
            ...formData,
            amount: parseFloat(formData.amount),
            date: `${selectedMonth}-${String(selectedDay).padStart(2, '0')}`
        });
        setSelectedDay(null);
    };

    const handleConvertToExpense = (maturity) => {
        playClick();
        setExpenseToPrefill({
            amount: maturity.amount,
            description: maturity.service,
            type: maturity.type,
            date: maturity.date
        });
        setActiveTab('expenses');
    };

    const getDayMaturities = (day) => {
        const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        return (data.maturities || []).filter(m => m.date === dateStr);
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() + 1 === month &&
            today.getFullYear() === year;
    };

    const isPast = (day) => {
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className="max-w-4xl mx-auto pb-6 relative">
            <NoteCard color="white" type="taped" className="min-h-[600px] overflow-visible">
                <h2 className="text-2xl font-bold font-hand text-slate-700 mb-6 flex items-center justify-between">
                    <span>📅 Vencimientos: {selectedMonth}</span>
                    <div className="text-xs font-sans text-slate-400 font-normal">
                        Click en un día para agregar
                    </div>
                </h2>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="text-center font-hand font-bold text-slate-500 py-2 border-b-2 border-slate-100">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(80px,1fr)] gap-1 md:gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    {blanks.map(b => (
                        <div key={`blank-${b}`} className="bg-transparent" />
                    ))}

                    {days.map(day => {
                        const maturities = getDayMaturities(day);
                        const isDayPast = isPast(day);
                        const hasPending = maturities.some(m => m.status === 'pending');
                        const isAlert = isDayPast && hasPending;
                        const isCurrentDay = isToday(day);

                        return (
                            <div
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`
                                relative p-1 md:p-2 rounded-md border text-left transition-all cursor-pointer group hover:shadow-md
                                ${isCurrentDay ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}
                            `}
                            >
                                <span className={`
                                font-hand font-bold text-lg leading-none block
                                ${isCurrentDay ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                            `}>
                                    {day}
                                </span>

                                {/* Alert Logic */}
                                {isAlert && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="absolute top-1 right-1 text-red-500"
                                    >
                                        <AlertCircle size={14} />
                                    </motion.div>
                                )}

                                {/* Dots/Stickers */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {maturities.map(m => {
                                        const typeColor = EXPENSE_TYPES.find(t => t.id === m.type)?.color || '#ccc';
                                        return (
                                            <div
                                                key={m.id}
                                                title={`${m.service} - ${formatCurrency(m.amount)} (${m.status})`}
                                                className={`w-2 h-2 rounded-full border border-black/10 ${m.status === 'paid' ? 'opacity-40' : ''}`}
                                                style={{ backgroundColor: m.status === 'paid' ? '#94a3b8' : typeColor }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </NoteCard>

            {/* Edit/View Day Popup (Sticky Note) */}
            <AnimatePresence>
                {selectedDay && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-sm w-full"
                        >
                            <NoteCard color="yellow" rotate={-2} type="taped" className="shadow-xl">
                                <div className="flex justify-between items-start mb-4 border-b border-yellow-200 pb-2">
                                    <h3 className="font-hand font-bold text-xl text-slate-700">
                                        Vencimientos del día {selectedDay}
                                    </h3>
                                    <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                                </div>

                                {/* List of Maturities for Day */}
                                <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto px-1">
                                    {getDayMaturities(selectedDay).map(m => (
                                        <div key={m.id} className={`p-2 rounded bg-white/60 border border-yellow-200 flex flex-col gap-2 ${m.status === 'paid' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold font-hand ${m.status === 'paid' ? 'line-through' : ''}`}>{m.service}</span>
                                                <span className="font-mono text-sm">{formatCurrency(m.amount)}</span>
                                            </div>

                                            <div className="flex justify-between items-center gap-2">
                                                <button
                                                    onClick={() => { playScribble(); toggleMaturityStatus(m.id); }}
                                                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide border ${m.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    {m.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                </button>

                                                {m.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConvertToExpense(m)}
                                                        className="flex items-center gap-1 text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 font-bold"
                                                        title="Registrar como Gasto en el Tracker"
                                                    >
                                                        Pagar <ArrowRight size={10} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {getDayMaturities(selectedDay).length === 0 && (
                                        <p className="text-center text-slate-400 text-sm italic py-2">Nada anotado aún...</p>
                                    )}
                                </div>

                                {/* Add New Maturity Form */}
                                <form onSubmit={handleSaveMaturity} className="bg-yellow-50 p-3 rounded border border-yellow-200/50">
                                    <input
                                        className="w-full bg-transparent border-b border-yellow-300 font-hand font-bold text-lg text-slate-700 placeholder:text-yellow-600/30 focus:outline-none mb-2"
                                        placeholder="Nombre (ej: Luz)"
                                        value={formData.service}
                                        onChange={e => setFormData({ ...formData, service: e.target.value })}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="number"
                                            className="w-1/2 bg-transparent border-b border-yellow-300 font-sans font-bold text-slate-700 placeholder:text-yellow-600/30 focus:outline-none"
                                            placeholder="$0.00"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                        <select
                                            className="w-1/2 bg-transparent border-b border-yellow-300 font-sans text-xs text-slate-600 focus:outline-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            {EXPENSE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-slate-800 text-white rounded py-1 font-hand font-bold text-sm hover:bg-slate-700 transition-colors">
                                        Anotar
                                    </button>
                                </form>
                            </NoteCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Calendar;
