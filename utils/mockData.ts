
import { IncomeEntry, ExpenseEntry, StaffMember, AttendanceRecord, SalaryTransaction, IncomeSource, ExpenseCategory, PaymentMode, StaffRole, AttendanceStatus, SalaryTransactionType } from '../types';
import { getTodayDateString } from './helpers';

const today = getTodayDateString();
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
const twoDaysAgo = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0];
const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

export const initialStaff: StaffMember[] = [
    // Fix: Rename monthlySalary to monthly_salary and joiningDate to joining_date
    { id: 'staff-1', name: 'John Doe', role: StaffRole.MANAGER, monthly_salary: 50000, joining_date: '2023-01-15' },
    { id: 'staff-2', name: 'Jane Smith', role: StaffRole.RECEPTIONIST, monthly_salary: 25000, joining_date: '2023-03-01' },
    { id: 'staff-3', name: 'Peter Jones', role: StaffRole.COOK, monthly_salary: 30000, joining_date: '2023-02-20' },
    { id: 'staff-4', name: 'Mary Williams', role: StaffRole.CLEANER, monthly_salary: 18000, joining_date: '2023-05-10' },
    { id: 'staff-5', name: 'David Brown', role: StaffRole.SECURITY, monthly_salary: 22000, joining_date: '2023-04-01' },
];

export const initialIncome: IncomeEntry[] = [
    { id: 'inc-1', date: today, source: IncomeSource.ROOM_RENT, amount: 15000, notes: 'Rooms 101, 102' },
    { id: 'inc-2', date: today, source: IncomeSource.RESTAURANT, amount: 4500 },
    { id: 'inc-3', date: yesterday, source: IncomeSource.ROOM_RENT, amount: 12000 },
    { id: 'inc-4', date: twoDaysAgo, source: IncomeSource.EXTRA_SERVICES, amount: 2000, notes: 'Laundry service' },
    { id: 'inc-5', date: lastMonth, source: IncomeSource.ROOM_RENT, amount: 18000 },
];

export const initialExpenses: ExpenseEntry[] = [
    // Fix: Rename paymentMode to payment_mode
    { id: 'exp-1', date: today, category: ExpenseCategory.FOOD, amount: 3000, payment_mode: PaymentMode.CASH, notes: 'Vegetables' },
    { id: 'exp-2', date: yesterday, category: ExpenseCategory.MAINTENANCE, amount: 1500, payment_mode: PaymentMode.ONLINE, notes: 'Plumbing repair' },
    { id: 'exp-3', date: twoDaysAgo, category: ExpenseCategory.ELECTRICITY, amount: 8000, payment_mode: PaymentMode.ONLINE },
    { id: 'exp-4', date: lastMonth, category: ExpenseCategory.SALARY, amount: 145000, payment_mode: PaymentMode.ONLINE },
];

export const initialAttendance: AttendanceRecord[] = [
    // Fix: Rename staffId to staff_id
    { id: 'att-1', staff_id: 'staff-1', date: today, status: AttendanceStatus.PRESENT },
    { id: 'att-2', staff_id: 'staff-2', date: today, status: AttendanceStatus.PRESENT },
    { id: 'att-3', staff_id: 'staff-3', date: today, status: AttendanceStatus.ABSENT },
    { id: 'att-4', staff_id: 'staff-4', date: today, status: AttendanceStatus.PRESENT },
    { id: 'att-5', staff_id: 'staff-5', date: today, status: AttendanceStatus.PRESENT },
    { id: 'att-6', staff_id: 'staff-1', date: yesterday, status: AttendanceStatus.PRESENT },
    { id: 'att-7', staff_id: 'staff-2', date: yesterday, status: AttendanceStatus.PRESENT },
    { id: 'att-8', staff_id: 'staff-3', date: yesterday, status: AttendanceStatus.PRESENT },
    { id: 'att-9', staff_id: 'staff-4', date: yesterday, status: AttendanceStatus.PRESENT },
    { id: 'att-10', staff_id: 'staff-5', date: yesterday, status: AttendanceStatus.PRESENT },
];

export const initialSalaryTransactions: SalaryTransaction[] = [
    // Fix: Rename staffId to staff_id
    { id: 'sal-1', staff_id: 'staff-2', date: new Date(new Date().setDate(15)).toISOString().split('T')[0], type: SalaryTransactionType.ADVANCE, amount: 5000, notes: 'Urgent need' },
    { id: 'sal-2', staff_id: 'staff-1', date: lastMonth, type: SalaryTransactionType.SALARY, amount: 50000 },
    { id: 'sal-3', staff_id: 'staff-2', date: lastMonth, type: SalaryTransactionType.SALARY, amount: 25000 },
];
