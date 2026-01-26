'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import logoSVG from '@/app/assets/images/logoSVG.svg'
import styles from './DashboardLayout.module.scss';
import ArrowDown from './IconComponents/ArrowDown';
import BriefCase from './IconComponents/BriefCase';
import Home from './IconComponents/Home';
import Users from './IconComponents/Users';
import Guarantor from './IconComponents/Guarantor';
import Load from './IconComponents/Load';
import Model from './IconComponents/Model';
import Savings from './IconComponents/Savings';
import Loan from './IconComponents/Loan';
import WhiteList from './IconComponents/WhiteList';
import Karma from './IconComponents/Karma';
import Organization from './IconComponents/Organization';
import Fees from './IconComponents/Fees';
import Loan2 from './IconComponents/Loan2';
import Savings2 from './IconComponents/Savings2';
import Transactions2 from './IconComponents/Transactions2';
import Services from './IconComponents/Services';
import Services2 from './IconComponents/Services2';
import Settlement from './IconComponents/Settlement';
import Reports from './IconComponents/Reports';
import Preference from './IconComponents/Preference';
import Fees2 from './IconComponents/Fees2';
import Audit from './IconComponents/Audit';
import Messages from './IconComponents/Messages';
import Logout from './IconComponents/Logout';
import { Work_Sans } from "next/font/google";
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = {
  customers: [
    { name: 'Users', href: '/dashboard/users', icon: <Users /> },
    { name: 'Guarantors', href: '/dashboard/guarantors', icon: <Guarantor /> },
    { name: 'Loans', href: '/dashboard/loans', icon: <Load /> },
    { name: 'Decision Models', href: '/dashboard/decision-models', icon: <Model /> },
    { name: 'Savings', href: '/dashboard/savings', icon: <Savings /> },
    { name: 'Loan Requests', href: '/dashboard/loan-requests', icon: <Loan /> },
    { name: 'Whitelist', href: '/dashboard/whitelist', icon: <WhiteList /> },
    { name: 'Karma', href: '/dashboard/karma', icon: <Karma /> },
  ],
  businesses: [
    { name: 'Organization', href: '/dashboard/organization', icon: <Organization /> },
    { name: 'Loan Products', href: '/dashboard/loan-products', icon: <Loan2 /> },
    { name: 'Savings Products', href: '/dashboard/savings-products', icon: <Savings2 /> },
    { name: 'Fees and Charges', href: '/dashboard/fees', icon: <Fees /> },
    { name: 'Transactions', href: '/dashboard/transactions', icon: <Transactions2 /> },
    { name: 'Services', href: '/dashboard/services', icon: <Services /> },
    { name: 'Service Account', href: '/dashboard/service-account', icon: <Services2 /> },
    { name: 'Settlements', href: '/dashboard/settlements', icon: <Settlement /> },
    { name: 'Reports', href: '/dashboard/reports', icon: <Reports /> },
  ],
  settings: [
    { name: 'Preferences', href: '/dashboard/preferences', icon: <Preference /> },
    { name: 'Fees and Pricing', href: '/dashboard/fees-pricing', icon: <Fees2 /> },
    { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: <Audit /> },
    { name: 'Systems Messages', href: '/dashboard/system-messages', icon: <Messages /> },
  ],
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className={`${workSans.className} flex h-screen bg-gray-50`}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition-transform duration-300 ease-in-out lg:transition-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 ">
            <div className="relative w-full max-w-lg">
              <Image className='w-[144px] h-[30px]' src={logoSVG} alt="Logo" height={30} width={106} />
            </div>
          </div>

          {/* Switch Organization */}
          <div className="p-4 px-6 mb-">
            <button className="flex items-center gap-2 w-full  text-secondary ">
              <div className="flex items-center gap-2">
                <BriefCase />
                <span>Switch Organization</span>
              </div>
              <ArrowDown />
            </button>
          </div>
          <div className="p-4 px-6 mb-4">
            <button className="flex items-center  gap-2 w-full  text-[#8b9bba] ">
              <div className="flex items-center gap-2">
                <Home />
                <span>Dashboard</span>
              </div>

            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto my-scrollbar py-4">
            <div className="space-y-6">
              {/* Customers */}
              <div>
                <p className="text-xs px-6 font-semibold text-gray-400 uppercase mb-3">
                  CUSTOMERS
                </p>
                <ul className="space-y-1">
                  {navigationItems.customers.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`${styles['nav-link']} ${isActive ? styles.active : ''}`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Businesses */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-6">
                  BUSINESSES
                </p>
                <ul className="space-y-1">
                  {navigationItems.businesses.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`${styles['nav-link']} ${isActive ? styles.active : ''}`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Settings */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-6">
                  SETTINGS
                </p>
                <ul className="space-y-1">
                  {navigationItems.settings.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`${styles['nav-link']} ${isActive ? styles.active : ''}`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              href="/login"
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                router.push('/login');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-[#8b9bba] hover:bg-gray-50"
            >
              <Logout />
              <span>Logout</span>
            </Link>
            <p className="text-xs text-gray-400 mt-6 px-3">v1.2.0</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-[#8b9bba] "
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-1 hidden md:flex max-w-md mx-4 md:mx-6 lg:mx-8">
              <div className="flex items-center w-full">
                <input
                  type="text"
                  placeholder="Search for anything"
                  className="flex-1 pl-4 pr-4 text-sm py-3 border border-[#DDE1E6] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-[#8C98A4]"
                />
                <button
                  type="button"
                  className="bg-[#42C9C2] px-5 py-[13px] rounded-r-lg hover:bg-[#3ab5af] transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center gap-4 lg:gap-6">
              <Link
                href="#"
                className=" underline text-secondary  hidden lg:block"
              >
                Docs
              </Link>
              <button className="relative p-2 text-[#8b9bba] ">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.9985 1.53314C13.8909 1.53329 14.6959 2.06499 15.0483 2.8847C15.3569 3.60368 15.2632 4.42331 14.8198 5.05072C16.1884 5.45587 17.3981 6.2817 18.2749 7.41498C19.215 8.63014 19.717 10.1268 19.6997 11.663V13.5976L19.7124 14.1318C19.8389 16.7974 20.9561 19.3268 22.8579 21.2177C23.0323 21.3906 23.0857 21.6534 22.9917 21.8808L22.9907 21.8818C22.896 22.1069 22.6763 22.2548 22.4292 22.2538V22.2548H15.9751C15.68 23.6545 14.4456 24.6697 13.0005 24.6699C11.5552 24.6699 10.3212 23.6545 10.0259 22.2548H3.5708V22.2538C3.32378 22.2547 3.104 22.1069 3.00928 21.8818L3.0083 21.8808C2.91432 21.6534 2.96767 21.3906 3.14209 21.2177C5.17061 19.201 6.3072 16.4577 6.30029 13.5976V11.4921C6.30037 9.97955 6.81235 8.51205 7.75342 7.32806C8.62786 6.22584 9.82512 5.429 11.1733 5.04681C10.7325 4.41996 10.64 3.60212 10.9478 2.8847C11.3002 2.06488 12.106 1.53314 12.9985 1.53314ZM11.2729 22.2548C11.5268 22.9795 12.2132 23.4782 12.9995 23.4785C13.786 23.4785 14.4731 22.9797 14.7271 22.2548H11.2729ZM13.2642 6.00385C11.7637 5.93197 10.2995 6.47749 9.2124 7.51459C8.12478 8.55106 7.51025 9.98892 7.51221 11.4921V13.5966L7.50244 14.1298C7.39775 16.6483 6.49245 19.068 4.92236 21.0419H21.0767C19.3963 18.9291 18.4791 16.305 18.4878 13.5966V11.6601C18.5123 10.2259 17.9837 8.83803 17.0103 7.78412C16.0378 6.73125 14.6953 6.09316 13.2642 6.00482V6.00385ZM13.0005 2.75482C12.4377 2.75482 11.9811 3.21059 11.981 3.77338C11.981 4.18515 12.2296 4.55687 12.6108 4.71478C12.9436 4.85205 13.3203 4.80318 13.605 4.59369L13.7212 4.49408C14.0121 4.20192 14.0989 3.76395 13.9419 3.38373C13.784 3.00273 13.4121 2.75498 13.0005 2.75482Z" fill="#7a8cb1" stroke="#213F7D" strokeWidth="0.4" />
                </svg>

              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-[#8b9bba] ">A</span>
                </div>
                <div className="hidden lg:block">
                  <p className="font-medium text-secondary">Adedeji</p>
                </div>
                <button className="text-[#8b9bba]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.39229 12.0516C9.72823 12.425 10.2751 12.4219 10.6079 12.0516L13.4829 8.85701C13.8188 8.48435 13.6852 8.18201 13.1845 8.18201H6.81567C6.31489 8.18201 6.18363 8.48747 6.51723 8.85701L9.39229 12.0516Z" fill="#7a8cb1" />
                  </svg>

                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#fbfbfb] p-4 md:p-10 lg:p-[60px]">
          {children}
        </main>
      </div>
    </div>
  );
}
