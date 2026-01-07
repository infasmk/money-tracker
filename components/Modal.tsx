import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 sm:p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
            {/* Fix: Standardized style tag by removing the non-standard jsx attribute */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default Modal;