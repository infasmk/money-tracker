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
    ChevronDown,
    ArrowDownRight,
    Clock,
    Zap,
    Target
} from 'lucide-react';
import { formatDate, getTodayDateString, formatCurrency, getMonthName } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { AttendanceStatus } from '../types';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const MetricCard = ({ title, value, subtext, icon: Icon, color, delta }: any) => (
    <div className="group bg-gray-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-700">
            <Icon size={120} />
        </div>
        <div>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl shadow-xl`} style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {delta && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${delta > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {delta > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {Math.abs(delta)}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{title}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{value}</h3>
        </div>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{subtext}</p>
    </div>
);

export default function Dashboard() {
    const { income, expenses, attendance, staff, salaryTransactions, selectedDate, setSelectedDate, isLoading } = useData();
    const [showMonthlyModal, setShowMonthlyModal] = useState(false);
    const [greeting, setGreeting] = useState('');
    const isToday = selectedDate === getTodayDateString();
    const dateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const dailyMetrics = useMemo(() => {
        const todayInc = income.filter(i => i.date === selectedDate).reduce((s, c) => s + c.amount, 0);
        const todayExp = expenses.filter(e => e.date === selectedDate).reduce((s, c) => s + c.amount, 0);
        const todayAtt = attendance.filter(a => a.date === selectedDate && a.status === AttendanceStatus.PRESENT).length;
        const profit = todayInc - todayExp;
        const margin = todayInc > 0 ? ((profit / todayInc) * 100).toFixed(1) : '0';

        return {
            income: todayInc,
            expenses: todayExp,
            profit,
            staffPresent: todayAtt,
            totalStaff: staff.length,
            margin
        };
    }, [income, expenses, attendance, staff, selectedDate]);

    const liveFeed = useMemo(() => {
        const all = [
            ...income.map(i => ({ ...i, type: 'CR', category: i.source, color: '#10b981' })),
            ...expenses.map(e => ({ ...e, type: 'DR', color: '#f43f5e' })),
            ...salaryTransactions.map(s => ({ ...s, type: 'DR', category: 'Payroll', color: '#3b82f6' }))
        ];
        return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
    }, [income, expenses, salaryTransactions]);

    const chartData = useMemo(() => {
        const months = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return {
                name: d.toLocaleString('default', { month: 'short' }),
                month: d.getMonth(),
                year: d.getFullYear(),
                revenue: 0,
                burn: 0
            };
        });

        income.forEach(i => {
            const idate = new Date(i.date);
            const found = months.find(m => m.month === idate.getMonth() && m.year === idate.getFullYear());
            if (found) found.revenue += i.amount;
        });

        [...expenses, ...salaryTransactions].forEach(e => {
            const edate = new Date(e.date);
            const found = months.find(m => m.month === edate.getMonth() && m.year === edate.getFullYear());
            if (found) found.burn += e.amount;
        });

        return months;
    }, [income, expenses, salaryTransactions]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
            {/* Header / Intro */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative h-2 w-2">
                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                            <div className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></div>
                        </div>
                        <h2 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">Network Terminal Active</h2>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                        {greeting}, <span className="text-gray-700">Principal.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg flex items-center gap-3">
                        <Clock size={18} className="text-gray-700" />
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System Intelligence Operational
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-gray-900 border border-white/5 p-4 rounded-[3rem] shadow-2xl relative group cursor-pointer" onClick={() => dateInputRef.current?.showPicker()}>
                    <div className="p-4 bg-white/5 rounded-2xl text-primary-500 group-hover:scale-110 transition-transform">
                        <CalendarIcon size={24} />
                    </div>
                    <div className="pr-6">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Fiscal Date</p>
                        <p className="text-sm font-black text-white uppercase tracking-tighter">{isToday ? 'Live Feed' : formatDate(selectedDate)}</p>
                    </div>
                    <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                </div>
            </div>

            {/* Core Pulse Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <MetricCard 
                    title="Gross Intake" 
                    value={formatCurrency(dailyMetrics.income)} 
                    subtext="Real-time cash flow" 
                    icon={Coins} 
                    color="#10b981" 
                    delta={12}
                />
                <MetricCard 
                    title="Operational Burn" 
                    value={formatCurrency(dailyMetrics.expenses)} 
                    subtext="Bills & overheads" 
                    icon={Receipt} 
                    color="#f43f5e" 
                    delta={-4}
                />
                <MetricCard 
                    title="Net Yield" 
                    value={formatCurrency(dailyMetrics.profit)} 
                    subtext={`Margin Efficiency: ${dailyMetrics.margin}%`} 
                    icon={Wallet} 
                    color="#3b82f6" 
                    delta={8}
                />
                <MetricCard 
                    title="HR Capacity" 
                    value={`${dailyMetrics.staffPresent} / ${dailyMetrics.totalStaff}`} 
                    subtext="Staff presence ratio" 
                    icon={Users} 
                    color="#a855f7" 
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-gray-900/40 p-10 sm:p-12 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-3xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Revenue Trajectory</h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">H1 Fiscal Performance Visualization</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[9px] font-black text-gray-500 uppercase">Inbound</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                                <span className="text-[9px] font-black text-gray-500 uppercase">Outbound</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontWeight: 900, fontSize: 10}} dy={15} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0a0f1d', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', fontWeight: '900', fontSize: '12px'}}
                                    cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2}}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="burn" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorBurn)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations Feed */}
                <div className="bg-gray-900/40 p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <Activity size={18} className="text-primary-500" /> Live Feed
                        </h3>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                    </div>
                    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {liveFeed.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="p-3.5 rounded-2xl group-hover:scale-110 transition-transform" style={{ backgroundColor: `${(item as any).color}15`, color: (item as any).color }}>
                                        {(item as any).type === 'CR' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white tracking-tight">{(item as any).category}</p>
                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">{formatDate(item.date)}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-black ${(item as any).type === 'CR' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {(item as any).type === 'CR' ? '+' : '-'}{formatCurrency(item.amount)}
                                </p>
                            </div>
                        ))}
                        {liveFeed.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <Target size={64} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Logs...</p>
                            </div>
                        )}
                    </div>
                    <Link to="/reports" className="mt-10 w-full py-5 bg-primary-600 rounded-[2rem] text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 active:scale-95">
                        Audit Detailed Logs <ChevronRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Quick Actions / Ecosystem */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="bg-primary-600 p-10 rounded-[4rem] text-white shadow-2xl shadow-primary-600/30 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                        <Zap size={240} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Instant Enrollment</h4>
                        <p className="text-xs font-bold opacity-70 leading-relaxed mb-10">Add new staff members to the cloud directory in seconds.</p>
                    </div>
                    <Link to="/staff" className="relative z-10 w-fit px-8 py-4 bg-white text-primary-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                        Open Directory
                    </Link>
                </div>

                <div className="sm:col-span-2 bg-gray-900/40 p-10 rounded-[4rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="p-8 bg-white/5 rounded-[3rem] border border-white/5">
                            <Sparkles size={48} className="text-primary-500" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Business Health</h4>
                            <p className="text-xs font-bold text-gray-500 max-w-sm mt-2">Your operational efficiency is up by 12% compared to last month. All systems are green.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center min-w-[120px]">
                            <p className="text-2xl font-black text-white">98%</p>
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Uptime</p>
                        </div>
                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center min-w-[120px]">
                            <p className="text-2xl font-black text-white">4.9</p>
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Audit Score</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}