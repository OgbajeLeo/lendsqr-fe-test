'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../components/DashboardLayout';
import { Work_Sans } from "next/font/google";
import Stars from '@/app/components/IconComponents/Stars';
import { formatCurrencyWithCommas } from '@/utils/helperFuntions';
const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"],
});
interface UserDetails {
    id: string;
    accountBalance: string;
    accountNumber: string;
    profile: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string;
        bvn: string;
        gender: string;
        maritalStatus: string;
        children: string;
        typeOfResidence: string;
    };
    education: {
        level: string;
        employmentStatus: string;
        sector: string;
        duration: string;
        officeEmail: string;
        monthlyIncome: string[];
        loanRepayment: string;
    };
    socials: {
        twitter: string;
        facebook: string;
        instagram: string;
    };
    guarantor: {
        fullName: string;
        phoneNumber: string;
        emailAddress: string;
        relationship: string;
    }[];
}

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    const [activeTab, setActiveTab] = useState('general');
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState<'Active' | 'Inactive' | 'Pending' | 'Blacklisted'>('Active');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [actionType, setActionType] = useState<'blacklist' | 'activate' | null>(null);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showConfirmDialog) {
                setShowConfirmDialog(false);
                setActionType(null);
            }
        };

        if (showConfirmDialog) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showConfirmDialog]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            if (typeof window !== 'undefined') {
                const storedData = localStorage.getItem('userDataCache');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    const user = parsedData.find((u: any) => u.id === userId);

                    if (user) {
                        const transformedUser: UserDetails = {
                            id: user.id,
                            accountBalance: '₦200,000.00',
                            accountNumber: user.account_number || '9912345678',
                            profile: {
                                firstName: user.full_name?.split(' ')[0] || '',
                                lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
                                phoneNumber: user.phone_number || 'N/A',
                                email: user.email_address || 'N/A',
                                bvn: user.bvn?.toString() || 'N/A',
                                gender: user.gender || 'N/A',
                                maritalStatus: user.marital_status || 'N/A',
                                children: user.children || 'None',
                                typeOfResidence: user.type_of_residence || 'N/A',
                            },
                            education: {
                                level: user.level_of_education || 'N/A',
                                employmentStatus: user.employment_status || 'N/A',
                                sector: user.sector_of_employment || 'N/A',
                                duration: user.duration_of_employment || 'N/A',
                                officeEmail: user.office_email || 'N/A',
                                monthlyIncome: user.monthly_income
                                    ? [user.monthly_income, user.monthly_income]
                                    : ['N/A', 'N/A'],
                                loanRepayment: user.loan_repayment || 'N/A',
                            },
                            socials: {
                                twitter: user.twitter || 'N/A',
                                facebook: user.facebook || 'N/A',
                                instagram: user.instagram || 'N/A',
                            },
                            guarantor: [
                                {
                                    fullName: user.guarantor_name || 'N/A',
                                    phoneNumber: user.guarantor_phone || 'N/A',
                                    emailAddress: user.guarantor_email || 'N/A',
                                    relationship: user.guarantor_relationship || 'N/A',
                                },
                            ],
                        };

                        setUserDetails(transformedUser);

                        // Load user status from localStorage
                        const userStatusData = localStorage.getItem('userStatuses');
                        if (userStatusData) {
                            const statuses = JSON.parse(userStatusData);
                            if (statuses[userId]) {
                                setUserStatus(statuses[userId]);
                            } else {
                                let initialStatus: 'Active' | 'Inactive' | 'Pending' | 'Blacklisted' = 'Active';
                                if (user.employment_status === 'Unemployed') {
                                    initialStatus = 'Inactive';
                                } else if (user.employment_status === 'Student') {
                                    initialStatus = 'Pending';
                                }
                                setUserStatus(initialStatus);
                            }
                        } else {
                            let initialStatus: 'Active' | 'Inactive' | 'Pending' | 'Blacklisted' = 'Active';
                            if (user.employment_status === 'Unemployed') {
                                initialStatus = 'Inactive';
                            } else if (user.employment_status === 'Student') {
                                initialStatus = 'Pending';
                            }
                            setUserStatus(initialStatus);
                        }

                        setLoading(false);
                        return;
                    }
                }
            }


        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlacklistUser = () => {
        setActionType('blacklist');
        setShowConfirmDialog(true);
    };

    const handleActivateUser = () => {
        setActionType('activate');
        setShowConfirmDialog(true);
    };

    const confirmAction = () => {
        if (!actionType) return;

        const newStatus = actionType === 'blacklist' ? 'Blacklisted' : 'Active';
        setUserStatus(newStatus);

        // Save status to localStorage
        if (typeof window !== 'undefined') {
            const userStatusData = localStorage.getItem('userStatuses');
            const statuses = userStatusData ? JSON.parse(userStatusData) : {};
            statuses[userId] = newStatus;
            localStorage.setItem('userStatuses', JSON.stringify(statuses));
            const storedData = localStorage.getItem('userData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                const updatedData = parsedData.map((u: any) => {
                    if (u.id === userId) {
                        if (newStatus === 'Blacklisted') {
                            return { ...u, status: 'Blacklisted' };
                        } else if (newStatus === 'Active') {
                            return { ...u, status: 'Active' };
                        }
                    }
                    return u;
                });
                localStorage.setItem('userData', JSON.stringify(updatedData));
            }
        }

        setShowConfirmDialog(false);
        setActionType(null);
    };

    const cancelAction = () => {
        setShowConfirmDialog(false);
        setActionType(null);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">Loading user details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!userDetails) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">User not found</p>
                </div>
            </DashboardLayout>
        );
    }

    const fullName = `${userDetails.profile?.firstName || ''} ${userDetails.profile?.lastName || ''}`.trim();

    return (
        <DashboardLayout>
            <div className={`${workSans.className} space-y-6`}>
                {/* Back Button and Title */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/users"
                            className="text-[#545F7D] hover:text-secondary flex items-center gap-2"
                        >
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.94997 15.3564C1.9945 15.4712 2.0613 15.5767 2.14684 15.6658L5.89684 19.4157C6.07263 19.5927 6.31285 19.6935 6.56248 19.6935C6.81211 19.6935 7.05232 19.5927 7.22812 19.4157C7.40508 19.24 7.50586 18.9997 7.50586 18.7501C7.50586 18.5005 7.40508 18.2603 7.22812 18.0845L5.07187 15.9376H27.6562C28.1742 15.9376 28.5937 15.5181 28.5937 15.0001C28.5937 14.4821 28.1742 14.0626 27.6562 14.0626H5.07187L7.22812 11.9158C7.5961 11.5478 7.5961 10.9525 7.22812 10.5845C6.86014 10.2165 6.26485 10.2165 5.89687 10.5845L2.14687 14.3345C2.06133 14.4236 1.99453 14.529 1.95 14.6439C1.90195 14.7564 1.87617 14.8771 1.875 15.0001C1.87617 15.1232 1.90195 15.2439 1.95 15.3564L1.94997 15.3564Z" fill="#545F7D" />
                            </svg>

                            Back to Users
                        </Link>
                    </div>
                    <div className="flex flex-row gap-4 font-semibold">
                        <button
                            onClick={handleBlacklistUser}
                            disabled={userStatus === 'Blacklisted'}
                            className={`px-4 sm:px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 text-sm sm:text-base transition-colors ${userStatus === 'Blacklisted' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                        >
                            BLACKLIST USER
                        </button>
                        <button
                            onClick={handleActivateUser}
                            disabled={userStatus === 'Active'}
                            className={`px-4 sm:px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white text-sm sm:text-base transition-colors ${userStatus === 'Active' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                        >
                            ACTIVATE USER
                        </button>
                    </div>
                </div>

                <h1 className="text-2xl font-semibold text-secondary">User Details</h1>

                {/* User Summary Card */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row items-center gap-6 pb-6 ">
                            {/* Avatar */}
                            <div className="size-[100px] rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.04053 35.1796C6.47961 32.2202 7.79365 29.6264 9.97961 27.4C12.7405 24.6 16.0732 23.2 19.9796 23.2C23.886 23.2 27.2204 24.6 29.9796 27.4C32.1796 29.6266 33.5062 32.2204 33.9593 35.1796M28.1405 14.0204C28.1405 16.247 27.3468 18.1532 25.7593 19.7408C24.1734 21.3408 22.253 22.1408 20.0001 22.1408C17.7594 22.1408 15.8409 21.3408 14.2409 19.7408C12.6534 18.1533 11.8596 16.247 11.8596 14.0204C11.8596 11.7673 12.6534 9.8468 14.2409 8.2596C15.8409 6.67368 17.7596 5.87992 20.0001 5.87992C22.2532 5.87992 24.1737 6.67368 25.7593 8.2596C27.3468 9.84712 28.1405 11.7674 28.1405 14.0204Z" stroke="#213F7D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            {/* User Info Section */}
                            <div className="text-center sm:text-left">
                                <h2 className="text-[22px] font-semibold text-secondary mb-2">{fullName}</h2>
                                <p className="text-sm text-[#38538a] mb-2">{userId}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${userStatus === 'Active' ? 'bg-green-100 text-[#39CD62]' :
                                    userStatus === 'Inactive' ? 'bg-gray-100 text-[#545F7D]' :
                                        userStatus === 'Pending' ? 'bg-[#fdf7e5] text-[#E9B200]' :
                                            'bg-red-100 text-[#E4033B]'
                                    }`}>
                                    {userStatus}
                                </span>
                            </div>

                            {/* User's Tier */}
                            <div className="shrink-0 border-r px-[30px] border-l border-[#e8e9ed] ">
                                <p className="text-sm text-[#38538a] font-medium mb-2">User's Tier</p>
                                <Stars />
                            </div>

                            {/* Account Balance */}
                            <div className="shrink-0 text-right lg:text-left">
                                <p className="text-[22px] font-semibold text-secondary mb-2">
                                    {formatCurrencyWithCommas(userDetails.accountBalance || '₦200,000.00')}
                                </p>
                                <p className="text-xs text-[#38538a]">
                                    {userDetails.accountNumber || '9912345678'}/Providus Bank
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6">
                        <nav className="flex justify-between overflow-x-auto">
                            {[
                                { id: 'general', label: 'General Details' },
                                { id: 'documents', label: 'Documents' },
                                { id: 'bank', label: 'Bank Details' },
                                { id: 'loans', label: 'Loans' },
                                { id: 'savings', label: 'Savings' },
                                { id: 'app', label: 'App and System' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 text-sm cursor-pointer font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-base font-semibold text-secondary mb-4">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 space-y-8 border-b border-gray-200 pb-6">
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Full Name</p>
                                            <p className="text-sm font-medium text-[#545F7D]">{fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Phone Number</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.phoneNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Email Address</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">BVN</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.bvn || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Gender</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.gender || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Marital Status</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.maritalStatus || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Children</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.children || 'None'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Type of Residence</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.profile?.typeOfResidence || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Education and Employment */}
                                <div>
                                    <h3 className="text-base font-semibold text-secondary mb-4">
                                        Education and Employment
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 space-y-6 border-b border-gray-200 pb-6">
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Level of Education</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.education?.level || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Employment Status</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.education?.employmentStatus || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Sector of Employment</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.education?.sector || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">
                                                Duration of Employment
                                            </p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.education?.duration || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Office Email</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.education?.officeEmail || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Monthly Income</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.education?.monthlyIncome
                                                    ? `${formatCurrencyWithCommas(userDetails.education.monthlyIncome[0])} - ${formatCurrencyWithCommas(userDetails.education.monthlyIncome[1])}`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Loan Repayment</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {formatCurrencyWithCommas(userDetails.education?.loanRepayment || 'N/A')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Socials */}
                                <div>
                                    <h3 className="text-base font-semibold text-secondary mb-4">Socials</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 space-y-6 border-b border-gray-200 pb-6">
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Twitter</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.socials?.twitter || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Facebook</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.socials?.facebook || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#38538a] uppercase mb-2">Instagram</p>
                                            <p className="text-sm font-medium text-[#545F7D]">
                                                {userDetails.socials?.instagram || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guarantor */}
                                <div className=''>
                                    <h3 className="text-base font-semibold text-secondary mb-4">Guarantor</h3>
                                    <div className="">
                                        {userDetails.guarantor && userDetails.guarantor.length > 0 ? (
                                            userDetails.guarantor.map((guarantor, index) => (
                                                <div key={index} className="grid grid-cols-1 lg:grid-cols-4 gap-6 space-y-6 border-b border-gray-200  w-full">
                                                    <div>
                                                        <p className="text-xs text-[#38538a] uppercase mb-2">Full Name</p>
                                                        <p className="text-sm font-medium text-[#545F7D]">
                                                            {guarantor.fullName}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#38538a] uppercase mb-2">Phone Number</p>
                                                        <p className="text-sm font-medium text-[#545F7D]">
                                                            {guarantor.phoneNumber}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#38538a] uppercase mb-2">Email Address</p>
                                                        <p className="text-sm font-medium text-[#545F7D]">
                                                            {guarantor.emailAddress}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#38538a] uppercase mb-2">Relationship</p>
                                                        <p className="text-sm font-medium text-[#545F7D]">
                                                            {guarantor.relationship}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-[#38538a]">No guarantor information available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Documents section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'bank' && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Bank Details section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'loans' && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Loans section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'savings' && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Savings section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'app' && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">App and System section - Coming soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            cancelAction();
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scaleIn">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${actionType === 'blacklist'
                                    ? 'bg-red-100'
                                    : 'bg-green-100'
                                    }`}>
                                    {actionType === 'blacklist' ? (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-secondary">
                                        {actionType === 'blacklist' ? 'Blacklist User' : 'Activate User'}
                                    </h3>
                                    <p className="text-sm text-[#38538a] mt-0.5">
                                        {userDetails?.profile?.firstName} {userDetails?.profile?.lastName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={cancelAction}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                                aria-label="Close dialog"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed mb-1">
                                Are you sure you want to <span className="font-semibold text-secondary">
                                    {actionType === 'blacklist' ? 'blacklist' : 'activate'}
                                </span> this user?
                            </p>
                            <p className="text-sm text-[#38538a] mt-3">
                                {actionType === 'blacklist'
                                    ? 'This action will restrict the user from accessing their account and all associated services.'
                                    : 'This action will restore the user\'s access to their account and all associated services.'}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={cancelAction}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 px-6 py-3 rounded-lg text-white transition-all font-medium shadow-sm hover:shadow-md ${actionType === 'blacklist'
                                    ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                                    : 'bg-primary hover:bg-primary/90 active:bg-primary/80'
                                    }`}
                            >
                                {actionType === 'blacklist' ? 'Blacklist User' : 'Activate User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
