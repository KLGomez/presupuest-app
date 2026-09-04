import { LayoutDashboard, FileText, Calendar, Plus } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { useSound } from '../context/SoundContext';

const BottomNav = ({ onOpenNewExpense }) => {
  const { activeTab, setActiveTab } = usePlanner();
  const { playClick } = useSound();

  const handleTabChange = (tabId) => {
    playClick();
    setActiveTab(tabId);
  };

  const handleNewExpenseClick = () => {
    playClick();
    onOpenNewExpense();
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden safe-bottom-nav transition-colors"
      aria-label="Navegación principal móvil"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-md mx-auto relative">
        {/* Tablero */}
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[11px] font-hand font-bold tracking-tight">Tablero</span>
        </button>

        {/* Plan */}
        <button
          onClick={() => handleTabChange('planning')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition-all ${
            activeTab === 'planning'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'planning' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
            <FileText size={20} />
          </div>
          <span className="text-[11px] font-hand font-bold tracking-tight">Plan</span>
        </button>

        {/* Botón Central Destacado: + Nuevo Gasto */}
        <div className="flex flex-col items-center justify-center flex-1">
          <button
            onClick={handleNewExpenseClick}
            className="-mt-5 w-13 h-13 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-95 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all border-4 border-[#f8f6f2] dark:border-[#090d16]"
            aria-label="Nuevo Gasto"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
          <span className="text-[10px] font-hand font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">Gasto</span>
        </div>

        {/* Calendario */}
        <button
          onClick={() => handleTabChange('calendar')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition-all ${
            activeTab === 'calendar'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'calendar' ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
            <Calendar size={20} />
          </div>
          <span className="text-[11px] font-hand font-bold tracking-tight">Calendario</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
