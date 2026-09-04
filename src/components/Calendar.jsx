import { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';
import { EXPENSE_TYPES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import NoteCard from './ui/NoteCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, ArrowRight, Trash2, X } from 'lucide-react';

const TYPE_COLORS = {
    need: '#6366f1', // indigo
    want: '#ec4899', // pink
    savings: '#10b981', // emerald
    debt: '#f59e0b', // amber
};

const Calendar = () => {
    const {
        selectedMonth,
        data,
        addMaturity,
        toggleMaturityStatus,
        deleteMaturity,
        convertMaturityToExpense,
        setExpenseToPrefill,
    } = usePlanner();
    const { playClick, playScribble, playSuccess } = useSound();

    const [selectedDay, setSelectedDay] = useState(null);

    // ── Calendar grid calculation ──────────────────────────────────────────
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun
    // Monday-first offset
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startOffset }, (_, i) => i);

    // ── Form state ────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        service: '',
        amount: '',
        type: EXPENSE_TYPES[0].id,
    });

    // ── Helpers ────────────────────────────────────────────────────────────
    const getDayMaturities = (day) => {
        const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        return (data.maturities || []).filter(m => m.date === dateStr);
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() + 1 === month &&
            today.getFullYear() === year
        );
    };

    const isPast = (day) => {
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const getTypeColor = (type) =>
        TYPE_COLORS[type] ||
        EXPENSE_TYPES.find(t => t.id === type)?.color ||
        '#94a3b8';

    // ── Handlers ───────────────────────────────────────────────────────────
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
            date: `${selectedMonth}-${String(selectedDay).padStart(2, '0')}`,
        });
    };

    /**
     * "Convertir en Gasto Real":
     *  1. Registers the maturity as a real Expense (in the same month's data).
     *  2. Marks the maturity as "paid".
     *  3. Pre-fills the ExpenseTracker form so the user can review/edit before confirming.
     *  4. Navigates to the Expense Tracker panel.
     */
    const handleConvertToExpense = (maturity) => {
        playSuccess();
        // Atomically register expense + mark maturity paid
        convertMaturityToExpense(maturity);
        // Pre-fill tracker form — App.jsx useEffect will auto-open the panel
        setExpenseToPrefill({
            amount: maturity.amount,
            description: maturity.service,
            type: maturity.type,
            date: maturity.date,
        });
        // Close the day popup
        setSelectedDay(null);
    };

    const handleToggleStatus = (id) => {
        playScribble();
        toggleMaturityStatus(id);
    };

    const handleDelete = (id) => {
        playClick();
        deleteMaturity(id);
    };

    // ── Type label helper ──────────────────────────────────────────────────
    const getTypeLabel = (typeId) =>
        EXPENSE_TYPES.find(t => t.id === typeId)?.label || typeId;

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="w-full relative">
            <NoteCard color="white" type="taped" className="overflow-visible">
                <h2 className="text-xl sm:text-2xl font-bold font-hand text-slate-700 mb-4 sm:mb-6 flex items-center justify-between">
                    <span>📅 Vencimientos: {selectedMonth}</span>
                    <div className="text-xs font-sans text-slate-400 font-normal">
                        Toca un día para anotar
                    </div>
                </h2>

                {/* ── Day-of-week headers ── */}
                <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vié', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="text-center font-hand font-bold text-slate-500 py-1 sm:py-2 text-xs sm:text-sm border-b-2 border-neutral-200">
                            {d}
                        </div>
                    ))}
                </div>

                {/* ── Calendar grid ── */}
                <div className="w-full overflow-x-auto">
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-3 bg-neutral-50 p-2 sm:p-3 rounded-xl border border-neutral-200">
                        {blanks.map(b => (
                            <div key={`blank-${b}`} className="aspect-square min-w-[36px] sm:min-w-[42px]" />
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
                                    min-h-[52px] h-14 sm:h-20 md:h-24 relative rounded-xl border p-1 sm:p-2
                                    flex flex-col justify-between
                                    cursor-pointer transition hover:shadow-md active:scale-95
                                    text-xs sm:text-sm select-none
                                    ${isCurrentDay
                                            ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                                            : 'bg-white border-neutral-200 hover:bg-neutral-50'
                                        }
                                `}
                                >
                                    <span className={`
                                    font-hand font-bold text-base sm:text-lg leading-none block
                                    ${isCurrentDay ? 'text-blue-600 font-extrabold' : 'text-slate-500 group-hover:text-slate-700'}
                                `}>
                                        {day}
                                    </span>

                                    {/* Alert icon — pulsing if overdue + pending */}
                                    {isAlert && (
                                        <motion.div
                                            animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.4 }}
                                            className="absolute top-1 right-1 text-red-500"
                                        >
                                            <AlertCircle size={14} />
                                        </motion.div>
                                    )}

                                    {/* Maturity dots — color by type */}
                                    <div className="flex flex-wrap gap-[3px] mt-1">
                                        {maturities.map(m => (
                                            <div
                                                key={m.id}
                                                title={`${m.service} — ${formatCurrency(m.amount)} (${m.status === 'paid' ? 'Pagado' : 'Pendiente'})`}
                                                className={`w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full border border-black/10 transition-opacity ${m.status === 'paid' ? 'opacity-35' : ''}`}
                                                style={{ backgroundColor: m.status === 'paid' ? '#94a3b8' : getTypeColor(m.type) }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>{/* end overflow-x-auto */}
            </NoteCard>

            {/* ── Day popup ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedDay && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 20 }}
                            className="max-w-md w-full"
                        >
                            <NoteCard color="yellow" rotate={-1} type="taped" className="shadow-2xl">

                                {/* Header */}
                                <div className="flex justify-between items-center mb-4 border-b border-yellow-200 pb-2">
                                    <h3 className="font-hand font-bold text-lg sm:text-xl text-slate-700">
                                        📅 Día {selectedDay} de {selectedMonth}
                                    </h3>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="touch-target rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                                        aria-label="Cerrar modal de día"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Maturity list */}
                                <div className="space-y-2.5 mb-4 max-h-[42vh] overflow-y-auto pr-1">
                                    {getDayMaturities(selectedDay).map(m => {
                                        const color = getTypeColor(m.type);
                                        const isPaid = m.status === 'paid';
                                        return (
                                            <div
                                                key={m.id}
                                                className={`p-3 rounded-xl bg-white/80 border border-yellow-200 transition-opacity ${isPaid ? 'opacity-60' : ''}`}
                                            >
                                                {/* Row 1: dot + name + amount */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: isPaid ? '#94a3b8' : color }}
                                                    />
                                                    <span className={`font-bold font-hand text-base flex-1 ${isPaid ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                                        {m.service}
                                                    </span>
                                                    <span className="font-mono text-sm text-slate-700 font-bold">
                                                        {formatCurrency(m.amount)}
                                                    </span>
                                                </div>

                                                {/* Row 2: type badge + action buttons */}
                                                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1 border-t border-yellow-100">
                                                    <span
                                                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {getTypeLabel(m.type)}
                                                    </span>

                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                        {/* Toggle paid/pending */}
                                                        <button
                                                            onClick={() => handleToggleStatus(m.id)}
                                                            className={`touch-target min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${isPaid
                                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            {isPaid ? (
                                                                <span className="flex items-center gap-1"><Check size={14} /> Pagado</span>
                                                            ) : (
                                                                'Pendiente'
                                                            )}
                                                        </button>

                                                        {/* Convert to real expense (only if pending) */}
                                                        {!isPaid && (
                                                            <button
                                                                onClick={() => handleConvertToExpense(m)}
                                                                className="touch-target min-h-[40px] px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-200 font-bold text-xs transition-all flex items-center gap-1"
                                                                title="Registrar como Gasto Real"
                                                            >
                                                                <span>Convertir</span> <ArrowRight size={12} />
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDelete(m.id)}
                                                            className="touch-target w-10 h-10 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            title="Eliminar vencimiento"
                                                            aria-label="Eliminar vencimiento"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {getDayMaturities(selectedDay).length === 0 && (
                                        <p className="text-center text-slate-400 text-sm italic py-4">
                                            Nada anotado aún...
                                        </p>
                                    )}
                                </div>

                                {/* Add-new form */}
                                <form onSubmit={handleSaveMaturity} className="bg-yellow-50/80 p-3 sm:p-4 rounded-xl border border-yellow-200/80 space-y-2.5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-800 mb-1">+ Anotar vencimiento</p>

                                    <input
                                        className="w-full bg-transparent border-b-2 border-yellow-300 font-hand font-bold text-base text-slate-700 placeholder:text-yellow-700/40 focus:outline-none min-h-[40px] py-1"
                                        placeholder="Nombre del servicio (ej: Luz)"
                                        value={formData.service}
                                        onChange={e => setFormData({ ...formData, service: e.target.value })}
                                        autoFocus
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-b-2 border-yellow-300 font-sans font-bold text-slate-700 placeholder:text-yellow-700/40 focus:outline-none text-base min-h-[40px] py-1"
                                            placeholder="$0.00"
                                            value={formData.amount}
                                            min="0.01"
                                            step="0.01"
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                        <select
                                            className="w-full bg-transparent border-b-2 border-yellow-300 font-sans text-sm font-semibold text-slate-700 focus:outline-none min-h-[40px] py-1"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            {EXPENSE_TYPES.map(t => (
                                                <option key={t.id} value={t.id}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full min-h-[44px] bg-slate-800 text-white rounded-xl py-2 font-hand font-bold text-base hover:bg-slate-700 active:scale-[0.99] transition-all mt-2 shadow-sm"
                                    >
                                        ✏️ Anotar
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
