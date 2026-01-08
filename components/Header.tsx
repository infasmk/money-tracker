import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Calendar as CalendarIcon, Hotel, RotateCcw, ShieldCheck, Cloud, CloudUpload } from 'lucide-react';
import { formatDate, getTodayDateString } from '../utils/helpers';

const Header: React.FC = () => {
    const { selectedDate, setSelectedDate, resetToToday, isLoading, isSyncing } = useData();
    const location = useLocation();
    const dateInputRef = useRef<HTMLInputElement>(null);

    const isHome = location.pathname === '/';
    const isToday = selectedDate === getTodayDateString();

    const triggerDatePicker = () => {
        const input = dateInputRef.current;
        if (input) {
            try {
                input.focus();
                if ('showPicker' in input) {
                    (input as any).showPicker();
                } else {
                    (input as any).click();
                }
            } catch (e) {
                (input as any).click();
            }
        }
    };

    return (
        <header className="sticky top-0 z-[90] px-4 py-4 sm:px-10 pointer-events-none">
            <div className="max-w-7xl mx-auto h-20 bg-gray-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between px-8 pointer-events-auto">
                <div className="flex items-center space-x-6">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="p-3 bg-primary-600 rounded-2xl group-hover:rotate-6 group-hover:scale-110 transition-all shadow-xl shadow-primary-600/40">
                            <Hotel className="h-5 w-5 text-white" strokeWidth={3} />
                        </div>
                        <div className="hidden md:block">
                            <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">Hotel<span className="text-primary-500">Pro</span></span>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] leading-none mt-1">Enterprise Suite</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Cloud Sync Pulse */}
                    <div className={`flex items-center gap-3 px-4 py-2 border rounded-xl transition-all duration-500 ${isSyncing ? 'bg-primary-500/10 border-primary-500/20 shadow-lg shadow-primary-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                        {isSyncing ? <CloudUpload size={14} className="text-primary-500 animate-bounce" /> : <Cloud size={14} className="text-emerald-500" />}
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] hidden sm:inline ${isSyncing ? 'text-primary-500' : 'text-emerald-500'}`}>
                            {isSyncing ? 'Syncing...' : 'Cloud Verified'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isToday && (
                            <button 
                                onClick={resetToToday}
                                className="p-2.5 text-primary-400 bg-primary-500/10 border border-primary-500/10 rounded-xl hover:bg-primary-500/20 transition-all"
                            >
                                <RotateCcw size={14} />
                            </button>
                        )}
                        <button 
                            onClick={triggerDatePicker}
                            className="flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
                        >
                            <CalendarIcon size={14} className="text-primary-500" />
                            <span className="text-xs font-black text-white">{isToday ? 'Live Today' : formatDate(selectedDate)}</span>
                            <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute opacity-0 pointer-events-none w-0 h-0" />
                        </button>
                    </div>

                    <div className="h-10 w-10 flex items-center justify-center bg-gray-800 rounded-2xl border border-white/5 hidden sm:flex">
                        <ShieldCheck className="text-primary-500" size={18} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;