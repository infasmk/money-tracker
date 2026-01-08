import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency, getMonthName } from '../utils/helpers';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    FileText, FileSpreadsheet, TrendingUp, TrendingDown, 
    Target, PieChart as PieIcon, Activity,
    ArrowUpRight, ArrowDownRight, Calculator
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
    const { income, expenses } = useData();
    // Start from 2026 as requested
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());

    // 1. Annual Calculation Logic
    const annualStats = useMemo(() => {
        const yearIncome = income.filter(i => new Date(i.date).getFullYear() === selectedYear)
            .reduce((s, c) => s + c.amount, 0);
        const yearExpense = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear)
            .reduce((s, c) => s + c.amount, 0);
        return {
            revenue: yearIncome,
            expense: yearExpense,
            profit: yearIncome - yearExpense,
            margin: yearIncome > 0 ? ((yearIncome - yearExpense) / yearIncome * 100).toFixed(1) : '0'
        };
    }, [income, expenses, selectedYear]);

    // 2. Full 12-Month Fiscal Trajectory
    const monthlyTrajectory = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => {
            const mInc = income.filter(item => {
                const d = new Date(item.date);
                return d.getFullYear() === selectedYear && d.getMonth() === i;
            }).reduce((sum, item) => sum + item.amount, 0);

            const mExp = expenses.filter(item => {
                const d = new Date(item.date);
                return d.getFullYear() === selectedYear && d.getMonth() === i;
            }).reduce((sum, item) => sum + item.amount, 0);

            return {
                name: getMonthName(i).substring(0, 3),
                fullMonth: getMonthName(i),
                income: mInc,
                expenses: mExp,
                profit: mInc - mExp
            };
        });
    }, [income, expenses, selectedYear]);

    // 3. Current Selected Month Deep Audit
    const currentAudit = useMemo(() => {
        const mData = monthlyTrajectory[selectedMonthIndex];
        const prevMonth = selectedMonthIndex > 0 ? monthlyTrajectory[selectedMonthIndex - 1] : null;

        const momGrowth = prevMonth && prevMonth.income > 0 
            ? ((mData.income - prevMonth.income) / prevMonth.income * 100).toFixed(1) 
            : '0';

        // Distribution Mix
        const incomeMix = income.filter(i => {
            const d = new Date(i.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthIndex;
        }).reduce((acc: any, curr) => {
            acc[curr.source] = (acc[curr.source] || 0) + curr.amount;
            return acc;
        }, {});

        const expenseMix = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthIndex;
        }).reduce((acc: any, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        const formatMix = (mix: any) => Object.entries(mix).map(([name, value]) => ({ name, value: value as number }));

        return {
            ...mData,
            momGrowth: parseFloat(momGrowth),
            incomeData: formatMix(incomeMix),
            expenseData: formatMix(expenseMix)
        };
    }, [monthlyTrajectory, selectedMonthIndex, income, expenses, selectedYear]);

    // 4. Export Suite
    const handleExportPDF = () => {
        const doc = new jsPDF() as any;
        doc.setFontSize(22);
        doc.text(`HotelPro Financial Audit`, 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fiscal Year: ${selectedYear} | Selected Month: ${currentAudit.fullMonth}`, 14, 28);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 34);

        autoTable(doc, {
            startY: 45,
            head: [['Period Component', 'Metric Value', 'Notes']],
            body: [
                ['Total Monthly Revenue', formatCurrency(currentAudit.income), 'Gross Intake'],
                ['Total Monthly Burn', formatCurrency(currentAudit.expenses), 'Operational Costs'],
                ['Net Monthly Yield', formatCurrency(currentAudit.profit), currentAudit.profit >= 0 ? 'Surplus' : 'Deficit'],
                ['MoM Growth', `${currentAudit.momGrowth}%`, 'Vs Previous Period'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        doc.save(`HotelPro_Audit_${currentAudit.fullMonth}_${selectedYear}.pdf`);
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(monthlyTrajectory.map(m => ({
            Month: m.fullMonth,
            Income: m.income,
            Expenses: m.expenses,
            Profit: m.profit
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Annual Performance');
        XLSX.writeFile(wb, `HotelPro_Fiscal_${selectedYear}.xlsx`);
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32">
            {/* Header / Annual Summary */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8">
                <div className="flex-1 bg-gray-900/60 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Calculator size={180} />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-primary-600 rounded-3xl text-white shadow-xl shadow-primary-600/20">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Audit Center</h2>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Forward Fiscal Horizon {selectedYear}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Annual Revenue</p>
                                <p className="text-2xl font-black text-white">{formatCurrency(annualStats.revenue)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Annual Burn</p>
                                <p className="text-2xl font-black text-rose-500">{formatCurrency(annualStats.expense)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Annual Yield</p>
                                <p className="text-2xl font-black text-emerald-500">{formatCurrency(annualStats.profit)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Operating Margin</p>
                                <p className="text-2xl font-black text-primary-500">{annualStats.margin}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-10">
                        <button onClick={handleExportPDF} className="flex-1 py-4 bg-rose-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20">
                            <FileText size={16} /> Export Audit PDF
                        </button>
                        <button onClick={handleExportExcel} className="flex-1 py-4 bg-emerald-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">
                            <FileSpreadsheet size={16} /> Save Master Excel
                        </button>
                    </div>
                </div>

                {/* Year Selector / Controls */}
                <div className="bg-gray-900/60 p-10 rounded-[4rem] border border-white/5 flex flex-col justify-center items-center gap-6 min-w-[280px]">
                    <div className="p-8 bg-white/5 rounded-full border border-white/5 shadow-inner">
                        <Target size={40} className="text-primary-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Future Fiscal Target</p>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-black border border-white/10 rounded-2xl px-8 py-4 text-xl font-black text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 cursor-pointer"
                        >
                            {/* Updated Range: 2026 onwards */}
                            {[2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y} Fiscal</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Performance Trajectory Visualization */}
            <div className="bg-gray-900/40 p-12 rounded-[4rem] border border-white/5 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Financial Trajectory</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">12-Month Comparative Yield Chart</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[9px] font-black text-gray-500 uppercase">Gross Credit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                            <span className="text-[9px] font-black text-gray-500 uppercase">Operating Debit</span>
                        </div>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrajectory}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontWeight: 900, fontSize: 10}} dy={10} />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip 
                                cursor={{stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2}}
                                contentStyle={{backgroundColor: '#0a0f1d', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', fontWeight: '900', fontSize: '11px'}}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Deep Audit Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Ledger Table */}
                <div className="lg:col-span-2 bg-gray-900/40 p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <Calculator size={18} className="text-primary-500" /> Monthly Fiscal Ledger
                        </h3>
                        <div className="p-1 bg-black/40 rounded-xl border border-white/5">
                           <select 
                                value={selectedMonthIndex}
                                onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value))}
                                className="bg-transparent text-[10px] font-black text-primary-500 uppercase tracking-widest px-4 py-2 cursor-pointer outline-none"
                            >
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={i} className="bg-black">{getMonthName(i)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-900/80 backdrop-blur-md">
                                <tr>
                                    <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Month</th>
                                    <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Credit</th>
                                    <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Debit</th>
                                    <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Net Surplus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {monthlyTrajectory.map((m, idx) => (
                                    <tr 
                                        key={idx} 
                                        onClick={() => setSelectedMonthIndex(idx)}
                                        className={`group cursor-pointer transition-all ${selectedMonthIndex === idx ? 'bg-primary-600/10' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-black ${selectedMonthIndex === idx ? 'text-white' : 'text-gray-400'}`}>{m.fullMonth}</span>
                                                {selectedMonthIndex === idx && <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-emerald-500">{formatCurrency(m.income)}</td>
                                        <td className="px-8 py-6 text-sm font-black text-rose-500">{formatCurrency(m.expenses)}</td>
                                        <td className={`px-8 py-6 text-sm font-black ${m.profit >= 0 ? 'text-primary-500' : 'text-rose-600'}`}>
                                            {formatCurrency(m.profit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Selected Month Mix Analysis */}
                <div className="space-y-10">
                    {/* Growth Card */}
                    <div className="bg-gray-900/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">MoM Performance</p>
                            <h4 className={`text-4xl font-black tracking-tighter ${currentAudit.momGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {currentAudit.momGrowth > 0 ? '+' : ''}{currentAudit.momGrowth}%
                            </h4>
                        </div>
                        <div className={`p-6 rounded-[2rem] relative z-10 ${currentAudit.momGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {currentAudit.momGrowth >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                        </div>
                    </div>

                    {/* Distribution Pie */}
                    <div className="bg-gray-900/40 p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-10 w-full">
                            <PieIcon size={18} className="text-primary-500" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Expense Mix</h3>
                        </div>
                        <div className="h-56 w-full mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={currentAudit.expenseData.length > 0 ? currentAudit.expenseData : [{name: 'Empty', value: 1}]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {currentAudit.expenseData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#111827', borderRadius: '16px', border: 'none', fontSize: '10px', fontWeight: '900'}}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full space-y-3">
                            {currentAudit.expenseData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase">{entry.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white">{formatCurrency(entry.value)}</span>
                                </div>
                            ))}
                            {currentAudit.expenseData.length === 0 && (
                                <p className="text-center py-4 text-[9px] font-black text-gray-700 uppercase">Awaiting ledger entries...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Audit Tips / Summary */}
            <div className="bg-primary-600 p-12 rounded-[4rem] text-white shadow-2xl shadow-primary-600/30 flex flex-col md:flex-row items-center justify-between gap-12 group overflow-hidden relative">
                <div className="absolute -left-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                    <Calculator size={280} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h4 className="text-4xl font-black uppercase tracking-tighter mb-4">Fiscal Health Summary</h4>
                    <p className="text-sm font-bold opacity-80 leading-relaxed">
                        Based on the rolling audit for <span className="text-white font-black">{currentAudit.fullMonth}</span>, 
                        your operational efficiency is projected to be <span className="text-white font-black">{((currentAudit.profit / (currentAudit.income || 1)) * 100).toFixed(1)}%</span>. 
                        Records from 2026 onwards are tracked as part of the forward-looking enterprise strategy.
                    </p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="p-8 bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center min-w-[140px]">
                        <p className="text-3xl font-black">94%</p>
                        <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mt-1">Audit Score</p>
                    </div>
                    <div className="p-8 bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center min-w-[140px]">
                        <p className="text-3xl font-black">Green</p>
                        <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mt-1">Safety Level</p>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default Reports;