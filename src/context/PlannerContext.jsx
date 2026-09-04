import { createContext, useState, useEffect, useContext } from 'react';
import { CATEGORIES } from '../utils/constants';
import { getMonthYearKey } from '../utils/formatters';

const PlannerContext = createContext();

const DEFAULT_MONTHLY_DATA = {
    monthKey: '', // Afinidad explícita del mes (ej. '2026-09')
    income: 0,
    budgets: {}, // { categoryId: amount }
    expenses: [], // [{ id, amount, description, categoryId, type, date }]
    maturities: [], // [{ id, service, amount, status: 'pending'|'paid', date, type }]
    filterType: 'all', // 'all', 'need', 'want', 'savings', 'debt'
};

// Helper: lee datos mensuales asegurando que el objeto siempre porte su monthKey
const loadMonthData = (monthKey) => {
    try {
        const stored = window.localStorage.getItem(`planner-${monthKey}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_MONTHLY_DATA, ...parsed, monthKey };
        }
    } catch (error) {
        console.error("Failed to load data", error);
    }
    return { ...DEFAULT_MONTHLY_DATA, monthKey };
};

export const PlannerProvider = ({ children }) => {
    // Mes activo inicial
    const [selectedMonth, setSelectedMonth] = useState(() => getMonthYearKey(new Date()));

    // Estado de navegación
    const [activeTab, setActiveTab] = useState('dashboard');
    const [expenseToPrefill, setExpenseToPrefill] = useState(null);

    // Categorías globales (persistidas por separado)
    const [categories, setCategories] = useState(() => {
        try {
            const stored = window.localStorage.getItem('planner-categories');
            return stored ? JSON.parse(stored) : CATEGORIES;
        } catch {
            return CATEGORIES;
        }
    });

    // Estado mensual inicializado de forma perezosa con el mes activo
    const [data, setData] = useState(() => loadMonthData(getMonthYearKey(new Date())));

    /**
     * Transición Atómica de Mes:
     * En React 18/19, múltiples setState dentro de un evento se agrupan (batching).
     * selectedMonth y data se actualizan juntos en el mismo render, eliminando estados intermedios.
     */
    const handleSetSelectedMonth = (newMonthOrFn) => {
        const nextMonth = typeof newMonthOrFn === 'function' ? newMonthOrFn(selectedMonth) : newMonthOrFn;
        if (nextMonth === selectedMonth) return;

        setSelectedMonth(nextMonth);
        setData(loadMonthData(nextMonth));
    };

    /**
     * Persistencia Atómica y Segura:
     * Solo se serializa si el monthKey de la data coincide exactamente con el selectedMonth activo.
     */
    useEffect(() => {
        if (!data.monthKey || data.monthKey !== selectedMonth) {
            return; // ABORTA: Previene sobrescrituras cruzadas
        }

        const key = `planner-${selectedMonth}`;
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data", error);
        }
    }, [selectedMonth, data]);

    // Guardar categorías globales al cambiar
    useEffect(() => {
        window.localStorage.setItem('planner-categories', JSON.stringify(categories));
    }, [categories]);

    // Actions
    const addCategory = (newCategory) => {
        setCategories(prev => [...prev, { ...newCategory, id: Date.now().toString() }]);
    };

    const updateIncome = (amount) => {
        setData(prev => ({ ...prev, income: parseFloat(amount) || 0 }));
    };

    const updateBudget = (categoryId, amount) => {
        setData(prev => ({
            ...prev,
            budgets: { ...prev.budgets, [categoryId]: parseFloat(amount) || 0 }
        }));
    };

    const addExpense = (expense) => {
        const newExpense = { ...expense, id: Date.now().toString() };
        setData(prev => ({
            ...prev,
            expenses: [newExpense, ...prev.expenses]
        }));
    };

    const deleteExpense = (id) => {
        setData(prev => ({
            ...prev,
            expenses: prev.expenses.filter(e => e.id !== id)
        }));
    };

    const editExpense = (id, updatedExpense) => {
        setData(prev => ({
            ...prev,
            expenses: prev.expenses.map(e => e.id === id ? { ...updatedExpense, id } : e)
        }));
    };

    const setFilterType = (type) => {
        setData(prev => ({ ...prev, filterType: type }));
    };

    // Maturity Actions
    const addMaturity = (maturity) => {
        const newMaturity = { ...maturity, id: Date.now().toString(), status: 'pending' };
        setData(prev => ({
            ...prev,
            maturities: [...(prev.maturities || []), newMaturity]
        }));
    };

    const toggleMaturityStatus = (id) => {
        setData(prev => ({
            ...prev,
            maturities: (prev.maturities || []).map(m => m.id === id ? { ...m, status: m.status === 'pending' ? 'paid' : 'pending' } : m)
        }));
    };

    const deleteMaturity = (id) => {
        setData(prev => ({
            ...prev,
            maturities: (prev.maturities || []).filter(m => m.id !== id)
        }));
    };

    // Convert a maturity into a real expense and mark it as paid
    const convertMaturityToExpense = (maturity) => {
        const newExpense = {
            id: Date.now().toString(),
            amount: maturity.amount,
            description: maturity.service,
            categoryId: 'other', // sensible default; user can edit in tracker
            type: maturity.type,
            date: maturity.date,
        };
        setData(prev => ({
            ...prev,
            expenses: [newExpense, ...prev.expenses],
            maturities: (prev.maturities || []).map(m =>
                m.id === maturity.id ? { ...m, status: 'paid' } : m
            ),
        }));
    };

    const value = {
        selectedMonth,
        setSelectedMonth: handleSetSelectedMonth,
        categories,
        addCategory,
        data,
        updateIncome,
        updateBudget,
        addExpense,
        deleteExpense,
        editExpense,
        setFilterType,
        // Navigation
        activeTab,
        setActiveTab,
        expenseToPrefill,
        setExpenseToPrefill,
        // Maturities
        addMaturity,
        toggleMaturityStatus,
        deleteMaturity,
        convertMaturityToExpense
    };

    return (
        <PlannerContext.Provider value={value}>
            {children}
        </PlannerContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlanner = () => {
    const context = useContext(PlannerContext);
    if (!context) {
        throw new Error('usePlanner must be used within a PlannerProvider');
    }
    return context;
};
