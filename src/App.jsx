import { useState, useEffect } from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { SoundProvider, useSound } from './context/SoundContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import BottomNav from './components/BottomNav';
import { Volume2, VolumeX, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PlannerLayout = () => {
  const { activeTab, setActiveTab, expenseToPrefill } = usePlanner();
  const { toggleMute, isMuted, playClick } = useSound();
  const [showExpensePanel, setShowExpensePanel] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-open expense panel when a maturity is converted to a real expense
  useEffect(() => {
    if (expenseToPrefill) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowExpensePanel(true);
    }
  }, [expenseToPrefill]);

  const panelVariants = {
    hidden: isMobile ? { y: '100%', opacity: 0.8 } : { x: '100%', opacity: 0.8 },
    visible: isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 },
    exit: isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 },
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#f8f6f2] bg-[linear-gradient(#e5e2dc_1px,transparent_1px),linear-gradient(90deg,#e5e2dc_1px,transparent_1px)] bg-[size:40px_40px] px-3 sm:px-6 lg:px-8 pt-safe pb-24 md:pb-8">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Header />

        {/* Desktop Top Bar: Controls (Hidden on mobile, replaced by BottomNav) */}
        <div className="hidden md:flex items-center justify-between">
          {/* Minimal Section Tabs */}
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-200/50">
            {[
              { id: 'dashboard', label: '📊 Tablero' },
              { id: 'planning', label: '📝 Plan' },
              { id: 'calendar', label: '📅 Calendario' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { playClick(); setActiveTab(tab.id); }}
                className={`px-4 py-2 rounded-lg text-sm font-hand font-bold transition-all ${activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Add Expense Button */}
            <button
              onClick={() => { playClick(); setShowExpensePanel(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
            >
              <Plus size={16} /> Nuevo Gasto
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleMute}
              className="px-4 py-2 text-slate-500 hover:bg-white/60 rounded-lg transition-colors touch-target"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <Dashboard activeSection={activeTab} />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav onOpenNewExpense={() => setShowExpensePanel(true)} />

        {/* Expense Panel: Responsive Bottom Sheet (Mobile) / Side Drawer (Desktop) */}
        <AnimatePresence>
          {showExpensePanel && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
                onClick={() => setShowExpensePanel(false)}
              />
              {/* Panel */}
              <motion.div
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className={`fixed z-50 bg-[#fdfbf7] shadow-2xl overflow-y-auto overscroll-contain ${
                  isMobile
                    ? 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t border-slate-200 safe-bottom-nav'
                    : 'top-0 right-0 h-full w-full max-w-lg'
                }`}
              >
                {/* Drag Handle Indicator on Mobile */}
                {isMobile && (
                  <div className="pt-3 pb-1 flex justify-center sticky top-0 bg-[#fdfbf7] z-10">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold font-hand text-slate-700">
                      📂 Registro de Gastos
                    </h2>
                    <button
                      onClick={() => { playClick(); setShowExpensePanel(false); }}
                      className="touch-target rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Cerrar panel"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <ExpenseTracker onClose={() => setShowExpensePanel(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <footer className="py-4 text-center text-slate-400 font-hand text-xs sm:text-sm">
          <p>Planner de Gastos Mensuales • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <SoundProvider>
      <PlannerProvider>
        <PlannerLayout />
      </PlannerProvider>
    </SoundProvider>
  );
}

export default App;
