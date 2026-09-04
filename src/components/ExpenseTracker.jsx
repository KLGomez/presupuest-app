import { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';
import { EXPENSE_TYPES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseTracker = () => {
    const { categories, addExpense, data, deleteExpense, expenseToPrefill, setExpenseToPrefill } = usePlanner();
    const { playSuccess, playDelete } = useSound();

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        categoryId: categories[0]?.id || '',
        type: EXPENSE_TYPES[0].id,
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (expenseToPrefill) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(prev => ({
                ...prev,
                amount: expenseToPrefill.amount,
                description: expenseToPrefill.description,
                type: expenseToPrefill.type,
                date: expenseToPrefill.date,
            }));
            setExpenseToPrefill(null);
        }
    }, [expenseToPrefill, setExpenseToPrefill]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return;
        playSuccess();
        addExpense({
            amount: parseFloat(formData.amount),
            description: formData.description,
            categoryId: formData.categoryId,
            type: formData.type,
            date: formData.date,
        });
        setFormData({
            amount: '',
            description: '',
            categoryId: categories[0]?.id || '',
            type: EXPENSE_TYPES[0].id,
            date: new Date().toISOString().split('T')[0],
        });
    };

    const getCategory = (id) => categories.find(c => c.id === id) || { name: '?', color: '#ccc' };

    const filteredExpenses = data.expenses.filter(e => {
        if (data.filterType === 'all') return true;
        return e.type === data.filterType;
    });

    return (
        <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/90 rounded-2xl shadow-md p-4 sm:p-6 space-y-4 border border-slate-100 dark:border-slate-800 transition-colors">
                <h3 className="font-hand font-bold text-lg text-slate-700 dark:text-slate-100 pb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                    Nuevo Gasto
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 font-sans">Monto</label>
                        <div className="input-currency-wrapper w-full">
                            <span className="input-currency-symbol font-sans font-bold text-lg">$</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="input-currency text-xl min-h-[44px]"
                                autoFocus
                                required
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 font-sans">Fecha</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none font-sans font-semibold text-base py-1.5 min-h-[44px] text-slate-700 dark:text-slate-100"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 font-sans">Concepto</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ej: Supermercado o Café"
                        className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none font-sans font-semibold text-base sm:text-lg py-1.5 min-h-[44px] text-slate-700 dark:text-slate-100"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 font-sans">Categoría</label>
                        <select
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl p-2.5 min-h-[44px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 focus:border-indigo-500 outline-none font-sans font-semibold text-sm"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id} className="dark:bg-slate-800">{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 font-sans">Tipo</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl p-2.5 min-h-[44px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 focus:border-indigo-500 outline-none font-sans font-semibold text-sm"
                        >
                            {EXPENSE_TYPES.map(type => (
                                <option key={type.id} value={type.id} className="dark:bg-slate-800">{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full min-h-[48px] px-6 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold font-sans text-base rounded-xl shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-[0.99] transition-all"
                >
                    Guardar Gasto
                </button>
            </form>

            {/* Expense List */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1 font-sans">
                    Últimos Gastos ({filteredExpenses.length})
                </h3>
                <AnimatePresence>
                    {filteredExpenses.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900/90 rounded-xl shadow-md p-8 text-center border border-slate-100 dark:border-slate-800">
                            <p className="font-hand font-bold text-lg text-slate-300 dark:text-slate-600">Sin gastos registrados</p>
                        </div>
                    ) : (
                        filteredExpenses.map((expense, i) => {
                            const cat = getCategory(expense.categoryId);
                            const expType = EXPENSE_TYPES.find(t => t.id === expense.type);
                            return (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="bg-white dark:bg-slate-800/80 rounded-xl shadow-sm p-3.5 sm:p-4 flex items-center justify-between border border-slate-100 dark:border-slate-700/60 group transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs"
                                            style={{ backgroundColor: cat.color }}
                                        >
                                            {cat.name[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-sans font-bold text-base text-slate-700 dark:text-slate-100 truncate">
                                                {expense.description}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-sans font-bold uppercase tracking-wide">
                                                {cat.name} • {expType?.label} • {formatDate(expense.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <span className="font-sans font-bold text-base text-slate-800 dark:text-slate-100 tabular-nums">
                                            {formatCurrency(expense.amount)}
                                        </span>
                                        {/* Touch Target 44x44px for delete, visible on mobile */}
                                        <button
                                            onClick={() => {
                                                playDelete();
                                                if (window.confirm('¿Eliminar este gasto?')) deleteExpense(expense.id);
                                            }}
                                            className="touch-target rounded-full text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                            aria-label="Eliminar gasto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExpenseTracker;
