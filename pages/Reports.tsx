
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatCurrency, getMonthName } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
    const { income, expenses, salaryTransactions } = useData();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const years = useMemo(() => {
        const allDates = [...income.map(i => i.date), ...expenses.map(e => e.date)];
        if (allDates.length === 0) return [new Date().getFullYear()];
        const allYears = [...new Set(allDates.map(d => new Date(d).getFullYear()))];
        return Array.from(allYears).sort((a,b) => b-a);
    }, [income, expenses]);

    const reportData = useMemo(() => {
        const monthlyIncome = income.filter(i => {
            const d = new Date(i.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }).reduce((sum, i) => sum + i.amount, 0);

        const monthlyExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }).reduce((sum, e) => sum + e.amount, 0);

        const monthlySalaries = salaryTransactions.filter(s => {
            const d = new Date(s.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }).reduce((sum, s) => sum + s.amount, 0);

        const netProfit = monthlyIncome - monthlyExpenses;

        return { monthlyIncome, monthlyExpenses, monthlySalaries, netProfit };
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
        
        data.forEach(month => {
            month.profit = month.income - month.expenses;
        });

        return data;
    }, [income, expenses, selectedYear]);
    
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
                    ['Total Operational Expenses', formatCurrency(reportData.monthlyExpenses)],
                    ['Staff Salaries Distributed', formatCurrency(reportData.monthlySalaries)],
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

            doc.save(`HotelReport-${monthName}-${selectedYear}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
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
            XLSX.writeFile(wb, `HotelFinancials-${monthName}-${selectedYear}.xlsx`);
        } catch (error) {
            console.error('Excel export failed:', error);
            alert('Excel export failed. Please check data.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight mb-1">Financial Audits</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly aggregation & performance metrics</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))} 
                            className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold min-w-[140px]"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i}>{getMonthName(i)}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))} 
                            className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold min-w-[100px]"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="h-10 w-px bg-gray-100 dark:bg-gray-700 hidden sm:block"></div>
                        <div className="flex gap-2">
                            <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-white bg-rose-600 rounded-2xl hover:bg-rose-700 uppercase tracking-widest transition-all shadow-xl shadow-rose-600/20 active:scale-95">
                               <FileText size={16}/> PDF
                            </button>
                             <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                               <FileSpreadsheet size={16}/> Excel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-8 bg-blue-50/50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100/50 dark:border-blue-800/20">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Total Income</p>
                        <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(reportData.monthlyIncome)}</p>
                    </div>
                    <div className="p-8 bg-amber-50/50 dark:bg-amber-900/20 rounded-[2rem] border border-amber-100/50 dark:border-amber-800/20">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Total Expenses</p>
                        <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{formatCurrency(reportData.monthlyExpenses)}</p>
                    </div>
                    <div className="p-8 bg-rose-50/50 dark:bg-rose-900/20 rounded-[2rem] border border-rose-100/50 dark:border-rose-800/20">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Salaries Paid</p>
                        <p className="text-2xl font-black text-rose-900 dark:text-rose-100">{formatCurrency(reportData.monthlySalaries)}</p>
                    </div>
                    <div className="p-8 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-800/20">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Net Surplus</p>
                        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(reportData.netProfit)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mb-8">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Annual Yield Trajectory</h3>
                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">Fiscal Performance Breakdown for {selectedYear}</p>
                </div>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yearlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.05)" />
                            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 900}} />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 900}} tickFormatter={(value) => `₹${Number(value)/1000}k`}/>
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                cursor={{ fill: 'rgba(59, 130, 246, 0.03)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '20px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                    fontWeight: '900',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}
                             />
                            <Legend wrapperStyle={{fontSize: "10px", fontWeight: "900", paddingTop: "20px", textTransform: "uppercase", letterSpacing: "1px"}}/>
                            <Bar dataKey="income" fill="#10b981" name="Income Flow" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenditure" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="profit" fill="#3b82f6" name="Net Yield" radius={[6, 6, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
