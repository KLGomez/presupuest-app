import { useState } from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { SoundProvider, useSound } from './context/SoundContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import { Volume2, VolumeX, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PlannerLayout = () => {
  const { activeTab, setActiveTab } = usePlanner();
  const { toggleMute, isMuted, playClick } = useSound();
  const [showExpensePanel, setShowExpensePanel] = useState(false);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-6xl px-8 py-10">
        <Header />

        {/* Top Bar: Controls */}
        <div className="flex items-center justify-between mb-8">
          {/* Minimal Section Tabs */}
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-200/50">
            {[
              { id: 'dashboard', label: '📊 Tablero' },
              { id: 'planning', label: '📝 Plan' },
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
              className="px-4 py-2 text-slate-500 hover:bg-white/60 rounded-lg transition-colors"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-8">
          <Dashboard activeSection={activeTab} />
        </div>

        {/* Expense Panel: Slide-in Overlay */}
        <AnimatePresence>
          {showExpensePanel && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowExpensePanel(false)}
              />
              {/* Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#fdfbf7] shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-hand text-slate-700">📂 Registro de Gastos</h2>
                    <button
                      onClick={() => { playClick(); setShowExpensePanel(false); }}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <ExpenseTracker onClose={() => setShowExpensePanel(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <footer className="py-4 text-center text-slate-400 font-hand text-sm">
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
