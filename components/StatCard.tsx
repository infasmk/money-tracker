
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">{title}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
            </div>
            <div 
                className="p-4 rounded-3xl transition-transform duration-500"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <Icon className="h-8 w-8" strokeWidth={2.5} />
            </div>
        </div>
    );
};

export default StatCard;
