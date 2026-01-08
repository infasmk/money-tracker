import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Calendar, User, Briefcase, IndianRupee, ArrowLeft, PlusCircle, CheckCircle2, XCircle, TrendingDown, Receipt, Wallet, Loader2 } from 'lucide-react';
import { formatDate, formatCurrency, getTodayDateString } from '../utils/helpers';
import { SalaryTransaction, SalaryTransactionType, ExpenseCategory, PaymentMode, ExpenseEntry } from '../types';
import Modal from '../components/Modal';

const StaffDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { staff, attendance, salaryTransactions, setSalaryTransactions, expenses, setExpenses, syncToCloud, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<Partial<SalaryTransaction> | null>(null);

    const member = useMemo(() => staff.find(s => s.id === id), [staff, id]);

    // Precise monthly financial calculations
    const currentMonthStats = useMemo(() => {
        if (!member) return { totalPaidThisMonth: 0, balance: 0, attendanceScore: 0, presents: 0, totalDays: 0 };
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Fix: Use staff_id instead of staffId
        const monthTxs = salaryTransactions.filter(st => {
            const d = new Date(st.date);
            return st.staff_id === id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalPaid = monthTxs.reduce((sum, t) => sum + t.amount, 0);
        // Fix: Use monthly_salary instead of monthlySalary
        const balance = member.monthly_salary - totalPaid;

        // Fix: Use staff_id instead of staffId
        const monthAttendance = attendance.filter(a => {
            const d = new Date(a.date);
            return a.staff_id === id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const presents = monthAttendance.filter(a => a.status === 'Present').length;
        const score = monthAttendance.length > 0 ? Math.round((presents / monthAttendance.length) * 100) : 0;

        return { 
            totalPaidThisMonth: totalPaid, 
            balance: Math.max(0, balance), 
            attendanceScore: score,
            presents,
            totalDays: monthAttendance.length
        };
    }, [member, salaryTransactions, attendance, id]);

    const memberSalaryTxs = useMemo(() => {
        // Fix: Use staff_id instead of staffId
        return salaryTransactions.filter(st => st.staff_id === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [salaryTransactions, id]);

    const memberAttendance = useMemo(() => {
        // Fix: Use staff_id instead of staffId
        return attendance.filter(a => a.staff_id === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, id]);

    const handleOpenModal = () => {
        // Fix: Use staff_id instead of staffId
        setCurrentTransaction({ staff_id: id, date: getTodayDateString(), type: SalaryTransactionType.ADVANCE, amount: 0 });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTransaction(null);
        setIsSaving(false);
    };

    const handleSaveTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentTransaction || !member) return;
        setIsSaving(true);

        const txId = `sal-${Date.now()}`;
        const newTransaction: SalaryTransaction = {
            ...currentTransaction,
            id: txId,
        } as SalaryTransaction;
        
        // 1. Log to Salary Ledger locally
        setSalaryTransactions(prev => [...prev, newTransaction]);

        // 2. CRITICAL SYNC: Auto-log to Expenses Ledger locally
        const newExpense: ExpenseEntry = {
            id: `pay-sync-${txId}`,
            date: newTransaction.date,
            category: ExpenseCategory.SALARY,
            amount: newTransaction.amount,
            // Fix: Use payment_mode instead of paymentMode
            payment_mode: PaymentMode.ONLINE,
            notes: `[PAYROLL-AUTO] ${newTransaction.type} for ${member.name}. Memo: ${newTransaction.notes || 'None'}`
        };
        setExpenses(prev => [...prev, newExpense]);

        // 3. PERSIST TO CLOUD
        try {
            await Promise.all([
                syncToCloud('salary_transactions', newTransaction),
                syncToCloud('expenses', newExpense)
            ]);
        } catch (err) {
            console.error("Cloud sync failed for payroll:", err);
        }

        handleCloseModal();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
                <Loader2 className="animate-spin text-primary-500" size={48} />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Decrypting Profile...</p>
            </div>
        );
    }

    if (!member) return <div className="text-center p-20 font-black uppercase text-gray-600">Employee profile not found.</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            <Link to="/staff" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-primary-500 transition-all">
                <ArrowLeft size={14} /> System Directory
            </Link>

            {/* Profile Card */}
            <div className="bg-gray-900 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-white/5 flex flex-col lg:flex-row items-center gap-12">
                <div className="h-36 w-36 rounded-[3rem] bg-primary-600 flex items-center justify-center text-white shadow-2xl shadow-primary-600/20 relative group">
                    <User size={64} strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-white/10 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center lg:text-left flex-1">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">{member.name}</h2>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        <span className="px-5 py-2 bg-primary-500/10 text-primary-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary-500/20">{member.role}</span>
                        {/* Fix: Use joining_date instead of joiningDate */}
                        <span className="px-5 py-2 bg-white/5 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5">Joined {formatDate(member.joining_date)}</span>
                    </div>
                </div>
                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 min-w-[240px] text-center shadow-inner">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Base Salary</p>
                    {/* Fix: Use monthly_salary instead of monthlySalary */}
                    <p className="text-3xl font-black text-white">{formatCurrency(member.monthly_salary)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Salary Ledger */}
                    <div className="bg-gray-900 p-8 sm:p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight uppercase">Salary Ledger</h3>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Real-time expense synchronization active</p>
                            </div>
                            <button onClick={handleOpenModal} className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 text-white bg-primary-600 rounded-2xl hover:bg-primary-700 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary-600/30 transition-all active:scale-95">
                                <PlusCircle size={18} /> Process Payment
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Paid (Month)</p>
                                </div>
                                <p className="text-3xl font-black text-white">{formatCurrency(currentMonthStats.totalPaidThisMonth)}</p>
                            </div>
                            <div className="p-8 bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Balance Remaining</p>
                                </div>
                                <p className="text-3xl font-black text-white">{formatCurrency(currentMonthStats.balance)}</p>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">Payment Date</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">Transaction</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {memberSalaryTxs.map(tx => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-5 text-xs font-bold text-gray-400">{formatDate(tx.date)}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${tx.type === SalaryTransactionType.ADVANCE ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-black text-white">{formatCurrency(tx.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {memberSalaryTxs.length === 0 && <p className="p-16 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Audit trail is empty</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Monthly Attendance History */}
                    <div className="bg-gray-900 p-8 sm:p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">Efficiency Score</h3>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Attendance Logs</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-10 p-6 bg-black/30 rounded-3xl border border-white/5">
                            <div className="text-center">
                                <p className="text-4xl font-black text-emerald-500">{currentMonthStats.attendanceScore}%</p>
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2">Active Ratio</p>
                            </div>
                            <div className="h-12 w-px bg-white/5"></div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-white">{currentMonthStats.presents} <span className="text-gray-700">/ {currentMonthStats.totalDays}</span></p>
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2">Days Logged</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-3 custom-scrollbar">
                            {memberAttendance.map(att => (
                                <div key={att.id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-transparent hover:border-white/5 transition-all">
                                    <span className="text-xs font-bold text-gray-500">{formatDate(att.date)}</span>
                                    <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${att.status === 'Present' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className={`h-2 w-2 rounded-full ${att.status === 'Present' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>
                                        {att.status}
                                    </span>
                                </div>
                            ))}
                            {memberAttendance.length === 0 && <p className="text-center py-12 text-[10px] font-black text-gray-700 uppercase tracking-widest">No history recorded</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Process Staff Payment">
                <form onSubmit={handleSaveTransaction} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Payroll Category</label>
                        <select 
                            value={currentTransaction?.type || ''} 
                            onChange={(e) => setCurrentTransaction({ ...currentTransaction, type: e.target.value as SalaryTransactionType })} 
                            required 
                            className="form-input"
                        >
                            <option value={SalaryTransactionType.ADVANCE}>Salary Advance</option>
                            <option value={SalaryTransactionType.SALARY}>Full Salary Payout</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount (₹)</label>
                            <input 
                                type="number" 
                                value={currentTransaction?.amount || ''} 
                                onChange={(e) => setCurrentTransaction({ ...currentTransaction, amount: parseFloat(e.target.value) || 0 })} 
                                required 
                                className="form-input" 
                                min="1"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Process Date</label>
                            <input 
                                type="date" 
                                value={currentTransaction?.date || ''} 
                                onChange={(e) => setCurrentTransaction({ ...currentTransaction, date: e.target.value })} 
                                required 
                                className="form-input" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Audit Note</label>
                        <textarea 
                            value={currentTransaction?.notes || ''} 
                            onChange={(e) => setCurrentTransaction({ ...currentTransaction, notes: e.target.value })} 
                            className="form-input h-28 resize-none"
                            placeholder="Add reason for advance or performance bonus details..."
                        ></textarea>
                    </div>
                    
                    <div className="bg-primary-500/10 p-5 rounded-2xl flex items-start gap-4 border border-primary-500/10">
                        <Receipt size={20} className="text-primary-500 mt-0.5" />
                        <p className="text-[10px] font-bold text-gray-400 leading-normal">
                            System Notice: This transaction will be automatically cross-referenced in the <span className="text-primary-400">Bills & Expenses</span> ledger for accurate end-of-month reporting.
                        </p>
                    </div>

                    <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                        <button type="button" onClick={handleCloseModal} className="px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Discard</button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-10 py-4 text-[10px] font-black text-white bg-primary-600 rounded-2xl shadow-2xl shadow-primary-600/20 hover:bg-primary-700 uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin h-3 w-3" /> : null}
                            {isSaving ? 'Processing...' : 'Authorize & Sync'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Fix: Standardized style tag by removing the non-standard jsx attribute */}
            <style>{`
                .form-input {
                    display: block;
                    width: 100%;
                    padding: 1.125rem 1.25rem;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.05);
                    background-color: rgba(0,0,0,0.4);
                    color: white;
                    font-size: 0.9375rem;
                    font-weight: 800;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background-color: rgba(0,0,0,0.6);
                    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.08);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default StaffDetail;