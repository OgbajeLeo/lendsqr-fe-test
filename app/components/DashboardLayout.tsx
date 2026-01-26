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
import BellIcon from './IconComponents/BellIcon';
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
    <div className={`${workSans.className} ${styles.dashboardContainer}`}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}
      >
        <div className={styles.sidebarContent}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <div className={styles.logoWrapper}>
              <Image className={styles.logo} src={logoSVG} alt="Logo" height={30} width={144} />
            </div>
          </div>

          {/* Switch Organization */}
          <div className={styles.switchOrgSection}>
            <button className={styles.switchOrgButton}>
              <div className={styles.switchOrgContent}>
                <BriefCase />
                <span>Switch Organization</span>
              </div>
              <ArrowDown />
            </button>
          </div>

          {/* Dashboard Button */}
          <div className={styles.dashboardButtonSection}>
            <button className={styles.dashboardButton}>
              <div className={styles.dashboardButtonContent}>
                <Home />
                <span>Dashboard</span>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className={`${styles.navigation} my-scrollbar`}>
            <div className={styles.navContent}>
              {/* Customers */}
              <div className={styles.navSection}>
                <p className={styles.navSectionTitle}>
                  CUSTOMERS
                </p>
                <ul className={styles.navList}>
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
              <div className={styles.navSection}>
                <p className={styles.navSectionTitle}>
                  BUSINESSES
                </p>
                <ul className={styles.navList}>
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
              <div className={styles.navSection}>
                <p className={styles.navSectionTitle}>
                  SETTINGS
                </p>
                <ul className={styles.navList}>
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

          {/* Footer */}
          <div className={styles.footerSection}>
            <Link
              href="/login"
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                router.push('/login');
              }}
              className={styles.logoutLink}
            >
              <Logout />
              <span>Logout</span>
            </Link>
            <p className={styles.versionText}>v1.2.0</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={styles.mobileMenuButton}
            >
              <svg
                className={styles.menuIcon}
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
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="Search for anything"
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  className={styles.searchButton}
                >
                  <svg
                    className={styles.searchIcon}
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
            <div className={styles.headerRight}>
              <Link
                href="#"
                className={styles.docsLink}
              >
                Docs
              </Link>
              <button className={styles.notificationButton}>
                <BellIcon />
              </button>
              <div className={styles.userSection}>
                <div className={styles.avatar}>
                  <span className={styles.avatarText}>A</span>
                </div>
                <div className={styles.userName}>
                  <p>Adedeji</p>
                </div>
                <button className={styles.dropdownButton}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.39229 12.0516C9.72823 12.425 10.2751 12.4219 10.6079 12.0516L13.4829 8.85701C13.8188 8.48435 13.6852 8.18201 13.1845 8.18201H6.81567C6.31489 8.18201 6.18363 8.48747 6.51723 8.85701L9.39229 12.0516Z" fill="#7a8cb1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={styles.mainContentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
