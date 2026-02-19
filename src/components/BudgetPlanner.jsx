import { usePlanner } from '../context/PlannerContext';
import { formatCurrency } from '../utils/formatters';
import { useSound } from '../context/SoundContext';

const BudgetPlanner = () => {
    const { data, updateIncome, categories, updateBudget } = usePlanner();
    const { playClick } = useSound();

    const totalBudgeted = Object.values(data.budgets).reduce((sum, val) => sum + (val || 0), 0);
    const remaining = data.income - totalBudgeted;

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold font-hand text-slate-700 mb-6 pb-4 border-b border-slate-100">
                📝 Planificación Mensual
            </h2>

            {/* Income */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Ingreso Estimado
                </label>
                <div className="input-currency-wrapper" style={{ maxWidth: '200px' }}>
                    <span className="input-currency-symbol font-hand">$</span>
                    <input
                        type="number"
                        value={data.income || ''}
                        onChange={(e) => updateIncome(e.target.value)}
                        onFocus={playClick}
                        placeholder="0"
                        className="input-currency text-xl"
                        min="0"
                    />
                </div>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg mb-6">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Planificado</p>
                    <p className="font-bold text-lg text-slate-800 font-hand">{formatCurrency(totalBudgeted)}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex-1 text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Por asignar</p>
                    <p className={`font-bold text-lg font-hand ${remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
            </div>

            {/* Category Budgets */}
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Presupuestos por Categoría</h3>
            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 group">
                        <div
                            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                            style={{ backgroundColor: cat.color }}
                        >
                            {cat.name[0]}
                        </div>
                        <label className="flex-1 text-base font-hand font-bold text-slate-700 truncate">
                            {cat.name}
                        </label>
                        <div className="input-currency-wrapper" style={{ maxWidth: '120px' }}>
                            <span className="input-currency-symbol font-hand text-sm">$</span>
                            <input
                                type="number"
                                value={data.budgets[cat.id] || ''}
                                onChange={(e) => updateBudget(cat.id, e.target.value)}
                                onFocus={playClick}
                                placeholder="0"
                                className="input-currency text-right text-base"
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
