import { usePlanner } from '../context/PlannerContext';
import { formatCurrency } from '../utils/formatters';
import { useSound } from '../context/SoundContext';

const BudgetPlanner = () => {
    const { data, updateIncome, categories, updateBudget } = usePlanner();
    const { playClick } = useSound();

    const totalBudgeted = Object.values(data.budgets).reduce((sum, val) => sum + (val || 0), 0);
    const remaining = data.income - totalBudgeted;

    return (
        <div className="w-full bg-white dark:bg-slate-900/90 rounded-2xl shadow-xl shadow-neutral-400/20 dark:shadow-black/40 border border-neutral-200/60 dark:border-slate-800 p-4 sm:p-6 transition-all duration-200 hover:shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold font-hand text-slate-700 dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                📝 Planificación Mensual
            </h2>

            {/* Income */}
            <div className="mb-6 font-sans">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Ingreso Estimado
                </label>
                <div className="input-currency-wrapper max-w-[200px]">
                    <span className="input-currency-symbol font-sans font-bold text-lg">$</span>
                    <input
                        type="number"
                        value={data.income || ''}
                        onChange={(e) => updateIncome(e.target.value)}
                        onFocus={playClick}
                        placeholder="0"
                        className="input-currency text-xl min-h-[44px] py-1"
                        min="0"
                    />
                </div>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center gap-4 sm:gap-6 p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl mb-6 border border-slate-100 dark:border-slate-700/60 font-sans">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wide">Planificado</p>
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100 tabular-nums">{formatCurrency(totalBudgeted)}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 text-right">
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wide">Por asignar</p>
                    <p className={`font-bold text-lg tabular-nums ${remaining < 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
            </div>

            {/* Category Budgets */}
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4 font-sans">Presupuestos por Categoría</h3>
            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 group">
                        <div
                            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-xs"
                            style={{ backgroundColor: cat.color }}
                        >
                            {cat.name[0]}
                        </div>
                        <label className="flex-1 text-base font-sans font-bold text-slate-700 dark:text-slate-200 truncate">
                            {cat.name}
                        </label>
                        <div className="input-currency-wrapper max-w-[120px]">
                            <span className="input-currency-symbol font-sans font-bold text-sm">$</span>
                            <input
                                type="number"
                                value={data.budgets[cat.id] || ''}
                                onChange={(e) => updateBudget(cat.id, e.target.value)}
                                onFocus={playClick}
                                placeholder="0"
                                className="input-currency text-right text-base min-h-[44px] py-1"
                                min="0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetPlanner;
