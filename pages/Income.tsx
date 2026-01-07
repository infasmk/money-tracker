
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { IncomeEntry, IncomeSource } from '../types';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { 
    PlusCircle, Edit, Trash2, Search, Filter, 
    ChevronDown, ChevronUp, BedDouble, Utensils, 
    Sparkles, MoreHorizontal, Wallet 
} from 'lucide-react';

const CardSkeleton = () => (
    <div className="bg-gray-900/50 p-6 rounded-[2rem] border border-white/5 animate-pulse h-48"></div>
);

const Income: React.FC = () => {
    const { income, setIncome, selectedDate, syncToCloud, deleteFromCloud, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [currentIncome, setCurrentIncome] = useState<Partial<IncomeEntry> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterByDate, setFilterByDate] = useState(true);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    const handleOpenModal = (incomeEntry?: IncomeEntry) => {
        setCurrentIncome(incomeEntry || { date: selectedDate });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentIncome(null);
        setIsModalOpen(false);
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedCards);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedCards(newSet);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentIncome) return;

        const newItem = currentIncome.id 
            ? { ...currentIncome as IncomeEntry }
            : { ...currentIncome, id: `inc-${Date.now()}` } as IncomeEntry;

        const success = await syncToCloud('income', newItem);
        if (success) {
            if (currentIncome.id) {
                setIncome(prev => prev.map(i => i.id === currentIncome.id ? newItem : i));
            } else {
                setIncome(prev => [...prev, newItem]);
            }
            handleCloseModal();
        }
    };

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            setIncome(prev => prev.filter(i => i.id !== itemToDelete));
            await deleteFromCloud('income', itemToDelete);
            setItemToDelete(null);
        }
    };
    
    const filteredIncome = useMemo(() => {
        let list = income;
        if (filterByDate) {
            list = list.filter(i => i.date === selectedDate);
        }
        return list
            .filter(i => 
                i.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatCurrency(i.amount).includes(searchTerm)
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [income, searchTerm, filterByDate, selectedDate]);

    const totalIncome = useMemo(() => filteredIncome.reduce((sum, item) => sum + item.amount, 0), [filteredIncome]);

    const getIcon = (source: IncomeSource) => {
        switch (source) {
            case IncomeSource.ROOM_RENT: return <BedDouble size={20} />;
            case IncomeSource.RESTAURANT: return <Utensils size={20} />;
            case IncomeSource.EXTRA_SERVICES: return <Sparkles size={20} />;
            default: return <MoreHorizontal size={20} />;
        }
    };

    const formInputClass = "block w-full px-6 py-5 rounded-2xl border border-white/10 bg-black/60 text-base font-bold text-white transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 placeholder:text-gray-600 appearance-none";

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Revenue Overview Summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 sm:p-10 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-500 rounded-3xl text-white shadow-lg shadow-emerald-500/20">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-1">Net Revenue</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filteredIncome.length} Records Logged</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl sm:text-5xl font-black text-white tracking-tighter">{formatCurrency(totalIncome)}</p>
                </div>
            </div>

            {/* Optimized Sticky Action Bar */}
            <div className="bg-gray-950/90 p-4 sm:p-6 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-2xl sticky top-[6.5rem] z-[80]">
                <div className="flex flex-col gap-4">
                    <div className="relative group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find specific logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4.5 text-sm bg-black/40 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-white font-bold"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setFilterByDate(!filterByDate)}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4.5 text-[10px] font-black rounded-2xl transition-all border uppercase tracking-[0.3em] ${filterByDate ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                        >
                            <Filter size={16} />
                            {filterByDate ? 'Date' : 'All'}
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex-1 flex items-center justify-center gap-3 px-6 py-4.5 text-white bg-primary-600 rounded-2xl hover:bg-primary-500 transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary-600/30 active:scale-95 group"
                        >
                            <PlusCircle className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                            Log New
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                ) : filteredIncome.length > 0 ? (
                    filteredIncome.map(item => {
                        const isExpanded = expandedCards.has(item.id);
                        return (
                            <div 
                                key={item.id} 
                                className={`group bg-gray-900 border border-white/5 rounded-[2rem] p-6 hover:border-emerald-500/30 transition-all duration-500 relative flex flex-col justify-between ${isExpanded ? 'ring-2 ring-emerald-500/20' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                            {getIcon(item.source)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-[15px] tracking-tight leading-none mb-1.5">{item.source}</h4>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{formatDate(item.date)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-black text-emerald-500 tracking-tighter">{formatCurrency(item.amount)}</p>
                                </div>

                                {item.notes && (
                                    <div className="mb-6">
                                        <p className={`text-[12px] font-bold text-gray-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                            {item.notes}
                                        </p>
                                        <button 
                                            onClick={() => toggleExpand(item.id)}
                                            className="mt-2 text-[8px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400 flex items-center gap-1"
                                        >
                                            {isExpanded ? <><ChevronUp size={10}/> Less</> : <><ChevronDown size={10}/> View Memo</>}
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                        Audit Clear
                                    </div>
                                    <div className="flex gap-2.5">
                                        <button onClick={() => handleOpenModal(item)} className="p-3 bg-white/5 text-gray-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all"><Edit size={14} /></button>
                                        <button onClick={(e) => confirmDelete(e, item.id)} className="p-3 bg-white/5 text-gray-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-24 text-center">
                        <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.5em]">No Credits Logged</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentIncome?.id ? 'Revision Protocol' : 'Credit Log'}>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Effective Date</label>
                            <input type="date" value={currentIncome?.date || ''} onChange={(e) => setCurrentIncome({ ...currentIncome, date: e.target.value })} required className={formInputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Income Stream</label>
                            <div className="relative">
                                <select value={currentIncome?.source || ''} onChange={(e) => setCurrentIncome({ ...currentIncome, source: e.target.value as IncomeSource })} required className={formInputClass}>
                                    <option value="" disabled>Select Stream...</option>
                                    {Object.values(IncomeSource).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Value (₹)</label>
                        <input type="number" placeholder="Enter Amount" value={currentIncome?.amount || ''} onChange={(e) => setCurrentIncome({ ...currentIncome, amount: parseFloat(e.target.value) || 0 })} required className={formInputClass} min="1" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Narration Details</label>
                        <textarea 
                            placeholder="Add specific details (Room #, Customer Name)..." 
                            value={currentIncome?.notes || ''} 
                            onChange={(e) => setCurrentIncome({ ...currentIncome, notes: e.target.value })} 
                            className={`${formInputClass} min-h-[160px] resize-none pt-6 leading-relaxed`}
                        ></textarea>
                    </div>
                    <div className="flex gap-4 pt-10 border-t border-white/5">
                        <button type="button" onClick={handleCloseModal} className="flex-1 py-5 text-[11px] font-black text-gray-500 bg-white/5 rounded-2xl hover:text-white uppercase tracking-widest border border-white/5">Discard</button>
                        <button type="submit" className="flex-1 py-5 text-[11px] font-black text-white bg-primary-600 rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 uppercase tracking-widest transition-all">Authorize Log</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={handleDelete}
                title="Wipe Audit Record?"
                message="This action is irreversible. The entry will be permanently removed from the ledger."
            />
        </div>
    );
};

export default Income;
