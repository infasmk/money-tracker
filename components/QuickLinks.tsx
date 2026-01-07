
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Coins, Receipt, Users, BarChart, LayoutDashboard } from 'lucide-react';

const QuickLinks: React.FC = () => {
    const location = useLocation();

    const links = [
        { path: '/', icon: LayoutDashboard, label: 'Dash' },
        { path: '/income', icon: Coins, label: 'Credit' },
        { path: '/expenses', icon: Receipt, label: 'Debit' },
        { path: '/staff', icon: Users, label: 'Team' },
        { path: '/reports', icon: BarChart, label: 'Audit' },
    ];

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-6">
            <nav className="flex items-center gap-2 p-2.5 bg-gray-950/40 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 animate-in slide-in-from-bottom-12 duration-1000">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center justify-center gap-1.5 px-6 sm:px-8 py-4 rounded-full transition-all duration-500 group relative ${
                                isActive 
                                    ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/40 active:scale-95' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon 
                                size={20} 
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-1'}`} 
                            />
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 hidden sm:block group-hover:opacity-100 group-hover:translate-y-0'}`}>
                                {link.label}
                            </span>
                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default QuickLinks;
