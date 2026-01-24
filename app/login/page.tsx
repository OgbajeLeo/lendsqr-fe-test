'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import loginSVG from '@/app/assets/images/signIn.svg'
import logoSVG from '@/app/assets/images/logoSVG.svg'

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
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
          <div className="mb-4 pl-[60px] pt-6">
            <Image className='object-contain' src={logoSVG} alt="Login Illustration"  />
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
      <div className="flex-1 flex justify-center  items-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          {/* <div className="mb-12">
            <Image className='w-[106px] h-[97px]' src={logoSVG} alt="Login Illustration" width={106} height={97} />
          </div> */}

          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-[40px] font-bold text-secondary mb-2">Welcome!</h1>
            <p className="text-[#545F7D]">Enter details to login.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full max-w-[447px] px-4 py-4 border-2 border-[#545F7D] rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-[#545F7D]"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full max-w-[447px] px-4 py-4 border-2 border-[#545F7D] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-20 bg-white text-[#545F7D]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-primary text-sm font-medium "
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div>
              <Link
                href="#"
                className="text-primary text-sm font-medium cursor-pointer"
              >
                FORGOT PASSWORD?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg font-semibold  transition-colors"
            >
              LOG IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
