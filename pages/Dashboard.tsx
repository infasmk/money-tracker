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
    ChevronRight,
    PieChart,
    ChevronDown
} from 'lucide-react';
import { formatDate, getTodayDateString, formatCurrency, getMonthName } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttendanceStatus } from '../types';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const SkeletonCard = () => (
    <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-white/5 animate-pulse h-44"></div>
);

export default function Dashboard() {
    const { income, expenses, attendance, staff, salaryTransactions, selectedDate, setSelectedDate, isLoading } = useData();
    const [showMonthlyModal, setShowMonthlyModal] = useState(false);
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

        // Add salary transactions (advances/payouts) to monthly expenses
        salaryTransactions.forEach(st => {
            const entryDate = new Date(st.date);
            const monthName = entryDate.toLocaleString('default', { month: 'short' });
            if (data[monthName]) data[monthName].expenses += st.amount;
        });

        return Object.entries(data).map(([name, values]) => ({ name, ...values })).reverse();
    }, [income, expenses, salaryTransactions, selectedDate]);

    const currentMonthRecords = useMemo(() => {
        const date = new Date(selectedDate);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthlyIncome = income.filter(i => {
            const d = new Date(i.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        const monthlyExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        const monthlyTxs = salaryTransactions.filter(st => {
            const d = new Date(st.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const totalIncome = monthlyIncome.reduce((s, c) => s + c.amount, 0);
        const totalExpenses = monthlyExpenses.reduce((s, c) => s + c.amount, 0) + monthlyTxs.reduce((s, c) => s + c.amount, 0);

        return {
            income: monthlyIncome,
            expenses: [...monthlyExpenses, ...monthlyTxs.map(tx => ({ ...tx, category: 'Payroll/Advance', notes: `Processed for staff ID: ${tx.staff_id}` }))],
            totalIncome,
            totalExpenses,
            monthName: getMonthName(month)
        };
    }, [income, expenses, salaryTransactions, selectedDate]);

    const handleDateTrigger = () => {
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

            {/* Pulse Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        <div className="bg-emerald-500/5 p-8 rounded-[3rem] border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20"><Coins size={24} strokeWidth={2.5} /></div>
                                <ArrowUpRight className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" size={20} />
                            </div>
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-2">Total Credits</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(dailyMetrics.income)}</h3>
                        </div>

                        <div className="bg-rose-500/5 p-8 rounded-[3rem] border border-rose-500/10 group hover:bg-rose-500/10 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20"><Receipt size={24} strokeWidth={2.5} /></div>
                            </div>
                            <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em] mb-2">Total Debits</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(dailyMetrics.expenses)}</h3>
                        </div>

                        <div className="bg-primary-500/5 p-8 rounded-[3rem] border border-primary-500/10 group hover:bg-primary-500/10 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-600/20"><Wallet size={24} strokeWidth={2.5} /></div>
                                <span className="text-[10px] font-black text-primary-500 px-3 py-1 bg-primary-500/10 rounded-full">{dailyMetrics.margin}%</span>
                            </div>
                            <p className="text-[10px] font-black text-primary-500/60 uppercase tracking-[0.3em] mb-2">Net Yield</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(dailyMetrics.profit)}</h3>
                        </div>

                        <div className="bg-purple-500/5 p-8 rounded-[3rem] border border-purple-500/10 group hover:bg-purple-500/10 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20"><Users size={24} strokeWidth={2.5} /></div>
                            </div>
                            <p className="text-[10px] font-black text-purple-500/60 uppercase tracking-[0.3em] mb-2">HR Presence</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{dailyMetrics.staffPresent}<span className="text-gray-700 mx-2 text-xl">/</span>{dailyMetrics.totalStaff}</h3>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                <div className="space-y-6">
                    <div className="bg-primary-600 p-10 rounded-[4rem] text-white shadow-2xl shadow-primary-600/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Sparkles size={200} /></div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4">{currentMonthRecords.monthName} Snap</h3>
                        <div className="space-y-2 mb-8">
                            <p className="text-xs font-bold opacity-80 leading-relaxed">Credits: {formatCurrency(currentMonthRecords.totalIncome)}</p>
                            <p className="text-xs font-bold opacity-80 leading-relaxed">Debits: {formatCurrency(currentMonthRecords.totalExpenses)}</p>
                        </div>
                        <button 
                            onClick={() => setShowMonthlyModal(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all"
                        >
                            View Monthly Ledger <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-[4rem] border border-white/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><TrendingUp size={18} /></div>
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

            {/* Monthly Ledger Modal */}
            <Modal isOpen={showMonthlyModal} onClose={() => setShowMonthlyModal(false)} title={`${currentMonthRecords.monthName} Financial deep-dive`}>
                <div className="space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-2 gap-4 sticky top-0 bg-gray-900 z-10 pb-4">
                        <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/10">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Income</p>
                            <p className="text-xl font-black text-white">{formatCurrency(currentMonthRecords.totalIncome)}</p>
                        </div>
                        <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/10">
                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Total Expenses</p>
                            <p className="text-xl font-black text-white">{formatCurrency(currentMonthRecords.totalExpenses)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 mb-4">Itemized Transactions</h4>
                        {[...currentMonthRecords.income.map(i => ({ ...i, type: 'income' })), ...currentMonthRecords.expenses.map(e => ({ ...e, type: 'expense' }))]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {item.type === 'income' ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{formatDate(item.date)}</p>
                                            <p className="text-xs font-black text-white">{item.source || (item as any).category || 'General'}</p>
                                            <p className="text-[9px] font-bold text-gray-600 italic">{(item as any).notes || (item as any).note || 'Audit note empty'}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                    </p>
                                </div>
                            ))
                        }
                        {currentMonthRecords.income.length === 0 && currentMonthRecords.expenses.length === 0 && (
                            <div className="py-20 text-center">
                                <PieChart size={40} className="mx-auto text-gray-800 mb-4 opacity-20" />
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Zero data points for this month</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}