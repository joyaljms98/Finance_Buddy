import DashboardLayoutClient from '@/components/DashboardLayoutClient';

export const metadata = {
    title: 'Dashboard | Finance Buddy',
    description: 'Manage your finances, expenses, and goals.',
};

export default function Layout({ children }) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
