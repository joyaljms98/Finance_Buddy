import AdminLayoutClient from '@/components/AdminLayoutClient';
import AdminSidebarWrapper from '@/components/AdminSidebarWrapper';
import ReindexProgressBubble from '@/components/ReindexProgressBubble';

export const metadata = {
    title: 'Admin Panel | Finance Buddy',
    description: 'System administration and management.',
};

export default function Layout({ children }) {
    return (
        <AdminLayoutClient>
            <AdminSidebarWrapper>
                {children}
            </AdminSidebarWrapper>
            <ReindexProgressBubble />
        </AdminLayoutClient>
    );
}
