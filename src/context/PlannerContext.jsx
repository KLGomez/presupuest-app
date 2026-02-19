import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { CATEGORIES } from '../utils/constants';
import { getMonthYearKey } from '../utils/formatters';

const PlannerContext = createContext();

const DEFAULT_MONTHLY_DATA = {
    income: 0,
    budgets: {}, // { categoryId: amount }
    expenses: [], // [{ id, amount, description, categoryId, type, date }]
    maturities: [], // [{ id, service, amount, status: 'pending'|'paid', date, type }]
    filterType: 'all', // 'all', 'need', 'want', 'savings', 'debt'
};

// Helper: read monthly data from localStorage
const loadMonthData = (monthKey) => {
    try {
        const stored = window.localStorage.getItem(`planner-${monthKey}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_MONTHLY_DATA, ...parsed };
        }
    } catch (error) {
        console.error("Failed to load data", error);
    }
    return { ...DEFAULT_MONTHLY_DATA };
};

export const PlannerProvider = ({ children }) => {
    // Current month state
    const [selectedMonth, setSelectedMonth] = useState(getMonthYearKey(new Date()));

    // Navigation State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [expenseToPrefill, setExpenseToPrefill] = useState(null);

    // Global categories state (persisted separately, lazy init)
    const [categories, setCategories] = useState(() => {
        try {
            const stored = window.localStorage.getItem('planner-categories');
            return stored ? JSON.parse(stored) : CATEGORIES;
        } catch {
            return CATEGORIES;
        }
    });

    // Monthly data state — LAZY INIT from localStorage to prevent race condition
    const [data, setData] = useState(() => loadMonthData(getMonthYearKey(new Date())));

    // Guard: skip first save to prevent overwriting localStorage on mount
    const isInitialMount = useRef(true);

    // Load monthly data when month changes (NOT on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return; // Skip — data was already loaded via lazy init
        }
        setData(loadMonthData(selectedMonth));
    }, [selectedMonth]);

    // Save monthly data when it changes
    useEffect(() => {
        const key = `planner-${selectedMonth}`;
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data", error);
        }
    }, [selectedMonth, data]);

    // Save categories when they change
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
        setSelectedMonth,
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

export const usePlanner = () => {
    const context = useContext(PlannerContext);
    if (!context) {
        throw new Error('usePlanner must be used within a PlannerProvider');
    }
    return context;
};
