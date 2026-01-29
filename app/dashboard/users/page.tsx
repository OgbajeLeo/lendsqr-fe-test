'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import User from '@/app/components/IconComponents/User';
import User2 from '@/app/components/IconComponents/User2';
import User3 from '@/app/components/IconComponents/User3';
import User4 from '@/app/components/IconComponents/User4';
import { useRouter } from 'next/navigation';
import { Work_Sans } from "next/font/google";
import Filter from '@/app/components/IconComponents/Filter';
import ActivateIcon from '@/app/components/IconComponents/ActivateIcon';
import BlacklistIcon from '@/app/components/IconComponents/BlacklistIcon';
import EyeIcon from '@/app/components/IconComponents/EyeIcon';
import DateIcon from '@/app/components/IconComponents/DateIcon';
import UserTableSkeleton from '@/app/components/SkeletonLoader';
import { motion } from 'framer-motion';
import styles from './page.module.scss';

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"],
});
interface User {
    id: string;
    organization: string;
    username: string;
    email: string;
    phone_number: string;
    date_joined: string;
    status: 'Active' | 'Inactive' | 'Pending' | 'Blacklisted';
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ [key: string]: 'top' | 'bottom' }>({});
    const menuRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const router = useRouter();
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filterOrganization, setFilterOrganization] = useState('');
    const [filterUsername, setFilterUsername] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterPhone, setFilterPhone] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const apiUrl = process.env.NEXT_PUBLIC_JSON_GENERATOR_API_URL;
    const apiKey = process.env.NEXT_PUBLIC_JSON_GENERATOR_API_KEY;
    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users.filter(user => {
            const matchesOrganization = !filterOrganization || user.organization.toLowerCase().includes(filterOrganization.toLowerCase());
            const matchesUsername = !filterUsername || user.username.toLowerCase().includes(filterUsername.toLowerCase());
            const matchesEmail = !filterEmail || user.email.toLowerCase().includes(filterEmail.toLowerCase());
            const matchesPhone = !filterPhone || user.phone_number.includes(filterPhone);
            const matchesStatus = !filterStatus || user.status === filterStatus;
            let matchesDate = true;
            if (filterDate) {
                const userDate = new Date(user.date_joined).toISOString().split('T')[0];
                matchesDate = userDate === filterDate;
            }

            return matchesOrganization && matchesUsername && matchesEmail && matchesPhone && matchesStatus && matchesDate;
        });
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setFilteredUsers(filtered.slice(start, end));
    }, [users, currentPage, itemsPerPage, filterOrganization, filterUsername, filterEmail, filterDate, filterPhone, filterStatus]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.context-menu') && !target.closest('.menu-trigger')) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [openMenuId]);

    useEffect(() => {
        const handleClickOutsideFilter = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showFilterPanel &&
                !target.closest('.filter-panel') &&
                !target.closest('[class*="mobileFilterPanel"]') &&
                !target.closest('.filter-trigger')) {
                setShowFilterPanel(false);
            }
        };

        if (showFilterPanel) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutsideFilter);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutsideFilter);
            };
        }
    }, [showFilterPanel]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            if (typeof window !== 'undefined') {
                const cachedData = localStorage.getItem('userDataCache');
                const cacheTimestamp = localStorage.getItem('userDataCacheTimestamp');

                if (cachedData && cacheTimestamp) {
                    const cacheAge = Date.now() - parseInt(cacheTimestamp);
                    const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

                    if (cacheAge < CACHE_DURATION) {
                        const cachedUsers = JSON.parse(cachedData);
                        setUsers(
                            cachedUsers.map((user: any) => {
                                const status = user.employment_status === 'Unemployed'
                                    ? 'Inactive'
                                    : user.employment_status === 'Student'
                                        ? 'Pending'
                                        : 'Active';

                                return {
                                    id: user.id,
                                    organization: 'Lendsqr',
                                    username: user.full_name,
                                    email: user.email_address,
                                    phone_number: user.phone_number,
                                    date_joined: user.created_at,
                                    status,
                                };
                            })
                        );
                        setLoading(false);

                        fetchAndUpdateCache();
                        return;
                    }
                }
            }
            await fetchAndUpdateCache();
        } catch (error) {
            console.error('Error fetching users:', error);
            if (typeof window !== 'undefined') {
                const cachedData = localStorage.getItem('userDataCache');
                if (cachedData) {
                    const cachedUsers: User[] = JSON.parse(cachedData);
                    setUsers(cachedUsers);
                } else {
                    setUsers([]);
                }
            } else {
                setUsers([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAndUpdateCache = async () => {
        try {

            if (!apiUrl || !apiKey) {
                throw new Error('API URL or API key is not set');
            }
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const parsedData = await response.json();

            const transformedUsers: User[] = parsedData.map((user: any) => {
                let status: 'Active' | 'Inactive' | 'Pending' | 'Blacklisted' = 'Active';
                if (user.employment_status === 'Unemployed') {
                    status = 'Inactive';
                } else if (user.employment_status === 'Student') {
                    status = 'Pending';
                }

                return {
                    id: user.id,
                    organization: 'Lendsqr',
                    username: user.full_name || 'N/A',
                    email: user.email_address || 'N/A',
                    phone_number: user.phone_number || 'N/A',
                    date_joined: user.created_at || new Date().toISOString(),
                    status: status,
                };
            });
            setUsers(transformedUsers);
            if (typeof window !== 'undefined') {
                localStorage.setItem('userDataCache', JSON.stringify(parsedData));
                localStorage.setItem('userDataCacheTimestamp', Date.now().toString());
            }
        } catch (error) {
            console.error('Error fetching users from API:', error);
            throw error;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active':
                return styles.active;
            case 'Inactive':
                return styles.inactive;
            case 'Pending':
                return styles.pending;
            case 'Blacklisted':
                return styles.blacklisted;
            default:
                return styles.inactive;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleMenuToggle = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (openMenuId === userId) {
            setOpenMenuId(null);
            return;
        }

        const button = menuRefs.current[userId];
        if (button) {
            const rect = button.getBoundingClientRect();
            const menuHeight = 120;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
                setMenuPosition({ ...menuPosition, [userId]: 'top' });
            } else {
                setMenuPosition({ ...menuPosition, [userId]: 'bottom' });
            }
        }

        setOpenMenuId(userId);
    };

    const handleViewDetails = (userId: string) => {
        setOpenMenuId(null);
        router.push(`/dashboard/users/${userId}`);
    };

    const handleBlacklistUser = (userId: string) => {
        setOpenMenuId(null);
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: 'Blacklisted' as const } : user
        ));
    };

    const handleActivateUser = (userId: string) => {
        setOpenMenuId(null);
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: 'Active' as const } : user
        ));
    };

    const uniqueOrganizations = Array.from(new Set(users.map(u => u.organization))).sort();
    const uniqueStatuses: ('Active' | 'Inactive' | 'Pending' | 'Blacklisted')[] = ['Active', 'Inactive', 'Pending', 'Blacklisted'];


    const hasActiveFilters = filterOrganization || filterUsername || filterEmail || filterDate || filterPhone || filterStatus;

    const getTotalFilteredCount = () => {
        return users.filter(user => {
            const matchesOrganization = !filterOrganization || user.organization.toLowerCase().includes(filterOrganization.toLowerCase());
            const matchesUsername = !filterUsername || user.username.toLowerCase().includes(filterUsername.toLowerCase());
            const matchesEmail = !filterEmail || user.email.toLowerCase().includes(filterEmail.toLowerCase());
            const matchesPhone = !filterPhone || user.phone_number.includes(filterPhone);
            const matchesStatus = !filterStatus || user.status === filterStatus;

            let matchesDate = true;
            if (filterDate) {
                const userDate = new Date(user.date_joined).toISOString().split('T')[0];
                matchesDate = userDate === filterDate;
            }

            return matchesOrganization && matchesUsername && matchesEmail && matchesPhone && matchesStatus && matchesDate;
        }).length;
    };

    // Calculate filtered users for pagination
    const getFilteredUsersCount = () => {
        return getTotalFilteredCount();
    };

    const totalPages = Math.ceil(getFilteredUsersCount() / itemsPerPage);

    const handleFilterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowFilterPanel(!showFilterPanel);
    };

    const handleResetFilters = () => {
        setFilterOrganization('');
        setFilterUsername('');
        setFilterEmail('');
        setFilterDate('');
        setFilterPhone('');
        setFilterStatus('');
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        setShowFilterPanel(false);
    };

    const statsCards = [
        {
            title: 'Users',
            value: loading ? '...' : users.length.toLocaleString(),
            icon: <User />,
            iconClass: styles.purple,
        },
        {
            title: 'Active Users',
            value: loading
                ? '...'
                : users.filter((u) => u.status === 'Active').length.toLocaleString(),
            icon: <User2 />,
            iconClass: styles.violet,
        },
        {
            title: 'Users with Loans',
            value: loading ? '...' : '12,453',
            icon: <User3 />,
            iconClass: styles.orange,
        },
        {
            title: 'Users with Savings',
            value: loading ? '...' : '102,453',
            icon: <User4 />,
            iconClass: styles.pink,
        },
    ];

    return (
        <DashboardLayout>
            <div className={`${workSans.className} ${styles.container}`}>
                {/* Page Title */}
                <h1 className={styles.pageTitle}>Users</h1>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    {statsCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            whileHover={{
                                y: -4,
                                transition: { duration: 0.2 }
                            }}
                            className={styles.statCard}
                        >
                            <div className={styles.statContent}>
                                <div className={`${styles.iconWrapper} ${card.iconClass}`}>
                                    <span className={styles.icon}>{card.icon}</span>
                                </div>
                                <div className={styles.statInfo}>
                                    <p className={styles.statTitle}>{card.title}</p>
                                    <p className={styles.statValue}>{card.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Users Table */}
                <div className={`${workSans.className} ${styles.tableContainer}`}>
                    {loading ? (
                        <>
                            {/* Mobile Loading State */}
                            <div className={styles.loadingContainer}>
                                Loading users...
                            </div>
                            {/* Desktop Skeleton Loader */}
                            <div className={`${styles.skeletonContainer} my-scrollbar`}>
                                <div className={styles.skeletonWrapper}>
                                    <UserTableSkeleton />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`${styles.tableWrapper} my-scrollbar`}>
                                {/* Mobile Filter Button */}
                                <div className={styles.mobileFilterButtonContainer}>
                                    <button
                                        onClick={handleFilterClick}
                                        className={`filter-trigger ${styles.mobileFilterButton}`}
                                    >
                                        <Filter />
                                        <span>Filter</span>
                                        {hasActiveFilters && (
                                            <span className={styles.filterBadge}>
                                                {Object.values({
                                                    filterOrganization,
                                                    filterUsername,
                                                    filterEmail,
                                                    filterDate,
                                                    filterPhone,
                                                    filterStatus
                                                }).filter(Boolean).length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile Filter Panel Overlay */}
                                {showFilterPanel && (
                                    <div className={styles.mobileFilterOverlay} onClick={() => setShowFilterPanel(false)}>
                                        <div className={styles.mobileFilterPanel} onClick={(e) => e.stopPropagation()}>
                                            <div className={styles.mobileFilterPanelHeader}>
                                                <h2 className={styles.mobileFilterTitle}>Filter</h2>
                                                <button
                                                    onClick={() => setShowFilterPanel(false)}
                                                    className={styles.mobileFilterClose}
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M18 6L6 18M6 6L18 18" stroke="#545F7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className={styles.filterContent}>
                                                {/* Organization */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Organization
                                                    </label>
                                                    <select
                                                        value={filterOrganization}
                                                        onChange={(e) => setFilterOrganization(e.target.value)}
                                                        className={styles.filterSelect}
                                                    >
                                                        <option value="">Select</option>
                                                        {uniqueOrganizations.map((org) => (
                                                            <option key={org} value={org}>
                                                                {org}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Username */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterUsername}
                                                        onChange={(e) => setFilterUsername(e.target.value)}
                                                        placeholder="User"
                                                        className={styles.filterInput}
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Email
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterEmail}
                                                        onChange={(e) => setFilterEmail(e.target.value)}
                                                        placeholder="Email"
                                                        className={styles.filterInput}
                                                    />
                                                </div>

                                                {/* Date */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Date
                                                    </label>
                                                    <div className={styles.dateInputWrapper}>
                                                        <input
                                                            type="date"
                                                            value={filterDate}
                                                            onChange={(e) => setFilterDate(e.target.value)}
                                                            placeholder="Date"
                                                            className={styles.dateInput}
                                                        />
                                                        <div className={styles.dateIcon}>
                                                            <DateIcon />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phone Number */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterPhone}
                                                        onChange={(e) => setFilterPhone(e.target.value)}
                                                        placeholder="Phone Number"
                                                        className={styles.filterInput}
                                                    />
                                                </div>

                                                {/* Status */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Status
                                                    </label>
                                                    <select
                                                        value={filterStatus}
                                                        onChange={(e) => setFilterStatus(e.target.value)}
                                                        className={styles.filterSelect}
                                                    >
                                                        <option value="">Select</option>
                                                        {uniqueStatuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className={styles.filterActions}>
                                                    <button
                                                        onClick={handleResetFilters}
                                                        className={styles.resetButton}
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={handleApplyFilters}
                                                        className={styles.applyButton}
                                                    >
                                                        Filter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Card View */}
                                <div className={styles.mobileCardView}>
                                    {filteredUsers.length === 0 && hasActiveFilters ? (
                                        <div className={styles.noResults}>
                                            <div className={styles.noResultsText}>
                                                <p className={styles.noResultsMessage}>No match found for the filter</p>
                                            </div>
                                        </div>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => router.push(`/dashboard/users/${user.id}`)}
                                                className={styles.mobileCard}
                                            >
                                                <div className={styles.cardHeader}>
                                                    <div className={styles.cardUserInfo}>
                                                        <p className={styles.cardUsername}>{user.username}</p>
                                                        <p className={styles.cardEmail}>{user.email}</p>
                                                    </div>
                                                    <div className={styles.cardMenuButton}>
                                                        <button
                                                            ref={(el) => { menuRefs.current[user.id] = el; }}
                                                            onClick={(e) => handleMenuToggle(user.id, e)}
                                                            className="menu-trigger"
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
                                                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {openMenuId === user.id && (
                                                            <div className={`context-menu ${styles.contextMenu} ${menuPosition[user.id] === 'top' ? styles.top : styles.bottom}`}>
                                                                <div className={styles.menuContent}>
                                                                    <button
                                                                        onClick={() => handleViewDetails(user.id)}
                                                                        className={styles.menuItem}
                                                                    >
                                                                        <EyeIcon />
                                                                        View Details
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleBlacklistUser(user.id)}
                                                                        className={styles.menuItem}
                                                                    >
                                                                        <BlacklistIcon />
                                                                        Blacklist User
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleActivateUser(user.id)}
                                                                        className={styles.menuItem}
                                                                    >
                                                                        <ActivateIcon />
                                                                        Activate User
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.cardDetails}>
                                                    <div className={styles.detailItem}>
                                                        <p className={styles.detailLabel}>Organization</p>
                                                        <p className={styles.detailValue}>{user.organization}</p>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <p className={styles.detailLabel}>Phone</p>
                                                        <p className={styles.detailValue}>{user.phone_number}</p>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <p className={styles.detailLabel}>Date Joined</p>
                                                        <p className={styles.detailValue}>{formatDate(user.date_joined)}</p>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <p className={styles.detailLabel}>Status</p>
                                                        <span
                                                            className={`${styles.statusBadge} ${getStatusClass(user.status)}`}
                                                        >
                                                            {user.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Desktop Table View */}
                                <div className={styles.tableWrapper}>
                                    {/* Filter Panel */}
                                    {showFilterPanel && (
                                        <div className={`filter-panel ${styles.filterPanel}`}>
                                            <div className={styles.filterContent}>
                                                {/* Organization */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Organization
                                                    </label>
                                                    <select
                                                        value={filterOrganization}
                                                        onChange={(e) => setFilterOrganization(e.target.value)}
                                                        className={styles.filterSelect}
                                                    >
                                                        <option value="">Select</option>
                                                        {uniqueOrganizations.map((org) => (
                                                            <option key={org} value={org}>
                                                                {org}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Username */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterUsername}
                                                        onChange={(e) => setFilterUsername(e.target.value)}
                                                        placeholder="User"
                                                        className={styles.filterInput}
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Email
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterEmail}
                                                        onChange={(e) => setFilterEmail(e.target.value)}
                                                        placeholder="Email"
                                                        className={styles.filterInput}
                                                    />
                                                </div>

                                                {/* Date */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Date
                                                    </label>
                                                    <div className={styles.dateInputWrapper}>
                                                        <input
                                                            type="date"
                                                            value={filterDate}
                                                            onChange={(e) => setFilterDate(e.target.value)}
                                                            placeholder="Date"
                                                            className={styles.dateInput}
                                                        />
                                                        <div className={styles.dateIcon}>
                                                            <DateIcon />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phone Number */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterPhone}
                                                        onChange={(e) => setFilterPhone(e.target.value)}
                                                        placeholder="Phone Number"
                                                        className={styles.filterInput}
                                                    />
                                                </div>

                                                {/* Status */}
                                                <div className={styles.filterField}>
                                                    <label className={styles.filterLabel}>
                                                        Status
                                                    </label>
                                                    <select
                                                        value={filterStatus}
                                                        onChange={(e) => setFilterStatus(e.target.value)}
                                                        className={styles.filterSelect}
                                                    >
                                                        <option value="">Select</option>
                                                        {uniqueStatuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className={styles.filterActions}>
                                                    <button
                                                        onClick={handleResetFilters}
                                                        className={styles.resetButton}
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={handleApplyFilters}
                                                        className={styles.applyButton}
                                                    >
                                                        Filter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <table className={styles.table}>
                                        <thead className={styles.tableHead}>
                                            <tr className={styles.tableRow}>
                                                <th className={styles.tableHeader}>
                                                    <div className={styles.headerContent}>
                                                        Organization
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className={`filter-trigger ${styles.filterButton}`}
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className={styles.tableHeader}>
                                                    <div className={styles.headerContent}>
                                                        Username
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className={`filter-trigger ${styles.filterButton}`}
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className={styles.tableHeader}>
                                                    <div className={styles.headerContent}>
                                                        Email
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className={`filter-trigger ${styles.filterButton}`}
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className={styles.tableHeader}>
                                                    <div className={`${styles.headerContent} ${styles.whitespaceNowrap}`}>
                                                        Phone Number
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className={`filter-trigger ${styles.filterButton}`}
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className={styles.tableHeader}>
                                                    <div className={styles.headerContent}>
                                                        Date Joined
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className={`filter-trigger ${styles.filterButton}`}
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className={styles.tableHeader}>
                                                    <div className={styles.headerContent}>
                                                        Status
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className={`filter-trigger ${styles.filterButton}`}
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className={styles.tableHeader}>
                                                    {/* Actions column */}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={styles.tableBody}>
                                            {filteredUsers.length === 0 && hasActiveFilters ? (
                                                <tr className={styles.tableRow}>
                                                    <td colSpan={7} className={styles.tableCell}>
                                                        <div className={styles.emptyStateContent}>
                                                            <p className={styles.emptyStateMessage}>No match found for the filter</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr onClick={() => router.push(`/dashboard/users/${user.id}`)} key={user.id} className={styles.tableRow}>
                                                        <td className={styles.tableCell}>
                                                            {user.organization}
                                                        </td>
                                                        <td className={styles.tableCell}>
                                                            {user.username}
                                                        </td>
                                                        <td className={styles.tableCell}>
                                                            {user.email}
                                                        </td>
                                                        <td className={styles.tableCell}>
                                                            {user.phone_number}
                                                        </td>
                                                        <td className={styles.tableCell}>
                                                            {formatDate(user.date_joined)}
                                                        </td>
                                                        <td className={styles.tableCell}>
                                                            <span
                                                                className={`${styles.statusBadge} ${getStatusClass(user.status)}`}
                                                            >
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                                                            <button
                                                                ref={(el) => { menuRefs.current[user.id] = el; }}
                                                                onClick={(e) => handleMenuToggle(user.id, e)}
                                                                className={`menu-trigger ${styles.menuButton}`}
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clipPath="url(#clip0_106_835)">
                                                                        <path d="M10.0002 6.1111C10.9224 6.1111 11.6668 5.36666 11.6668 4.44444C11.6668 3.52222 10.9224 2.77777 10.0002 2.77777C9.07794 2.77777 8.3335 3.52222 8.3335 4.44444C8.3335 5.36666 9.07794 6.1111 10.0002 6.1111ZM10.0002 8.33333C9.07794 8.33333 8.3335 9.07777 8.3335 9.99999C8.3335 10.9222 9.07794 11.6667 10.0002 11.6667C10.9224 11.6667 11.6668 10.9222 11.6668 9.99999C11.6668 9.07777 10.9224 8.33333 10.0002 8.33333ZM10.0002 13.8889C9.07794 13.8889 8.3335 14.6333 8.3335 15.5555C8.3335 16.4778 9.07794 17.2222 10.0002 17.2222C10.9224 17.2222 11.6668 16.4778 11.6668 15.5555C11.6668 14.6333 10.9224 13.8889 10.0002 13.8889Z" fill="#545F7D" />
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath id="clip0_106_835">
                                                                            <rect width="20" height="20" fill="white" />
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg>
                                                            </button>

                                                            {openMenuId === user.id && (
                                                                <div className={`context-menu ${styles.contextMenuDesktop} ${menuPosition[user.id] === 'top' ? styles.top : styles.bottom}`}>
                                                                    <div className={styles.menuContent}>
                                                                        <button
                                                                            onClick={() => handleViewDetails(user.id)}
                                                                            className={styles.menuItem}
                                                                        >
                                                                            <EyeIcon />
                                                                            View Details
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleBlacklistUser(user.id)}
                                                                            className={styles.menuItem}
                                                                        >
                                                                            <BlacklistIcon />
                                                                            Blacklist User
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleActivateUser(user.id)}
                                                                            className={styles.menuItem}
                                                                        >
                                                                            <ActivateIcon />
                                                                            Activate User
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                        </>
                    )}
                </div>
                {/* Pagination */}
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        <span className={styles.infoText}>Showing</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className={styles.pageSelect}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className={styles.infoText}>
                            out of {getFilteredUsersCount().toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.paginationControls}>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={styles.paginationButton}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.6">
                                    <path d="M10.0061 11.0572C10.8472 11.8983 9.54344 13.1594 8.745 12.3183L3.99424 7.56753C3.61581 7.23121 3.61581 6.64276 3.99424 6.30644L8.61858 1.63996C9.45967 0.840975 10.7208 2.10261 9.87967 2.94316L5.8859 6.93694L10.0061 11.0572Z" fill="#7a8cb1" />
                                </g>
                            </svg>
                        </button>
                        <div className={styles.pageNumbers}>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <span className={styles.ellipsis}>...</span>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className={styles.lastPageButton}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={styles.paginationButton}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.99391 2.9428C3.15281 2.10171 4.45656 0.840563 5.255 1.68171L10.0058 6.43247C10.3842 6.76879 10.3842 7.35724 10.0058 7.69356L5.38142 12.36C4.54033 13.159 3.27918 11.8974 4.12033 11.0568L8.1141 7.06306L3.99391 2.9428Z" fill="#7a8cb1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
