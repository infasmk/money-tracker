
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency, getMonthName } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Fix: Added missing TrendingDown and Wallet imports
import { FileText, FileSpreadsheet, PieChart, Activity, TrendingDown, Wallet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
    const { income, expenses, salaryTransactions } = useData();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const years = useMemo(() => {
        const allDates = [...income.map(i => i.date), ...expenses.map(e => e.date), ...salaryTransactions.map(s => s.date)];
        if (allDates.length === 0) return [new Date().getFullYear()];
        const allYears = [...new Set(allDates.map(d => new Date(d).getFullYear()))];
        return Array.from(allYears).sort((a,b) => b-a);
    }, [income, expenses, salaryTransactions]);

    const reportData = useMemo(() => {
        const monthlyIncome = income.filter(i => {
            const d = new Date(i.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }).reduce((sum, i) => sum + i.amount, 0);

        const monthlyExpLedger = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }).reduce((sum, e) => sum + e.amount, 0);

        const monthlySalaries = salaryTransactions.filter(s => {
            const d = new Date(s.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }).reduce((sum, s) => sum + s.amount, 0);

        const totalExpenses = monthlyExpLedger + monthlySalaries;
        const netProfit = monthlyIncome - totalExpenses;

        return { monthlyIncome, monthlyExpenses: totalExpenses, monthlySalaries, netProfit };
    }, [income, expenses, salaryTransactions, selectedYear, selectedMonth]);

    const yearlyChartData = useMemo(() => {
        const data = Array.from({ length: 12 }).map((_, i) => ({
            name: getMonthName(i).substring(0, 3),
            income: 0,
            expenses: 0,
            profit: 0
        }));

        income.forEach(i => {
            const d = new Date(i.date);
            if (d.getFullYear() === selectedYear) {
                data[d.getMonth()].income += i.amount;
            }
        });
        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === selectedYear) {
                data[d.getMonth()].expenses += e.amount;
            }
        });
        salaryTransactions.forEach(s => {
            const d = new Date(s.date);
            if (d.getFullYear() === selectedYear) {
                data[d.getMonth()].expenses += s.amount;
            }
        });
        
        data.forEach(month => {
            month.profit = month.income - month.expenses;
        });

        return data;
    }, [income, expenses, salaryTransactions, selectedYear]);
    
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const monthName = getMonthName(selectedMonth);
            doc.setFontSize(18);
            doc.text(`Hotel Operational Report`, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Period: ${monthName}, ${selectedYear}`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

            autoTable(doc, {
                startY: 45,
                head: [['Financial Category', 'Metric Value']],
                body: [
                    ['Total Monthly Income', formatCurrency(reportData.monthlyIncome)],
                    ['Total Operational Expenses (Ledger + Salaries)', formatCurrency(reportData.monthlyExpenses)],
                    ['Total Salaries/Advances Distributed', formatCurrency(reportData.monthlySalaries)],
                    ['Net Operational Surplus', formatCurrency(reportData.netProfit)],
                ],
                theme: 'striped',
                headStyles: { 
                    fillColor: [37, 99, 235],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    cellPadding: 5
                },
                bodyStyles: {
                    cellPadding: 5
                },
                columnStyles: {
                    1: { halign: 'right', fontStyle: 'bold' }
                }
            });

            doc.save(`HotelPro_Report_${monthName}_${selectedYear}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
        }
    };

    const handleExportExcel = () => {
        try {
            const monthName = getMonthName(selectedMonth);
            const data = [
                { 'Report Component': 'Total Income', 'Amount (INR)': reportData.monthlyIncome },
                { 'Report Component': 'Total Expenses', 'Amount (INR)': reportData.monthlyExpenses },
                { 'Report Component': 'Total Salaries Paid', 'Amount (INR)': reportData.monthlySalaries },
                { 'Report Component': 'Net Profit', 'Amount (INR)': reportData.netProfit },
            ];
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Financial Summary');
            XLSX.writeFile(wb, `HotelPro_Audit_${monthName}_${selectedYear}.xlsx`);
        } catch (error) {
            console.error('Excel export failed:', error);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-32">
            <div className="bg-gray-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-3xl">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Audit Hub</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Annual reconciliation & fiscal trajectory</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 bg-black/40 p-2 rounded-[2.5rem] border border-white/5">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))} 
                            className="bg-transparent text-[11px] font-black text-primary-500 uppercase tracking-widest px-6 py-4 outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i} className="bg-black">{getMonthName(i)}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))} 
                            className="bg-transparent text-[11px] font-black text-primary-500 uppercase tracking-widest px-6 py-4 outline-none cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y} className="bg-black">{y}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <button onClick={handleExportPDF} className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 active:scale-95">
                               <FileText size={14}/> PDF
                            </button>
                             <button onClick={handleExportExcel} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                               <FileSpreadsheet size={14}/> Excel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-10 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl w-fit mb-6"><Activity size={20} /></div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Monthly Credits</p>
                        <p className="text-3xl font-black text-white">{formatCurrency(reportData.monthlyIncome)}</p>
                    </div>
                    <div className="p-10 bg-rose-500/5 rounded-[3rem] border border-rose-500/10 hover:bg-rose-500/10 transition-all">
                        <div className="p-3 bg-rose-500 text-white rounded-2xl w-fit mb-6"><TrendingDown size={20} /></div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Total Debits</p>
                        <p className="text-3xl font-black text-white">{formatCurrency(reportData.monthlyExpenses)}</p>
                    </div>
                    <div className="p-10 bg-primary-500/5 rounded-[3rem] border border-primary-500/10 hover:bg-primary-500/10 transition-all">
                        <div className="p-3 bg-primary-500 text-white rounded-2xl w-fit mb-6"><Wallet size={20} /></div>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2">Salaries Paid</p>
                        <p className="text-3xl font-black text-white">{formatCurrency(reportData.monthlySalaries)}</p>
                    </div>
                    <div className="p-10 bg-purple-500/5 rounded-[3rem] border border-purple-500/10 hover:bg-purple-500/10 transition-all">
                        <div className="p-3 bg-purple-500 text-white rounded-2xl w-fit mb-6"><PieChart size={20} /></div>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Net Surplus</p>
                        <p className="text-3xl font-black text-white">{formatCurrency(reportData.netProfit)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl">
                <div className="mb-12">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Annual Performance Curve</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Fiscal year {selectedYear} visualization</p>
                </div>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yearlyChartData}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#4b5563', fontWeight: 900}} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111827',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    fontWeight: '900',
                                    fontSize: '11px'
                                }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                             />
                            <Legend wrapperStyle={{fontSize: "10px", fontWeight: "900", paddingTop: "30px", textTransform: "uppercase"}}/>
                            <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} barSize={24} />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenditure" radius={[8, 8, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
