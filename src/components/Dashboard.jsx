import { usePlanner } from '../context/PlannerContext';
import { formatCurrency } from '../utils/formatters';
import { EXPENSE_TYPES } from '../utils/constants';
import { useSound } from '../context/SoundContext';
import Almanac from './Almanac';
import BudgetPlanner from './BudgetPlanner';
import Calendar from './Calendar';

const Dashboard = ({ activeSection = 'dashboard' }) => {
    const { data, categories, setFilterType } = usePlanner();
    const { playClick } = useSound();

    // 1. Category Stats
    const categoryStats = categories.map(cat => {
        const planned = data.budgets[cat.id] || 0;
        const filteredExpenses = data.expenses.filter(e => {
            if (data.filterType === 'all') return true;
            return e.type === data.filterType;
        });
        const real = filteredExpenses
            .filter(e => e.categoryId === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
        const percentage = planned > 0 ? (real / planned) * 100 : 0;

        let status = 'neutral', statusText = 'Sin plan';
        if (planned > 0) {
            if (percentage >= 100) { status = 'danger'; statusText = 'Excedido'; }
            else if (percentage >= 80) { status = 'warning'; statusText = 'Cerca del límite'; }
            else { status = 'success'; statusText = 'En control'; }
        }
        return { ...cat, planned, real, percentage, status, statusText };
    });

    // 2. Totals
    const filteredTotalExpenses = data.expenses.filter(e => {
        if (data.filterType === 'all') return true;
        return e.type === data.filterType;
    }).reduce((sum, e) => sum + e.amount, 0);

    const totalBudgeted = Object.values(data.budgets).reduce((sum, val) => sum + (val || 0), 0);
    const difference = totalBudgeted - filteredTotalExpenses;

    // 3. Distribution
    const totalExpensesAll = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const typeStats = EXPENSE_TYPES.map(type => {
        const amount = data.expenses.filter(e => e.type === type.id).reduce((sum, e) => sum + e.amount, 0);
        const percentage = totalExpensesAll > 0 ? (amount / totalExpensesAll) * 100 : 0;
        return { ...type, amount, percentage };
    });

    const handleFilterClick = (type) => { playClick(); setFilterType(type); };

    const getStatusBadge = (status, text) => {
        const styles = {
            success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            warning: 'bg-amber-50 text-amber-700 border-amber-200',
            danger: 'bg-red-50 text-red-700 border-red-200',
            neutral: 'bg-slate-50 text-slate-500 border-slate-200',
        };
        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${styles[status]}`}>
                {text}
            </span>
        );
    };

    // Calendar section view
    if (activeSection === 'calendar') {
        return (
            <div className="w-full max-w-3xl mx-auto mt-6">
                <Calendar />
            </div>
        );
    }

    // Planning section view
    if (activeSection === 'planning') {
        return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <BudgetPlanner />
                </div>
                <div className="flex flex-col gap-6">
                    <Almanac />
                    {/* Quick summary */}
                    <div className="w-full bg-white rounded-2xl shadow-xl shadow-neutral-400/20 border border-neutral-200/60 p-6 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
                        <h3 className="text-lg font-bold font-hand text-slate-600 mb-4">Resumen Rápido</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Ingreso</span>
                                <span className="font-bold text-slate-700">{formatCurrency(data.income)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Planificado</span>
                                <span className="font-bold text-slate-700">{formatCurrency(totalBudgeted)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-3">
                                <span className="text-sm text-slate-500">Gastado</span>
                                <span className="font-bold text-red-600">{formatCurrency(filteredTotalExpenses)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Dashboard (default) view
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Resumen del Mes */}
            <div className="flex flex-col gap-6">
                <div className="w-full bg-white rounded-2xl shadow-xl shadow-neutral-400/20 border border-neutral-200/60 p-6 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold font-hand text-slate-700">📌 Resumen del Mes</h2>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => handleFilterClick('all')}
                            className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${data.filterType === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Todos
                        </button>
                        {EXPENSE_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleFilterClick(type.id)}
                                className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${data.filterType === type.id ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Gastado</p>
                            <p className="text-2xl font-bold text-slate-800 font-hand">{formatCurrency(filteredTotalExpenses)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Planificado</p>
                            <p className="text-2xl font-bold text-slate-800 font-hand">{formatCurrency(totalBudgeted)}</p>
                        </div>
                    </div>

                    {/* Difference */}
                    <div className={`p-4 rounded-lg mb-6 ${difference < 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                        <div className="flex justify-between items-center">
                            <span className="font-hand font-bold text-sm text-slate-600">Diferencia</span>
                            <span className={`font-bold text-2xl font-hand ${difference < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                            </span>
                        </div>
                    </div>

                    {/* Donut Chart — Pastel style */}
                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Distribución por Tipo</h3>
                        {/* pastelColors index matches EXPENSE_TYPES order */}
                        {(() => {
                            const pastelColors = ["#A8D8EA", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA"];
                            const colored = typeStats.map((stat, i) => ({ ...stat, pastel: pastelColors[i % pastelColors.length] }));
                            return (
                                <>
                                    {/* Donut */}
                                    <div className="h-64 w-full flex items-center justify-center mb-4">
                                        <div
                                            className="h-48 w-48 rounded-full relative"
                                            style={{
                                                background: totalExpensesAll > 0
                                                    ? `conic-gradient(${colored.map((stat, i, arr) => {
                                                        const prev = arr.slice(0, i).reduce((a, c) => a + c.percentage, 0);
                                                        return `${stat.pastel} ${prev}% ${prev + stat.percentage}%`;
                                                    }).join(', ')})`
                                                    : '#f1f5f9',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                            }}
                                        >
                                            {/* White cutout ring ≈ 60% cutout */}
                                            <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {totalExpensesAll === 0 ? 'Sin datos' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                                        {colored.map(stat => (
                                            <div key={stat.id} className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: stat.pastel }} />
                                                <span className="text-[11px] font-bold text-slate-500">{stat.label} {Math.round(stat.percentage)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Planificación Mensual */}
            <div className="xl:col-span-2 flex flex-col gap-6 min-h-0">
                {/* Almanac Widget - compact */}
                <Almanac />

                {/* Category Planning Card */}
                <div className="w-full bg-white rounded-2xl shadow-xl shadow-neutral-400/20 border border-neutral-200/60 p-6 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h2 className="text-xl font-bold font-hand text-slate-700">📝 Planificación Mensual</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{categories.length} Categorías</span>
                    </div>

                    <div className="space-y-5">
                        {categoryStats.map(stat => (
                            <div key={stat.id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        {/* Colored Circle */}
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                                style={{ backgroundColor: stat.color }}
                                            >
                                                {stat.name[0]}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${stat.status === 'success' ? 'bg-emerald-500' :
                                                stat.status === 'warning' ? 'bg-amber-400' :
                                                    stat.status === 'danger' ? 'bg-red-500' : 'bg-slate-300'
                                                }`} />
                                        </div>
                                        <div>
                                            <span className="font-bold font-hand text-base text-slate-700 block leading-tight">{stat.name}</span>
                                            {getStatusBadge(stat.status, stat.statusText)}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="block font-bold text-slate-700 text-sm">{formatCurrency(stat.real)}</span>
                                        <span className="block text-[11px] text-slate-400">de {formatCurrency(stat.planned)}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden ml-12">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(stat.percentage, 100)}%`,
                                            backgroundColor: stat.status === 'danger' ? '#ef4444' : stat.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
