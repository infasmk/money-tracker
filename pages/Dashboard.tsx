import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
    Calendar as CalendarIcon, 
    Sparkles, 
    TrendingUp, 
    Coins, 
    Receipt, 
    Wallet, 
    Users,
    ArrowUpRight,
    Activity,
    ChevronRight
} from 'lucide-react';
import { formatDate, getTodayDateString, formatCurrency } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AttendanceStatus } from '../types';
import { Link } from 'react-router-dom';

const SkeletonCard = () => (
    <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-white/5 animate-pulse h-44"></div>
);

export default function Dashboard() {
    const { income, expenses, attendance, staff, selectedDate, setSelectedDate, isLoading } = useData();
    const isToday = selectedDate === getTodayDateString();
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('GM');
        else if (hour < 17) setGreeting('GA');
        else setGreeting('GE');
    }, []);

    const dailyMetrics = useMemo(() => {
        const dailyInc = income
            .filter(item => item.date === selectedDate)
            .reduce((acc, curr) => acc + curr.amount, 0);
            
        const dailyExp = expenses
            .filter(item => item.date === selectedDate)
            .reduce((acc, curr) => acc + curr.amount, 0);
            
        const dailyAtt = attendance
            .filter(item => item.date === selectedDate && item.status === AttendanceStatus.PRESENT)
            .length;

        const profit = dailyInc - dailyExp;
        const margin = dailyInc > 0 ? (profit / dailyInc) * 100 : 0;

        return {
            income: dailyInc,
            expenses: dailyExp,
            profit: profit,
            staffPresent: dailyAtt,
            totalStaff: staff.length,
            margin: margin.toFixed(0)
        };
    }, [income, expenses, attendance, staff, selectedDate]);

    const monthlySummary = useMemo(() => {
        const data: { [key: string]: { income: number, expenses: number } } = {};
        const baseDate = new Date(selectedDate);

        for (let i = 0; i < 6; i++) {
            const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            data[monthName] = { income: 0, expenses: 0 };
        }

        income.forEach(item => {
            const entryDate = new Date(item.date);
            const monthName = entryDate.toLocaleString('default', { month: 'short' });
            if (data[monthName]) data[monthName].income += item.amount;
        });

        expenses.forEach(item => {
            const entryDate = new Date(item.date);
            const monthName = entryDate.toLocaleString('default', { month: 'short' });
            if (data[monthName]) data[monthName].expenses += item.amount;
        });

        return Object.entries(data).map(([name, values]) => ({ name, ...values })).reverse();
    }, [income, expenses, selectedDate]);

    const handleDateTrigger = () => {
        const input = dateInputRef.current;
        if (input) {
            try {
                input.focus();
                // Fix: Explicitly cast to any to avoid narrowing to 'never' when showPicker is missing or in the catch block.
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            {/* Top Bar Enhanced */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div>
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Live Enterprise Stream</h2>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">
                        {greeting}, <span className="text-gray-700">Manager.</span>
                    </h1>
                </div>

                <button 
                    onClick={handleDateTrigger}
                    className="flex items-center gap-5 px-10 py-6 bg-gray-900 border border-white/5 rounded-[2.5rem] hover:border-primary-500/30 transition-all group shadow-2xl active:scale-95"
                >
                    <CalendarIcon size={24} className="text-primary-500 group-hover:rotate-12 transition-transform" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Ledger View</p>
                        <p className="text-lg font-black text-white tracking-tight">{isToday ? 'Live Today' : formatDate(selectedDate)}</p>
                    </div>
                </button>
                <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute opacity-0 pointer-events-none w-0 h-0" />
            </div>

            {/* Pulse Metrics Grid Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        {/* Credits */}
                        <div className="bg-emerald-500/5 p-8 rounded-[3rem] border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 p-8 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <Coins size={24} strokeWidth={2.5} />
                                </div>
                                <ArrowUpRight className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" size={20} />
                            </div>
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-2">Total Credits</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(dailyMetrics.income)}</h3>
                        </div>

                        {/* Debits */}
                        <div className="bg-rose-500/5 p-8 rounded-[3rem] border border-rose-500/10 group hover:bg-rose-500/10 transition-all relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 p-8 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                    <Receipt size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em] mb-2">Total Debits</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(dailyMetrics.expenses)}</h3>
                        </div>

                        {/* Yield */}
                        <div className="bg-primary-500/5 p-8 rounded-[3rem] border border-primary-500/10 group hover:bg-primary-500/10 transition-all relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 p-8 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-600/20">
                                    <Wallet size={24} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black text-primary-500 px-3 py-1 bg-primary-500/10 rounded-full">{dailyMetrics.margin}%</span>
                            </div>
                            <p className="text-[10px] font-black text-primary-500/60 uppercase tracking-[0.3em] mb-2">Net Yield</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(dailyMetrics.profit)}</h3>
                        </div>

                        {/* HR Status */}
                        <div className="bg-purple-500/5 p-8 rounded-[3rem] border border-purple-500/10 group hover:bg-purple-500/10 transition-all relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 p-8 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                                    <Users size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-purple-500/60 uppercase tracking-[0.3em] mb-2">HR Presence</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{dailyMetrics.staffPresent}<span className="text-gray-700 mx-2 text-xl">/</span>{dailyMetrics.totalStaff}</h3>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-gray-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Growth Trajectory</h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Rolling 6-Month Comparison</p>
                        </div>
                        <Link to="/reports" className="p-4 bg-white/5 rounded-2xl text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
                            <Activity size={20} />
                        </Link>
                    </div>
                    <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlySummary} barGap={8}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontWeight: 800, fontSize: 10}} dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#111827', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', fontWeight: '900'}}
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} barSize={28} />
                                <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shortcuts & Status */}
                <div className="space-y-6">
                    <div className="bg-primary-600 p-10 rounded-[4rem] text-white shadow-2xl shadow-primary-600/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Sparkles size={200} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4">Enterprise Insights</h3>
                        <p className="text-xs font-bold opacity-80 leading-relaxed mb-8">System performance is optimized. All records are currently synchronized with the cloud.</p>
                        <button className="flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                            Audit Now <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-[4rem] border border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                <TrendingUp size={18} />
                            </div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Status</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-5 bg-white/5 rounded-[2rem] border border-transparent hover:border-white/5 transition-all">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Database Sync</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                            </div>
                            <div className="flex justify-between items-center p-5 bg-white/5 rounded-[2rem] border border-transparent hover:border-white/5 transition-all">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personnel Logs</span>
                                <span className="text-[10px] font-black text-white">{staff.length} Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}