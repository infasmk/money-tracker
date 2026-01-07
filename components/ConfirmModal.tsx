
import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: 'red' | 'blue' | 'green';
    type?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    confirmColor = 'red',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        blue: 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        green: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
    };

    const iconBgClasses = {
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                <div className="p-8 text-center">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl mb-6 shadow-lg ${iconBgClasses[type]}`}>
                        {type === 'danger' ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-5 text-[10px] font-black text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-r border-gray-100 dark:border-gray-700 uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-5 text-[10px] font-black uppercase tracking-widest transition-colors ${colorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
