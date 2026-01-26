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
            if (showFilterPanel && !target.closest('.filter-panel') && !target.closest('.filter-trigger')) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-[#39CD62]';
            case 'Inactive':
                return 'bg-gray-100 text-[#545F7D]';
            case 'Pending':
                return 'bg-[#fdf7e5] text-[#E9B200]';
            case 'Blacklisted':
                return 'bg-red-100 text-[#E4033B]';
            default:
                return 'bg-gray-100 text-gray-800';
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
            bgColor: 'bg-[#fce8ff]',

        },
        {
            title: 'Active Users',
            value: loading
                ? '...'
                : users.filter((u) => u.status === 'Active').length.toLocaleString(),
            icon: <User2 />,
            bgColor: 'bg-[#eee8ff]',
        },
        {
            title: 'Users with Loans',
            value: loading ? '...' : '12,453',
            icon: <User3 />,

            bgColor: 'bg-[#feefec]',
        },
        {
            title: 'Users with Savings',
            value: loading ? '...' : '102,453',
            icon: <User4 />,

            bgColor: 'bg-pink-100',
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Title */}
                <h1 className="text-2xl font-medium text-[#545f7d]">Users</h1>

                {/* Stats Cards */}
                <div className={`${workSans.className} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`}>
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
                            className={`bg-white p-6 rounded-lg shadow cursor-pointer`}
                        >
                            <div className="space-y-3">
                                <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center`}>
                                    <span className="text-2xl">{card.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm text-[#545f7d] font-medium uppercase mb-3">{card.title}</p>
                                    <p className="text-2xl font-bold text-[#545f7d]">{card.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Users Table */}
                <div className={`${workSans.className} bg-white rounded-lg shadow-lg  overflow-hidden`}>
                    {loading ? (
                        <>
                            {/* Mobile Loading State */}
                            <div className="lg:hidden p-8 text-center text-[#545f7d] min-h-[350px] flex items-center justify-center">
                                Loading users...
                            </div>
                            {/* Desktop Skeleton Loader */}
                            <div className="overflow-x-auto my-scrollbar">
                                <div className="relative min-h-[550px]">
                                    <UserTableSkeleton />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="overflow-x-auto my-scrollbar">
                                {/* Mobile Card View */}
                                <div className="lg:hidden space-y-4 p-4 min-h-[350px]">
                                    {filteredUsers.length === 0 && hasActiveFilters ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <p className="text-gray-500 text-sm">No match found for the filter</p>
                                            </div>
                                        </div>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => router.push(`/dashboard/users/${user.id}`)}
                                                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-secondary">{user.username}</p>
                                                        <p className="text-sm text-[#545f7d]">{user.email}</p>
                                                    </div>
                                                    <div className="relative">
                                                        <button
                                                            ref={(el) => { menuRefs.current[user.id] = el; }}
                                                            onClick={(e) => handleMenuToggle(user.id, e)}
                                                            className="menu-trigger text-gray-400 hover:text-[#545f7d] p-1"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
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
                                                            <div className={`context-menu absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${menuPosition[user.id] === 'top'
                                                                ? 'bottom-full mb-2'
                                                                : 'top-0 mt-2'
                                                                }`}>
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => handleViewDetails(user.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-[#545f7d] hover:bg-gray-100 flex items-center gap-3"
                                                                    >
                                                                        <EyeIcon />
                                                                        View Details
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleBlacklistUser(user.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-[#545f7d] hover:bg-gray-100 flex items-center gap-3"
                                                                    >
                                                                        <BlacklistIcon />
                                                                        Blacklist User
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleActivateUser(user.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-[#545f7d] hover:bg-gray-100 flex items-center gap-3"
                                                                    >
                                                                        <ActivateIcon />
                                                                        Activate User
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Organization</p>
                                                        <p className="text-[#545f7d]">{user.organization}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p className="text-[#545f7d]">{user.phone_number}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Date Joined</p>
                                                        <p className="text-[#545f7d]">{formatDate(user.date_joined)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Status</p>
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                user.status
                                                            )}`}
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
                                <div className="relative ">
                                    {/* Filter Panel */}
                                    {showFilterPanel && (
                                        <div className="filter-panel absolute left-0 top-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80">
                                            <div className="space-y-4">
                                                {/* Organization */}
                                                <div>
                                                    <label className="block text-xs font-medium text-[#545f7d] mb-2">
                                                        Organization
                                                    </label>
                                                    <select
                                                        value={filterOrganization}
                                                        onChange={(e) => setFilterOrganization(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#545f7d] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                                <div>
                                                    <label className="block text-xs font-medium text-[#545f7d] mb-2">
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterUsername}
                                                        onChange={(e) => setFilterUsername(e.target.value)}
                                                        placeholder="User"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#545f7d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label className="block text-xs font-medium text-[#545f7d] mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterEmail}
                                                        onChange={(e) => setFilterEmail(e.target.value)}
                                                        placeholder="Email"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#545f7d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Date */}
                                                <div>
                                                    <label className="block text-xs font-medium text-[#545f7d] mb-2">
                                                        Date
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={filterDate}
                                                            onChange={(e) => setFilterDate(e.target.value)}
                                                            placeholder="Date"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#545f7d] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        <div className="absolute right-4 top-2">
                                                            <DateIcon />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phone Number */}
                                                <div>
                                                    <label className="block text-xs font-medium text-[#545f7d] mb-2">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={filterPhone}
                                                        onChange={(e) => setFilterPhone(e.target.value)}
                                                        placeholder="Phone Number"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#545f7d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Status */}
                                                <div>
                                                    <label className="block text-xs font-medium text-[#545f7d] mb-2">
                                                        Status
                                                    </label>
                                                    <select
                                                        value={filterStatus}
                                                        onChange={(e) => setFilterStatus(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-[#545f7d] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        onClick={handleResetFilters}
                                                        className="flex-1 px-4 py-2 border border-primary text-[#545F7D] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={handleApplyFilters}
                                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-[#2fb3b3] transition-colors"
                                                    >
                                                        Filter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <table className="w-full hidden lg:table">
                                        <thead className=" ">
                                            <tr>
                                                <th className="px-6 py-5 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        Organization
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className="filter-trigger cursor-pointer hover:opacity-70"
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        Username
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className="filter-trigger cursor-pointer hover:opacity-70"
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        Email
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className="filter-trigger cursor-pointer hover:opacity-70"
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        Phone Number
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className="filter-trigger cursor-pointer hover:opacity-70"
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        Date Joined
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className="filter-trigger cursor-pointer hover:opacity-70"
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        Status
                                                        <button
                                                            onClick={handleFilterClick}
                                                            className="filter-trigger cursor-pointer hover:opacity-70"
                                                        >
                                                            <Filter />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#545f7d] uppercase tracking-wider">
                                                    {/* Actions column */}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.length === 0 && hasActiveFilters ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-6">
                                                        <div className="flex items-center justify-center min-h-[550px]">
                                                            <p className="text-gray-500 text-sm">No match found for the filter</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr onClick={() => router.push(`/dashboard/users/${user.id}`)} key={user.id} className="hover:bg-gray-50 cursor-pointer">
                                                        <td className="px-6 py-6 whitespace-nowrap text-sm text-[#545f7d]">
                                                            {user.organization}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#545f7d]">
                                                            {user.username}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#545f7d]">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#545f7d]">
                                                            {user.phone_number}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#545f7d]">
                                                            {formatDate(user.date_joined)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                                                                    user.status
                                                                )}`}
                                                            >
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm relative">
                                                            <button
                                                                ref={(el) => { menuRefs.current[user.id] = el; }}
                                                                onClick={(e) => handleMenuToggle(user.id, e)}
                                                                className="menu-trigger text-gray-400 hover:text-[#545f7d] p-1"
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
                                                                <div className={`context-menu absolute right-6 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${menuPosition[user.id] === 'top'
                                                                    ? 'bottom-full mb-2'
                                                                    : 'top-0 mt-2'
                                                                    }`}>
                                                                    <div className="py-3 space-y-3">
                                                                        <button
                                                                            onClick={() => handleViewDetails(user.id)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-[#545f7d] hover:bg-gray-100 flex items-center gap-3"
                                                                        >
                                                                            <EyeIcon />
                                                                            View Details
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleBlacklistUser(user.id)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-[#545f7d] hover:bg-gray-100 flex items-center gap-3"
                                                                        >
                                                                            <BlacklistIcon />
                                                                            Blacklist User
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleActivateUser(user.id)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-[#545f7d] hover:bg-gray-100 flex items-center gap-3"
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
                <div className="px-4 text-[#545f7d] -mt-5 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#545f7d]">Showing</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="text-[#545F7D] px-4 bg-[#e5e8ee] rounded p-2 text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-[#545f7d]">
                            out of {getFilteredUsersCount().toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 border bg-[#e5e8ee] border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.6">
                                    <path d="M10.0061 11.0572C10.8472 11.8983 9.54344 13.1594 8.745 12.3183L3.99424 7.56753C3.61581 7.23121 3.61581 6.64276 3.99424 6.30644L8.61858 1.63996C9.45967 0.840975 10.7208 2.10261 9.87967 2.94316L5.8859 6.93694L10.0061 11.0572Z" fill="#7a8cb1" />
                                </g>
                            </svg>

                        </button>
                        <div className="flex items-center gap-1">
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
                                        className={`px-2 sm:px-3 py-1  rounded text-sm ${currentPage === pageNum
                                            ? 'bg-secondary text-[white] '
                                            : 'text-[#545F7D]'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <span className="px-1 sm:px-2 text-sm">...</span>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="p-2 text-[#545F7D] bg-[#e5e8ee] rounded text-sm "
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
