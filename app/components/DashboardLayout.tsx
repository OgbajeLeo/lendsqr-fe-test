'use client';

import { useState, useEffect, useRef } from 'react';
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

interface SearchUser {
  id: string;
  organization: string;
  username: string;
  email: string;
  phone_number: string;
  date_joined: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Blacklisted';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const getUsersFromCache = (): SearchUser[] => {
    if (typeof window === 'undefined') return [];

    try {
      const cachedData = localStorage.getItem('userDataCache');
      if (!cachedData) return [];

      const cachedUsers = JSON.parse(cachedData);
      return cachedUsers.map((user: any) => {
        const status = user.employment_status === 'Unemployed'
          ? 'Inactive'
          : user.employment_status === 'Student'
            ? 'Pending'
            : 'Active';

        return {
          id: user.id,
          organization: 'Lendsqr',
          username: user.full_name || 'N/A',
          email: user.email_address || 'N/A',
          phone_number: user.phone_number || 'N/A',
          date_joined: user.created_at || new Date().toISOString(),
          status: status as 'Active' | 'Inactive' | 'Pending' | 'Blacklisted',
        };
      });
    } catch (error) {
      console.error('Error parsing cached user data:', error);
      return [];
    }
  };

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const users = getUsersFromCache();
    const lowerQuery = query.toLowerCase().trim();

    const results = users.filter(user => {
      return (
        user.username.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.phone_number.includes(lowerQuery) ||
        user.organization.toLowerCase().includes(lowerQuery)
      );
    }).slice(0, 10);

    setSearchResults(results);
    setShowSearchDropdown(true);
    setIsSearching(false);
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown]);

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return styles.active;
      case 'inactive':
        return styles.inactive;
      case 'pending':
        return styles.pending;
      case 'blacklisted':
        return styles.blacklisted;
      default:
        return styles.inactive;
    }
  };

  const handleUserClick = (userId: string) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    router.push(`/dashboard/users/${userId}`);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowSearchDropdown(true);
    }
  };

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
                    const isActive = pathname === item.href || pathname.includes(item.href.split('/')[2]);
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for anything"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
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
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div ref={searchDropdownRef} className={styles.searchDropdown}>
                    {isSearching ? (
                      <div className={styles.searchDropdownItem}>
                        <p className={styles.searchLoadingText}>Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className={styles.searchDropdownHeader}>
                          <p className={styles.searchDropdownTitle}>
                            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                          </p>
                        </div>
                        <div className={`${styles.searchDropdownList} my-scrollbar`}>
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className={styles.searchDropdownItem}
                              onClick={() => handleUserClick(user.id)}
                            >
                              <div className={styles.searchUserInfo}>
                                <p className={styles.searchUserName}>{user.username}</p>
                                <p className={styles.searchUserEmail}>{user.email}</p>
                                <p className={styles.searchUserPhone}>{user.phone_number}</p>
                              </div>
                              <div className={styles.searchUserMeta}>
                                <span className={`${styles.searchStatusBadge} ${getStatusClass(user.status)}`}>
                                  {user.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className={styles.searchDropdownItem}>
                        <p className={styles.searchNoResults}>No users found</p>
                      </div>
                    )}
                  </div>
                )}
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
