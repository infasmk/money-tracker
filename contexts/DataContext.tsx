
/* Re-establishing DataContext to provide global state management and fix import errors across the application */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    IncomeEntry, 
    ExpenseEntry, 
    StaffMember, 
    AttendanceRecord, 
    SalaryTransaction 
} from '../types';
import { getTodayDateString } from '../utils/helpers';
import { 
    initialIncome, 
    initialExpenses, 
    initialStaff, 
    initialAttendance, 
    initialSalaryTransactions 
} from '../utils/mockData';

interface DataContextType {
    income: IncomeEntry[];
    setIncome: React.Dispatch<React.SetStateAction<IncomeEntry[]>>;
    expenses: ExpenseEntry[];
    setExpenses: React.Dispatch<React.SetStateAction<ExpenseEntry[]>>;
    staff: StaffMember[];
    setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
    attendance: AttendanceRecord[];
    setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    salaryTransactions: SalaryTransaction[];
    setSalaryTransactions: React.Dispatch<React.SetStateAction<SalaryTransaction[]>>;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    resetToToday: () => void;
    isLoading: boolean;
    isSyncing: boolean;
    syncToCloud: (table: string, data: any) => Promise<boolean>;
    deleteFromCloud: (table: string, id: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Managing core application data with state hooks
    const [income, setIncome] = useState<IncomeEntry[]>(initialIncome);
    const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);
    const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
    const [salaryTransactions, setSalaryTransactions] = useState<SalaryTransaction[]>(initialSalaryTransactions);
    
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const resetToToday = () => {
        setSelectedDate(getTodayDateString());
    };

    // Placeholder cloud synchronization logic to support UI feedback and state updates
    const syncToCloud = async (table: string, data: any) => {
        setIsSyncing(true);
        console.log(`[Cloud Sync] Processing update for ${table}...`, data);
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSyncing(false);
        return true;
    };

    const deleteFromCloud = async (table: string, id: string) => {
        setIsSyncing(true);
        console.log(`[Cloud Sync] Deleting ${id} from ${table}...`);
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSyncing(false);
        return true;
    };

    return (
        <DataContext.Provider value={{
            income, setIncome,
            expenses, setExpenses,
            staff, setStaff,
            attendance, setAttendance,
            salaryTransactions, setSalaryTransactions,
            selectedDate, setSelectedDate,
            resetToToday,
            isLoading,
            isSyncing,
            syncToCloud,
            deleteFromCloud
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
