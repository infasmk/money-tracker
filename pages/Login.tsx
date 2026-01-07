
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Hotel, Lock, ShieldCheck, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Single admin identity logic
        const adminEmail = 'admin@hotelpro.com';
        
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: password,
            });

            if (authError) {
                if (authError.message === "Invalid login credentials") {
                    setError('Access Denied: Invalid Secret Key.');
                } else {
                    setError(`System Error: ${authError.message}`);
                }
                setIsLoading(false);
            } else {
                onLogin();
            }
        } catch (err) {
            setError('Connection Failure: Check your internet or Supabase URL.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden font-sans">
            {/* Ambient background remains same for aesthetics */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] delay-1000 animate-pulse"></div>
            </div>

            <div className="w-full max-w-md bg-gray-900 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="p-10 sm:p-12">
                    <div className="flex flex-col items-center mb-12">
                        <div className="p-5 bg-primary-600 rounded-[2rem] mb-6 shadow-xl shadow-primary-600/40 transform -rotate-6">
                            <Hotel className="h-10 w-10 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                            Hotel<span className="text-primary-500">Pro</span>
                        </h1>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                            <Sparkles size={12} className="text-primary-500" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Enterprise Terminal</p>
                        </div>
                    </div>

                    <form className="space-y-8" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2 block">Personnel Secret Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary-500 transition-colors">
                                    <Lock size={20} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                    className={`w-full pl-16 pr-14 py-5 bg-black/40 border-2 border-transparent rounded-[2rem] text-sm font-black text-white outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all placeholder:text-gray-700 shadow-inner ${error ? 'border-rose-500/50' : ''}`}
                                    placeholder="Enter Access PIN..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-600 hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-shake">
                                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full overflow-hidden rounded-[2rem] bg-primary-600 px-8 py-6 text-center transition-all hover:bg-primary-500 active:scale-[0.97] disabled:opacity-70 shadow-2xl shadow-primary-600/30"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-4 text-white">
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Decrypting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Authorize Entry</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Cloud Security Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
