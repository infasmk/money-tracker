
/* Re-establishing types and enums to support modular architecture and fix import errors */

export enum IncomeSource {
    ROOM_RENT = 'Room Rent',
    RESTAURANT = 'Restaurant',
    EXTRA_SERVICES = 'Extra Services',
    OTHERS = 'Others'
}

export enum ExpenseCategory {
    FOOD = 'Food & Grocery',
    ELECTRICITY = 'Electricity',
    MAINTENANCE = 'Maintenance',
    SALARY = 'Salary',
    OTHERS = 'Others'
}

export enum PaymentMode {
    CASH = 'Cash',
    ONLINE = 'Online'
}

export enum StaffRole {
    MANAGER = 'Manager',
    RECEPTIONIST = 'Receptionist',
    COOK = 'Cook',
    CLEANER = 'Cleaner',
    SECURITY = 'Security'
}

export enum AttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent'
}

export enum SalaryTransactionType {
    SALARY = 'Salary',
    ADVANCE = 'Advance'
}

export interface IncomeEntry {
    id: string;
    date: string;
    source: IncomeSource;
    amount: number;
    notes?: string;
}

export interface ExpenseEntry {
    id: string;
    date: string;
    category: ExpenseCategory;
    amount: number;
    payment_mode: PaymentMode;
    notes?: string;
}

export interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    monthly_salary: number;
    joining_date: string;
}

export interface AttendanceRecord {
    id: string;
    staff_id: string;
    date: string;
    status: AttendanceStatus;
}

export interface SalaryTransaction {
    id: string;
    staff_id: string;
    date: string;
    type: SalaryTransactionType;
    amount: number;
    notes?: string;
}
