import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { StaffMember, StaffRole, AttendanceRecord, AttendanceStatus } from '../types';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { getTodayDateString, formatDate, formatCurrency } from '../utils/helpers';
import { PlusCircle, Edit, Trash2, UserCheck, UserX, Search, Users, ChevronRight, Calendar as CalendarIcon, Loader2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffSkeleton = () => (
    <div className="bg-gray-900/50 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl animate-pulse h-80 flex flex-col justify-between">
        <div className="flex items-center gap-6 mb-12">
            <div className="h-20 w-20 rounded-[2.5rem] bg-white/5"></div>
            <div className="flex-1 space-y-3">
                <div className="bg-white/5 h-6 w-32 rounded"></div>
                <div className="bg-white/5 h-3 w-20 rounded"></div>
            </div>
        </div>
        <div className="bg-white/5 h-16 w-full rounded-[2rem] mb-10"></div>
        <div className="bg-white/5 h-16 w-full rounded-[2rem]"></div>
    </div>
);

const AttendanceSkeleton = () => (
    <div className="p-10 bg-gray-900/50 rounded-[3.5rem] border border-white/5 animate-pulse h-64 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-12">
            <div className="space-y-3">
                <div className="bg-white/5 h-6 w-32 rounded"></div>
                <div className="bg-white/5 h-4 w-20 rounded"></div>
            </div>
            <div className="h-4 w-4 rounded-full bg-white/5"></div>
        </div>
        <div className="flex gap-4">
            <div className="flex-1 bg-white/5 h-16 rounded-[2rem]"></div>
            <div className="flex-1 bg-white/5 h-16 rounded-[2rem]"></div>
        </div>
    </div>
);

const Staff: React.FC = () => {
    const { staff, setStaff, attendance, setAttendance, selectedDate, setSelectedDate, syncToCloud, deleteFromCloud, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [currentStaff, setCurrentStaff] = useState<Partial<StaffMember> | null>(null);
    const [view, setView] = useState<'list' | 'attendance'>('attendance');
    const [searchTerm, setSearchTerm] = useState('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [attPending, setAttPending] = useState<{id: string, status: AttendanceStatus} | null>(null);
    const [isAttConfirmOpen, setIsAttConfirmOpen] = useState(false);

    const handleOpenModal = (staffMember?: StaffMember) => {
        setCurrentStaff(staffMember || { joining_date: getTodayDateString() });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentStaff(null);
        setIsModalOpen(false);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentStaff) return;
        
        const newItem = currentStaff.id 
            ? { ...currentStaff as StaffMember }
            : { ...currentStaff, id: `staff-${Date.now()}` } as StaffMember;

        if (currentStaff.id) {
            setStaff(prev => prev.map(s => s.id === currentStaff.id ? newItem : s));
        } else {
            setStaff(prev => [...prev, newItem]);
        }
        
        await syncToCloud('staff', newItem);
        handleCloseModal();
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            setStaff(prev => prev.filter(s => s.id !== itemToDelete));
            await deleteFromCloud('staff', itemToDelete);
            setAttendance(prev => prev.filter(a => a.staff_id !== itemToDelete));
            setItemToDelete(null);
        }
    };
    
    const dayAttendance = useMemo(() => {
        return attendance.filter(a => a.date === selectedDate);
    }, [attendance, selectedDate]);

    const filteredStaff = useMemo(() => {
        return staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [staff, searchTerm]);

    const triggerAttendanceUpdate = (staff_id: string, status: AttendanceStatus) => {
        setAttPending({ id: staff_id, status });
        setIsAttConfirmOpen(true);
    };

    const handleAttendanceConfirm = async () => {
        if (!attPending) return;
        const { id: staff_id, status } = attPending;
        const existingRecord = dayAttendance.find(a => a.staff_id === staff_id);
        
        const newRecord = existingRecord 
            ? { ...existingRecord, status }
            : { id: `att-${Date.now()}`, staff_id, date: selectedDate, status } as AttendanceRecord;

        if (existingRecord) {
             setAttendance(prev => prev.map(a => a.id === existingRecord.id ? newRecord : a));
        } else {
            setAttendance(prev => [...prev, newRecord]);
        }
        
        await syncToCloud('attendance', newRecord);
        setAttPending(null);
    };

    const handleDateTrigger = () => {
        // Fix: Ensured safe access to modern showPicker API with proper casting.
        const input = dateInputRef.current;
        if (input) {
            try {
                input.focus();
                if ('showPicker' in input) {
                    (input as any).showPicker();
                }
            } catch (e) {
                // Ignore errors from missing or throwing showPicker
            }
        }
    };

    const StaffList = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <StaffSkeleton key={i} />)
            ) : (
                filteredStaff.map(member => (
                    <div key={member.id} className="group bg-gray-900 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 flex gap-3 z-20">
                            <button onClick={() => handleOpenModal(member)} className="p-4 bg-primary-500/20 text-primary-500 rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-lg shadow-black/40"><Edit size={16} /></button>
                            <button onClick={() => confirmDelete(member.id)} className="p-4 bg-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-black/40"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex items-center gap-6 mb-12">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-primary-600/10 flex items-center justify-center text-primary-500 border border-primary-500/20 shadow-inner">
                                <Users size={32} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 pr-16">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 truncate">{member.name}</h3>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] leading-none">{member.role}</p>
                            </div>
                        </div>
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center bg-black/40 p-6 rounded-[2rem] border border-white/5">
                                <span className="text-gray-500 font-black uppercase text-[9px] tracking-[0.2em]">Monthly Base</span>
                                <span className="font-black text-white text-xl">{formatCurrency(member.monthly_salary)}</span>
                            </div>
                        </div>
                        <Link to={`/staff/${member.id}`} className="w-full py-6 flex items-center justify-center gap-3 bg-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:bg-primary-600 hover:text-white transition-all shadow-inner group">
                            Review Performance <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ))
            )}
        </div>
    );
    
    const AttendanceSheet = () => (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-500/5 blur-[100px] pointer-events-none"></div>
                <div className="flex items-center gap-10 relative z-10">
                    <button onClick={handleDateTrigger} className="p-6 bg-primary-600 text-white rounded-[2.5rem] hover:scale-110 transition-transform shadow-2xl shadow-primary-600/30">
                        <CalendarIcon size={32} />
                    </button>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">Shift Records</h3>
                        <p className="text-3xl font-black text-white uppercase tracking-tighter">{formatDate(selectedDate)}</p>
                    </div>
                    <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute opacity-0 pointer-events-none w-0 h-0" />
                </div>
                <div className="w-full sm:w-auto text-center sm:text-right bg-white/5 border border-white/10 px-12 py-8 rounded-[3rem] shadow-inner relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-gray-500">Live Headcount</p>
                    <p className="text-5xl font-black text-white tracking-tighter">{dayAttendance.filter(a => a.status === 'Present').length}<span className="text-primary-500 mx-2">/</span><span className="text-gray-700">{staff.length}</span></p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <AttendanceSkeleton key={i} />)
                ) : (
                    staff.map(member => {
                        const record = dayAttendance.find(a => a.staff_id === member.id);
                        const status = record?.status;
                        const isPresent = status === AttendanceStatus.PRESENT;
                        const isAbsent = status === AttendanceStatus.ABSENT;

                        return (
                            <div key={member.id} className={`p-10 bg-gray-900 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden ${isPresent ? 'border-emerald-500/30 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.1)] bg-emerald-500/[0.02]' : isAbsent ? 'border-rose-500/30 shadow-[0_40px_80px_-20px_rgba(244,63,94,0.1)] bg-rose-500/[0.02]' : 'border-white/5 shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <p className="font-black text-white uppercase tracking-tight text-2xl leading-none mb-3">{member.name}</p>
                                        <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-gray-500 uppercase tracking-widest">{member.role}</span>
                                    </div>
                                    {status && (
                                        <div className={`h-4 w-4 rounded-full animate-pulse ${isPresent ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-rose-500 shadow-[0_0_20px_#f43f5e]'}`}></div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => triggerAttendanceUpdate(member.id, AttendanceStatus.PRESENT)} className={`flex-1 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${isPresent ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xl shadow-emerald-600/40' : 'bg-black/20 text-gray-600 border-white/5 hover:text-emerald-500 hover:bg-emerald-500/5 hover:border-emerald-500/20'}`}>
                                        <UserCheck size={18}/> Present
                                    </button>
                                    <button onClick={() => triggerAttendanceUpdate(member.id, AttendanceStatus.ABSENT)} className={`flex-1 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${isAbsent ? 'bg-rose-600 text-white border-rose-600 shadow-2xl shadow-rose-600/40' : 'bg-black/20 text-gray-600 border-white/5 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20'}`}>
                                        <UserX size={18}/> Absent
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );


    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-8 bg-gray-900 p-8 rounded-[4rem] border border-white/5 shadow-2xl">
                 <div className="flex p-2 bg-black/40 rounded-[2.5rem] w-full lg:w-auto shadow-inner">
                    <button onClick={() => setView('attendance')} className={`flex-1 lg:flex-none px-12 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all ${view === 'attendance' ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/40' : 'text-gray-600 hover:text-white'}`}>Roll Call</button>
                    <button onClick={() => setView('list')} className={`flex-1 lg:flex-none px-12 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all ${view === 'list' ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/40' : 'text-gray-600 hover:text-white'}`}>Directory</button>
                </div>
                
                {view === 'list' && (
                    <div className="flex flex-col sm:flex-row gap-5 flex-1 lg:max-w-2xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-primary-500 transition-colors" />
                            <input type="text" placeholder="Filter employee pool..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-14 pr-6 py-4 text-sm bg-black/30 border border-white/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary-500/10 w-full transition-all text-white font-bold" />
                        </div>
                        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-3 px-10 py-4 text-white bg-primary-600 rounded-[2rem] hover:bg-primary-700 font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-2xl shadow-primary-600/30 group active:scale-95 whitespace-nowrap">
                            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                            Enroll
                        </button>
                    </div>
                )}
            </div>
            
            <div className="animate-in slide-in-from-bottom-2 duration-500">
                {view === 'attendance' ? <AttendanceSheet /> : <StaffList />}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentStaff?.id ? 'Revision Protocol' : 'Personnel Enrollment'}>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="relative group">
                        <label className="block mb-3 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal Identity</label>
                        <input type="text" value={currentStaff?.name || ''} onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })} required className="form-input" placeholder="Full legal name..." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="relative group">
                            <label className="block mb-3 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Department</label>
                            <select value={currentStaff?.role || ''} onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value as StaffRole })} required className="form-input">
                                <option value="" disabled>Select Department...</option>
                                {Object.values(StaffRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-[3.7rem] h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>
                         <div className="relative group">
                            <label className="block mb-3 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Gross Wage (₹)</label>
                            <input type="number" value={currentStaff?.monthly_salary || ''} onChange={(e) => setCurrentStaff({ ...currentStaff, monthly_salary: parseFloat(e.target.value) || 0 })} required className="form-input" min="0" placeholder="0" />
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="block mb-3 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Effective Date</label>
                        <input type="date" value={currentStaff?.joining_date || ''} onChange={(e) => setCurrentStaff({ ...currentStaff, joining_date: e.target.value })} required className="form-input" />
                        <ChevronDown className="absolute right-6 top-[3.7rem] h-4 w-4 text-gray-600 pointer-events-none" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 pt-12 border-t border-white/5">
                        <button type="button" onClick={handleCloseModal} className="flex-1 py-5 text-[10px] font-black text-gray-600 bg-white/5 rounded-[2rem] hover:text-white hover:bg-white/10 transition-colors uppercase tracking-[0.3em] border border-white/5">Abort</button>
                        <button type="submit" className="flex-1 py-5 text-[10px] font-black text-white bg-primary-600 rounded-[2rem] shadow-2xl shadow-primary-600/30 hover:bg-primary-700 uppercase tracking-[0.3em] transition-all">Authorize Profile</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={handleDelete}
                title="Terminate Personnel File?"
                message="This will immediately remove the employee from the cloud directory. Attendance and payroll history for this member will be archived."
                confirmText="Authorize Termination"
            />

            <ConfirmModal 
                isOpen={isAttConfirmOpen} 
                onClose={() => setIsAttConfirmOpen(false)} 
                onConfirm={handleAttendanceConfirm}
                title={attPending?.status === AttendanceStatus.ABSENT ? "Confirm Absence" : "Confirm Presence"}
                message={`Authorize ${attPending?.status?.toUpperCase()} entry for ${formatDate(selectedDate)} in the central log?`}
                confirmText={attPending?.status === AttendanceStatus.ABSENT ? "Mark Absent" : "Mark Present"}
                confirmColor={attPending?.status === AttendanceStatus.ABSENT ? "red" : "blue"}
                type={attPending?.status === AttendanceStatus.ABSENT ? "danger" : "info"}
            />

             {/* Fix: Standardized style tag by removing the non-standard jsx attribute */}
             <style>{`
                .form-input {
                    display: block;
                    width: 100%;
                    padding: 1.375rem 1.625rem;
                    border-radius: 2rem;
                    border: 1px solid rgba(255,255,255,0.05);
                    background-color: rgba(0,0,0,0.5);
                    color: white;
                    font-size: 0.9375rem;
                    font-weight: 800;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    appearance: none;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background-color: rgba(0,0,0,0.7);
                    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.08);
                }
            `}</style>
        </div>
    );
};

export default Staff;