'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import loginSVG from '@/app/assets/images/signIn.svg'
import logoSVG from '@/app/assets/images/logoSVG.svg'

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateEmail = (email: string): string | undefined => {
        if (!email) {
            return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return undefined;
    };

    const handleBlur = (field: 'email' | 'password') => {
        setTouched({ ...touched, [field]: true });
        if (field === 'email') {
            setErrors({ ...errors, email: validateEmail(email) });
        } else {
            setErrors({ ...errors, password: validatePassword(password) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        setErrors({
            email: emailError,
            password: passwordError,
        });

        setTouched({ email: true, password: true });

        if (!emailError && !passwordError) {
            setIsLoading(true);

            // Simulate 2 second loading state
            await new Promise(resolve => setTimeout(resolve, 2000));

            localStorage.setItem('isAuthenticated', 'true');
            router.push('/dashboard/users');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#fefefb] relative overflow-hidden">
                <div className="w-full h-full flex flex-col p-8">
                    {/* Logo */}
                    <div className="mb-4 pl-[70px] pt-6">
                        <Image className='object-contain' src={logoSVG} alt="Login Illustration" />
                    </div>

                    {/* Illustration - Stylized character with geometric shapes */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-full max-w-lg">
                            <Image className='w-full' src={loginSVG} alt="Login Illustration" width={500} height={500} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Welcome Message */}
                    <div className="mb-[60px]">
                        <h1 className="text-3xl md:text-[40px] font-bold text-secondary mb-2">Welcome!</h1>
                        <p className="text-[#545F7D]">Enter details to login.</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (touched.email) {
                                        setErrors({ ...errors, email: validateEmail(e.target.value) });
                                    }
                                }}
                                onBlur={() => handleBlur('email')}
                                placeholder="Email"
                                className={`w-full max-w-[447px] px-4 py-3.5 border-2 rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-[#545F7D] transition-all ${errors.email && touched.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-[#e5e7eb]'
                                    }`}
                            />
                            {errors.email && touched.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2 text-sm text-red-500"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>
                        <div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (touched.password) {
                                            setErrors({ ...errors, password: validatePassword(e.target.value) });
                                        }
                                    }}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="Password"
                                    className={`w-full max-w-[447px] px-4 py-3.5 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-20 bg-white text-[#545F7D] transition-all ${errors.password && touched.password
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-[#e5e7eb]'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-primary tracking-[80%] text-sm font-semibold"
                                >
                                    {showPassword ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                            {errors.password && touched.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2 text-sm text-red-500"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>

                        <div>
                            <Link
                                href="#"
                                className="text-primary text-sm font-semibold cursor-pointer"
                            >
                                FORGOT PASSWORD?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg font-semibold transition-colors hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>LOGGING IN...</span>
                                </>
                            ) : (
                                'LOG IN'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
