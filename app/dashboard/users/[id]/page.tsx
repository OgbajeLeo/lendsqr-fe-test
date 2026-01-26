'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../components/DashboardLayout';
import { Work_Sans } from "next/font/google";
import Stars from '@/app/components/IconComponents/Stars';
import { formatCurrencyWithCommas } from '@/utils/helperFuntions';
import styles from './page.module.scss';

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
                <div className={styles.loadingState}>
                    <p>Loading user details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!userDetails) {
        return (
            <DashboardLayout>
                <div className={styles.notFoundState}>
                    <p>User not found</p>
                </div>
            </DashboardLayout>
        );
    }

    const fullName = `${userDetails.profile?.firstName || ''} ${userDetails.profile?.lastName || ''}`.trim();

    return (
        <DashboardLayout>
            <div className={`${workSans.className} ${styles.container}`}>
                {/* Back Button and Title */}
                <div className={styles.headerSection}>
                    <div>
                        <Link
                            href="/dashboard/users"
                            className={styles.backLink}
                        >
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.94997 15.3564C1.9945 15.4712 2.0613 15.5767 2.14684 15.6658L5.89684 19.4157C6.07263 19.5927 6.31285 19.6935 6.56248 19.6935C6.81211 19.6935 7.05232 19.5927 7.22812 19.4157C7.40508 19.24 7.50586 18.9997 7.50586 18.7501C7.50586 18.5005 7.40508 18.2603 7.22812 18.0845L5.07187 15.9376H27.6562C28.1742 15.9376 28.5937 15.5181 28.5937 15.0001C28.5937 14.4821 28.1742 14.0626 27.6562 14.0626H5.07187L7.22812 11.9158C7.5961 11.5478 7.5961 10.9525 7.22812 10.5845C6.86014 10.2165 6.26485 10.2165 5.89687 10.5845L2.14687 14.3345C2.06133 14.4236 1.99453 14.529 1.95 14.6439C1.90195 14.7564 1.87617 14.8771 1.875 15.0001C1.87617 15.1232 1.90195 15.2439 1.95 15.3564L1.94997 15.3564Z" fill="#545F7D" />
                            </svg>

                            Back to Users
                        </Link>
                    </div>
                    <div className={styles.actionButtons}>
                        <button
                            onClick={handleBlacklistUser}
                            disabled={userStatus === 'Blacklisted'}
                            className={`${styles.actionButton} ${styles.blacklist}`}
                        >
                            BLACKLIST USER
                        </button>
                        <button
                            onClick={handleActivateUser}
                            disabled={userStatus === 'Active'}
                            className={`${styles.actionButton} ${styles.activate}`}
                        >
                            ACTIVATE USER
                        </button>
                    </div>
                </div>

                <h1 className={styles.pageTitle}>User Details</h1>

                {/* User Summary Card */}
                <div className={styles.userSummaryCard}>
                    <div className={styles.summaryContent}>
                        <div className={styles.userInfoSection}>
                            {/* Avatar */}
                            <div className={styles.avatar}>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.04053 35.1796C6.47961 32.2202 7.79365 29.6264 9.97961 27.4C12.7405 24.6 16.0732 23.2 19.9796 23.2C23.886 23.2 27.2204 24.6 29.9796 27.4C32.1796 29.6266 33.5062 32.2204 33.9593 35.1796M28.1405 14.0204C28.1405 16.247 27.3468 18.1532 25.7593 19.7408C24.1734 21.3408 22.253 22.1408 20.0001 22.1408C17.7594 22.1408 15.8409 21.3408 14.2409 19.7408C12.6534 18.1533 11.8596 16.247 11.8596 14.0204C11.8596 11.7673 12.6534 9.8468 14.2409 8.2596C15.8409 6.67368 17.7596 5.87992 20.0001 5.87992C22.2532 5.87992 24.1737 6.67368 25.7593 8.2596C27.3468 9.84712 28.1405 11.7674 28.1405 14.0204Z" stroke="#213F7D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            {/* User Info Section */}
                            <div className={styles.userInfo}>
                                <h2 className={styles.userName}>{fullName}</h2>
                                <p className={styles.userId}>{userId}</p>
                                <span className={`${styles.statusBadge} ${styles[userStatus.toLowerCase()]}`}>
                                    {userStatus}
                                </span>
                            </div>

                            {/* User's Tier */}
                            <div className={styles.tierSection}>
                                <p className={styles.tierLabel}>User's Tier</p>
                                <Stars />
                            </div>

                            {/* Account Balance */}
                            <div className={styles.balanceSection}>
                                <p className={styles.balanceAmount}>
                                    {formatCurrencyWithCommas(userDetails.accountBalance || '₦200,000.00')}
                                </p>
                                <p className={styles.accountInfo}>
                                    {userDetails.accountNumber || '9912345678'}/Providus Bank
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabsContainer}>
                        <nav className={styles.tabsNav}>
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
                                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : styles.inactive}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContentCard}>
                    <div className={styles.tabContent}>
                        {activeTab === 'general' && (
                            <div>
                                {/* Personal Information */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        Personal Information
                                    </h3>
                                    <div className={`${styles.infoGrid} ${styles.personalInfo}`}>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Full Name</p>
                                            <p className={styles.infoValue}>{fullName}</p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Phone Number</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.phoneNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Email Address</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>BVN</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.bvn || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Gender</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.gender || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Marital Status</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.maritalStatus || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Children</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.children || 'None'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Type of Residence</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.profile?.typeOfResidence || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Education and Employment */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        Education and Employment
                                    </h3>
                                    <div className={`${styles.infoGrid} ${styles.educationInfo}`}>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Level of Education</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.education?.level || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Employment Status</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.education?.employmentStatus || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Sector of Employment</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.education?.sector || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>
                                                Duration of Employment
                                            </p>
                                            <p className={styles.infoValue}>
                                                {userDetails.education?.duration || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Office Email</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.education?.officeEmail || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Monthly Income</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.education?.monthlyIncome
                                                    ? `${formatCurrencyWithCommas(userDetails.education.monthlyIncome[0])} - ${formatCurrencyWithCommas(userDetails.education.monthlyIncome[1])}`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Loan Repayment</p>
                                            <p className={styles.infoValue}>
                                                {formatCurrencyWithCommas(userDetails.education?.loanRepayment || 'N/A')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Socials */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Socials</h3>
                                    <div className={`${styles.infoGrid} ${styles.socialsInfo}`}>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Twitter</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.socials?.twitter || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Facebook</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.socials?.facebook || 'N/A'}
                                            </p>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <p className={styles.infoLabel}>Instagram</p>
                                            <p className={styles.infoValue}>
                                                {userDetails.socials?.instagram || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guarantor */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Guarantor</h3>
                                    <div className={styles.guarantorSection}>
                                        {userDetails.guarantor && userDetails.guarantor.length > 0 ? (
                                            userDetails.guarantor.map((guarantor, index) => (
                                                <div key={index} className={styles.guarantorGrid}>
                                                    <div className={styles.infoItem}>
                                                        <p className={styles.infoLabel}>Full Name</p>
                                                        <p className={styles.infoValue}>
                                                            {guarantor.fullName}
                                                        </p>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <p className={styles.infoLabel}>Phone Number</p>
                                                        <p className={styles.infoValue}>
                                                            {guarantor.phoneNumber}
                                                        </p>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <p className={styles.infoLabel}>Email Address</p>
                                                        <p className={styles.infoValue}>
                                                            {guarantor.emailAddress}
                                                        </p>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <p className={styles.infoLabel}>Relationship</p>
                                                        <p className={styles.infoValue}>
                                                            {guarantor.relationship}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className={styles.infoValue}>No guarantor information available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className={styles.emptyState}>
                                <p>Documents section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'bank' && (
                            <div className={styles.emptyState}>
                                <p>Bank Details section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'loans' && (
                            <div className={styles.emptyState}>
                                <p>Loans section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'savings' && (
                            <div className={styles.emptyState}>
                                <p>Savings section - Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'app' && (
                            <div className={styles.emptyState}>
                                <p>App and System section - Coming soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            cancelAction();
                        }
                    }}
                >
                    <div className={styles.modalContent}>
                        {/* Header */}
                        <div className={styles.modalHeader}>
                            <div className={styles.headerLeft}>
                                <div className={`${styles.iconWrapper} ${actionType ? styles[actionType] : ''}`}>
                                    {actionType === 'blacklist' ? (
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    ) : (
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className={styles.headerText}>
                                    <h3 className={styles.modalTitle}>
                                        {actionType === 'blacklist' ? 'Blacklist User' : 'Activate User'}
                                    </h3>
                                    <p className={styles.modalSubtitle}>
                                        {userDetails?.profile?.firstName} {userDetails?.profile?.lastName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={cancelAction}
                                className={styles.closeButton}
                                aria-label="Close dialog"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className={styles.modalBody}>
                            <p className={styles.modalMessage}>
                                Are you sure you want to <span className={styles.highlight}>
                                    {actionType === 'blacklist' ? 'blacklist' : 'activate'}
                                </span> this user?
                            </p>
                            <p className={styles.modalDescription}>
                                {actionType === 'blacklist'
                                    ? 'This action will restrict the user from accessing their account and all associated services.'
                                    : 'This action will restore the user\'s access to their account and all associated services.'}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className={styles.modalFooter}>
                            <button
                                onClick={cancelAction}
                                className={`${styles.footerButton} ${styles.cancel}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`${styles.footerButton} ${styles.confirm} ${styles[actionType || '']}`}
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
