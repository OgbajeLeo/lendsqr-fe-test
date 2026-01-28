'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import loginSVG from '@/app/assets/images/signIn.svg'
import logoSVG from '@/app/assets/images/logoSVG.svg'
import styles from './page.module.scss';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const router = useRouter();

    // Check if user is already authenticated before rendering
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated) {
            router.push('/dashboard/users');
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

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

    // Show loading screen while checking authentication
    if (isCheckingAuth) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.loadingContent}>
                    <Image className={styles.loadingLogo} src={logoSVG} alt="Logo" />
                    <div className={styles.loadingSpinner}>
                        <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginContainer}>
            {/* Left Side - Illustration */}
            <div className={styles.leftSide}>
                <div className={styles.leftContent}>
                    {/* Logo */}
                    <div className={styles.logoContainer}>
                        <Image className={styles.logo} src={logoSVG} alt="Logo" />
                    </div>

                    {/* Illustration  */}
                    <div className={styles.illustrationContainer}>
                        <div className={styles.illustrationWrapper}>
                            <Image className={styles.illustration} src={loginSVG} alt="Login Illustration" width={500} height={500} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={styles.rightSide}>
                <div className={styles.formContainer}>

                    {/* Logo */}
                    <div className={` block -mt-[100px] mb-20 lg:hidden`}>
                        <Image className={styles.logo} src={logoSVG} alt="Logo" />
                    </div>


                    {/* Welcome Message */}
                    <div className={styles.welcomeSection}>
                        <h1 className={styles.welcomeTitle}>Welcome!</h1>
                        <p className={styles.welcomeText}>Enter details to login.</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
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
                                className={`${styles.input} ${errors.email && touched.email ? styles.error : ''}`}
                            />
                            {errors.email && touched.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={styles.errorMessage}
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>
                        <div className={styles.inputGroup}>
                            <div className={styles.passwordContainer}>
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
                                    className={`${styles.input} ${styles.passwordInput} ${errors.password && touched.password ? styles.error : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.showPasswordButton}
                                >
                                    {showPassword ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                            {errors.password && touched.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={styles.errorMessage}
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>

                        <div>
                            <Link
                                href="#"
                                className={styles.forgotPasswordLink}
                            >
                                FORGOT PASSWORD?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.submitButton}
                        >
                            {isLoading ? (
                                <>
                                    <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
