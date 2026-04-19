import EditorLayoutClient from '@/components/EditorLayoutClient';
import EditorSidebarWrapper from '@/components/EditorSidebarWrapper';

export const metadata = {
    title: 'Editor Portal | Finance Buddy',
    description: 'Content management and editor view.',
};

export default function Layout({ children }) {
    return (
        <EditorLayoutClient>
            <EditorSidebarWrapper>
                {children}
            </EditorSidebarWrapper>
        </EditorLayoutClient>
    );
}
