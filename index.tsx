import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  NavLink,
  Link
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Hotel, 
  Calendar, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  X,
  UserCheck,
  UserX,
  ArrowRightLeft,
  ChevronRight,
  Filter,
  PlusCircle,
  Clock,
  Activity,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Target,
  CreditCard,
  History
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// --- Types ---
export enum AttendanceStatus { PRESENT = 'Present', ABSENT = 'Absent' }
export interface StaffMember { id: string; name: string; role: string; salary: number; joined: string; }

// --- Helpers ---
const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const getMonthName = (idx: number): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[idx] || "";
};

const formatDate = (ds: string): string => {
    if (!ds) return '';
    return new Date(ds).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Mock Data ---
const INITIAL_STAFF = [
  { id: 's1', name: 'Vikram Singh', role: 'Manager', salary: 45000, joined: '2023-01-10' },
  { id: 's2', name: 'Anjali Gupta', role: 'Receptionist', salary: 22000, joined: '2023-03-15' },
  { id: 's3', name: 'Rahul Sharma', role: 'Chef', salary: 35000, joined: '2023-05-20' },
  { id: 's4', name: 'Priya Verma', role: 'HR Lead', salary: 40000, joined: '2023-06-01' }
];

// --- Shared Components ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-[#0a0f1d] rounded-[2.5rem] border border-white/5 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/5">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{String(title)}</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all bg-white/5 rounded-xl"><X size={24} /></button>
        </div>
        <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- Redesigned Dashboard ---
const Dashboard = ({ data, selectedDate, setSelectedDate }: any) => {
  const [showLedger, setShowLedger] = useState(false);
  const [ledgerMonth, setLedgerMonth] = useState(new Date(selectedDate).getMonth());
  const [ledgerYear, setLedgerYear] = useState(new Date(selectedDate).getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showLedger) {
      const d = new Date(selectedDate);
      setLedgerMonth(d.getMonth());
      setLedgerYear(d.getFullYear());
    }
  }, [selectedDate, showLedger]);
  
  const dailyMetrics = useMemo(() => {
    const inc = data.income.filter((i: any) => i.date === selectedDate).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
    const exp = data.expenses.filter((e: any) => e.date === selectedDate).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
    const sal = data.salaries.filter((sl: any) => sl.date === selectedDate).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
    const attCount = data.attendance.filter((a: any) => a.date === selectedDate && a.status === AttendanceStatus.PRESENT).length;
    return { 
      income: inc, 
      expenses: exp + sal, 
      profit: inc - (exp + sal), 
      attendance: attCount,
      occupancy: Math.min(100, Math.floor((inc / 25000) * 100)) // Simulated occupancy based on revenue
    };
  }, [data, selectedDate]);

  const recentActivity = useMemo(() => {
    const all = [
      ...data.income.map((i:any) => ({ ...i, type: 'CR' })),
      ...data.expenses.map((e:any) => ({ ...e, type: 'DR' })),
      ...data.salaries.map((s:any) => ({ ...s, type: 'DR', category: 'Payroll' }))
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [data]);

  const monthlySnapshot = useMemo(() => {
    const inc = data.income.filter((i: any) => { 
        const d = new Date(i.date); 
        return d.getMonth() === ledgerMonth && d.getFullYear() === ledgerYear; 
    });
    const exp = data.expenses.filter((e: any) => { 
        const d = new Date(e.date); 
        return d.getMonth() === ledgerMonth && d.getFullYear() === ledgerYear; 
    });
    const sal = data.salaries.filter((s: any) => { 
        const d = new Date(s.date); 
        return d.getMonth() === ledgerMonth && d.getFullYear() === ledgerYear; 
    });
    
    return {
      items: [
        ...inc.map((i:any)=>({...i, type: 'CR'})), 
        ...exp.map((e:any)=>({...e, type: 'DR'})), 
        ...sal.map((s:any)=>({...s, type: 'DR', source: 'Payroll'}))
      ],
      totalIncome: inc.reduce((s:number, c:any)=>s+(Number(c.amount) || 0),0),
      totalExpense: exp.reduce((s:number, c:any)=>s+(Number(c.amount) || 0),0) + sal.reduce((s:number, c:any)=>s+(Number(c.amount) || 0),0)
    };
  }, [data, ledgerMonth, ledgerYear]);

  return (
    <div className="space-y-10 pb-32">
      {/* Hero Control Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div>
            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">Command Terminal Active</p>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">
            Executive <span className="text-gray-700">Pulse.</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg flex items-center gap-3">
             {getMonthName(new Date(selectedDate).getMonth())} Financial Intelligence • {currentTime}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-gray-900/80 border border-white/5 p-2 rounded-[2.5rem] shadow-2xl backdrop-blur-xl flex items-center">
            <div className="flex items-center gap-3 px-6 py-4 border-r border-white/5">
                <Calendar size={18} className="text-primary-500" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer" />
            </div>
            <button onClick={() => setSelectedDate(getToday())} className="p-4 text-gray-500 hover:text-white transition-all"><RotateCcw size={18} /></button>
          </div>
          
          <div className="bg-emerald-500 text-white px-8 py-4.5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-500/20">
            <ShieldCheck size={16} /> Data Secured
          </div>
        </div>
      </div>

      {/* Pulse Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 rounded-[3.5rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={100} /></div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Live Credits</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(dailyMetrics.income)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500">
             <span className="text-emerald-500">+12%</span> vs yesterday
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-[3.5rem] relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingDown size={100} /></div>
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2">Operational Debits</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(dailyMetrics.expenses)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500">
             <span className="text-rose-500">-3%</span> vs yesterday
          </div>
        </div>

        <div className="glass-card p-8 rounded-[3.5rem] relative overflow-hidden group hover:border-primary-500/30 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={100} /></div>
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-2">Net Cash Flow</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(dailyMetrics.profit)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500">
             Margin: <span className="text-primary-400">{dailyMetrics.profit > 0 ? 'Optimal' : 'Caution'}</span>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[3.5rem] relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><PieChart size={100} /></div>
          <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-2">Service Health</p>
          <h3 className="text-3xl font-black text-white">{dailyMetrics.attendance}<span className="text-gray-700 mx-2">/</span>{data.staff.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500">
             Staff Presence: <span className="text-purple-400">{Math.round((dailyMetrics.attendance / data.staff.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Intelligence & Actions Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Activity & Insights */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Bar */}
          <div className="bg-primary-600 p-10 rounded-[4rem] shadow-2xl shadow-primary-600/20 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 text-white/10 group-hover:scale-110 transition-transform duration-700"><Target size={300} /></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white tracking-tight uppercase">Operational Speed Log</h3>
              <p className="text-xs font-bold text-white/60 mt-2">Instant ledger entry for hotel operations</p>
            </div>
            <div className="flex gap-4 relative z-10 w-full md:w-auto">
               <button onClick={() => setShowLedger(true)} className="flex-1 md:flex-none px-8 py-5 bg-white text-primary-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                 Open Ledger
               </button>
               <Link to="/staff" className="flex-1 md:flex-none px-8 py-5 bg-primary-700 text-white border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-800 transition-all">
                 Staff Hub
               </Link>
            </div>
          </div>

          {/* Recent Ledger Feed */}
          <div className="glass-card p-10 rounded-[4rem]">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Recent Activity</h3>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-1">Live Transaction Stream</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl text-gray-500"><History size={20} /></div>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${act.type === 'CR' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} group-hover:scale-110 transition-transform`}>
                      {act.type === 'CR' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{act.source || act.category}</p>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{formatDate(act.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${act.type === 'CR' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {act.type === 'CR' ? '+' : '-'}{formatCurrency(act.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Performance Snippet */}
        <div className="space-y-8">
           <div className="glass-card p-10 rounded-[4rem] flex flex-col h-full border-primary-500/10">
              <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-primary-600/10 text-primary-500 rounded-2xl"><Sparkles size={24} /></div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.1em]">Monthly Performance</h3>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">{getMonthName(ledgerMonth)} Summary</p>
                  </div>
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] shadow-inner">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Current Month Revenue</p>
                  <p className="text-3xl font-black text-emerald-500">{formatCurrency(monthlySnapshot.totalIncome)}</p>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 relative overflow-hidden">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-600 mt-3 uppercase tracking-widest">Target: 75% Achieved</p>
                </div>

                <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] shadow-inner">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Current Month Burn</p>
                  <p className="text-3xl font-black text-rose-500">{formatCurrency(monthlySnapshot.totalExpense)}</p>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 relative overflow-hidden">
                    <div className="h-full bg-rose-500 shadow-[0_0_10px_#ef4444]" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-600 mt-3 uppercase tracking-widest">Burn Rate: Stable</p>
                </div>
              </div>
              
              <button onClick={() => setShowLedger(true)} className="mt-8 w-full py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                Full Financial Audit <ArrowUpRight size={14} />
              </button>
           </div>
        </div>
      </div>

      <Modal isOpen={showLedger} onClose={() => setShowLedger(false)} title="Operational Audit Ledger">
        <div className="space-y-8">
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner">
            <Filter size={18} className="text-primary-500 ml-2" />
            <select value={ledgerMonth} onChange={e => setLedgerMonth(Number(e.target.value))} className="bg-transparent text-white font-black uppercase text-[10px] outline-none cursor-pointer flex-1">
                {Array.from({length: 12}).map((_, i) => <option key={i} value={i} className="bg-gray-950">{getMonthName(i)}</option>)}
            </select>
            <select value={ledgerYear} onChange={e => setLedgerYear(Number(e.target.value))} className="bg-transparent text-white font-black uppercase text-[10px] outline-none cursor-pointer flex-1 border-l border-white/5 pl-4">
                <option value="2023" className="bg-gray-950">2023</option>
                <option value="2024" className="bg-gray-950">2024</option>
                <option value="2025" className="bg-gray-950">2025</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Income</p>
              <p className="text-2xl font-black text-white">{formatCurrency(monthlySnapshot.totalIncome)}</p>
            </div>
            <div className="p-8 bg-rose-500/10 rounded-[2.5rem] border border-rose-500/10">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Total Expense</p>
              <p className="text-2xl font-black text-white">{formatCurrency(monthlySnapshot.totalExpense)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2 mb-2">Itemized Ledger</h4>
            {monthlySnapshot.items.length > 0 ? (
                monthlySnapshot.items.sort((a:any, b:any)=> new Date(b.date).getTime() - new Date(a.date).getTime()).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${item.type === 'CR' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {item.type === 'CR' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-black text-white">{String(item.source || item.category || 'General')}</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">{formatDate(item.date)}</p>
                    </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-base font-black ${item.type === 'CR' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.type === 'CR' ? '+' : '-'}{formatCurrency(item.amount)}
                        </p>
                    </div>
                </div>
                ))
            ) : (
                <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/5">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Zero records for this period</p>
                </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- Staff & HR Component ---
const Staff = ({ data, setData, selectedDate }: any) => {
  const toggleAttendance = (sid: string, status: AttendanceStatus) => {
    const other = data.attendance.filter((a: any) => !(a.staffId === sid && a.date === selectedDate));
    setData({ ...data, attendance: [...other, { id: Date.now().toString(), staffId: sid, date: selectedDate, status }] });
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div>
           <div className="flex items-center gap-4 mb-4">
            <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_12px_#3b82f6] animate-pulse"></div>
            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">Human Capital Ledger</p>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">Team <span className="text-gray-700">Hub.</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.staff.map((s: any) => {
          const att = data.attendance.find((a: any) => a.staffId === s.id && a.date === selectedDate);
          return (
            <div key={s.id} className={`p-10 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden group ${att?.status === AttendanceStatus.PRESENT ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-xl' : 'bg-[#0a0f1d] border-white/5 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-10">
                 <div className="p-4 bg-white/5 rounded-[2rem] text-primary-500 group-hover:scale-110 transition-transform">
                    <Users size={28} strokeWidth={2.5} />
                 </div>
                 {att?.status && (
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${att.status === AttendanceStatus.PRESENT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {att.status}
                    </div>
                 )}
              </div>
              <h4 className="text-2xl font-black text-white tracking-tighter mb-1 uppercase">{String(s.name)}</h4>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-10">{String(s.role)}</p>
              
              <div className="flex gap-4 relative z-10">
                <button onClick={() => toggleAttendance(s.id, AttendanceStatus.PRESENT)} className={`flex-1 py-5 rounded-[2rem] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${att?.status === AttendanceStatus.PRESENT ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}>
                  <UserCheck size={14} /> Present
                </button>
                <button onClick={() => toggleAttendance(s.id, AttendanceStatus.ABSENT)} className={`flex-1 py-5 rounded-[2rem] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${att?.status === AttendanceStatus.ABSENT ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}>
                  <UserX size={14} /> Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Reports Component ---
const Reports = ({ data }: any) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const inc = data.income.filter((item: any) => { const d = new Date(item.date); return d.getMonth() === i && d.getFullYear() === selectedYear; }).reduce((s:number, c:any)=> s + (Number(c.amount) || 0), 0);
      const exp = data.expenses.filter((item: any) => { const d = new Date(item.date); return d.getMonth() === i && d.getFullYear() === selectedYear; }).reduce((s:number, c:any)=> s + (Number(c.amount) || 0), 0);
      const sal = data.salaries.filter((item: any) => { const d = new Date(item.date); return d.getMonth() === i && d.getFullYear() === selectedYear; }).reduce((s:number, c:any)=> s + (Number(c.amount) || 0), 0);
      return { name: getMonthName(i).substring(0, 3), income: inc, expenses: exp + sal };
    });
  }, [data, selectedYear]);

  return (
    <div className="space-y-12 pb-32">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div>
           <div className="flex items-center gap-4 mb-4">
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] animate-pulse"></div>
            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.5em]">Fiscal Intelligence Center</p>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">Reports <span className="text-gray-700">& Data.</span></h1>
        </div>
      </div>

      <div className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-16 relative z-10">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Annual Fiscal Curve</h3>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-[#0a0f1d] border border-white/10 rounded-2xl px-8 py-4 text-xs font-black text-white outline-none shadow-xl">
            <option value="2023" className="bg-gray-900 text-white">2023</option>
            <option value="2024" className="bg-gray-900 text-white">2024</option>
            <option value="2025" className="bg-gray-900 text-white">2025</option>
          </select>
        </div>
        
        <div className="h-[450px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={12}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10, fontWeight: 900}} dy={15} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                contentStyle={{background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', padding: '15px'}} 
              />
              <Bar dataKey="income" fill="#10b981" radius={[12, 12, 0, 0]} barSize={32} />
              <Bar dataKey="expenses" fill="#f43f5e" radius={[12, 12, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---
const Header = () => {
  return (
    <header className="pt-10 mb-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-5 group">
        <div className="p-4 bg-primary-600 rounded-[2rem] shadow-2xl shadow-primary-600/30 group-hover:rotate-6 transition-transform">
          <Hotel className="text-white" size={28} strokeWidth={3} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Hotel<span className="text-primary-500">Pro</span></h1>
          <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.6em] mt-1.5">Management Suite</p>
        </div>
      </Link>
      
      <div className="hidden md:flex items-center gap-4 bg-gray-900/50 p-2.5 rounded-[2.5rem] border border-white/5 shadow-inner">
         <div className="flex items-center gap-3 px-6 py-3 border-r border-white/5">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-white tracking-widest">System Online</span>
         </div>
         <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-primary-500 border border-white/5">
            <Clock size={18} />
         </div>
      </div>
    </header>
  );
};

const QuickNav = () => (
  <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] p-3 glass-nav rounded-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex items-center gap-3 border border-white/10 animate-in slide-in-from-bottom-10 duration-1000">
    {[
      { path: '/', icon: LayoutDashboard, label: 'Dash' },
      { path: '/staff', icon: Users, label: 'Team' },
      { path: '/reports', icon: BarChart3, label: 'Data' }
    ].map(item => (
      <NavLink key={item.path} to={item.path} className={({isActive}) => `flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 ${isActive ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/40 scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
        <item.icon size={22} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

const App = () => {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hotelpro_enhanced_data');
    return saved ? JSON.parse(saved) : {
      income: [
        { id: 'i1', date: getToday(), source: 'Suite Premium', amount: 25000 },
        { id: 'i2', date: getToday(), source: 'Restaurant', amount: 12000 }
      ],
      expenses: [
        { id: 'e1', date: getToday(), category: 'Supply Chain', amount: 8000 }
      ],
      staff: INITIAL_STAFF,
      attendance: [],
      salaries: []
    };
  });

  useEffect(() => {
    localStorage.setItem('hotelpro_enhanced_data', JSON.stringify(data));
  }, [data]);

  return (
    <Router>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard data={data} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />} />
          <Route path="/staff" element={<Staff data={data} setData={setData} selectedDate={selectedDate} />} />
          <Route path="/reports" element={<Reports data={data} />} />
        </Routes>
        <QuickNav />
      </div>
    </Router>
  );
};

// --- Mount ---
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}