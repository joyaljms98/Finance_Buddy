'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCheatcodeListener() {
    const router = useRouter();
    const [cheatcode, setCheatcode] = useState('admin123');

    useEffect(() => {
        // Fetch custom cheatcode from local storage if available
        const storedCheatcode = localStorage.getItem('adminCheatcode');
        if (storedCheatcode) {
            setCheatcode(storedCheatcode);
        }
    }, []);

    useEffect(() => {
        let buffer = '';

        const handleKeyDown = (e) => {
            // Ignore keystrokes if the user is typing inside an input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            buffer += e.key;

            // Keep buffer at a reasonable length to avoid memory leaks
            if (buffer.length > 50) {
                buffer = buffer.substring(buffer.length - 50);
            }

            if (buffer.endsWith(cheatcode)) {
                router.push('/admin');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [cheatcode, router]);

    return null;
}
