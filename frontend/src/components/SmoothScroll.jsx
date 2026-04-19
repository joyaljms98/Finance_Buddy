'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

export default function SmoothScroll() {
    const pathname = usePathname();

    useEffect(() => {
        // 1. Initialize Main Lenis (for Window)
        const mainLenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        // 2. Map to hold multiple active Lenis instances for independent scroll containers
        const lenisInstances = new Map();

        function raf(time) {
            mainLenis.raf(time);
            lenisInstances.forEach(instance => instance.raf(time));
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // 3. Prevent Lenis from hijacking internal UI scroll components dynamically
        // Instead, we give them their OWN buttery smooth Lenis instances.
        const scanAndBindLenis = () => {
            const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, .custom-scrollbar');

            scrollableContainers.forEach(el => {
                if (!lenisInstances.has(el) && el !== document.body && el !== document.documentElement) {
                    try {
                        const instance = new Lenis({
                            wrapper: el,
                            content: el.firstElementChild || el,
                            duration: 1.2,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                            smoothWheel: true,
                        });
                        lenisInstances.set(el, instance);
                    } catch (e) {
                        console.warn('Failed to bind Lenis to container', el, e);
                    }
                }
            });

            // Cleanup detached elements to prevent memory leaks
            lenisInstances.forEach((instance, el) => {
                if (!document.body.contains(el)) {
                    instance.destroy();
                    lenisInstances.delete(el);
                }
            });
        };

        // Run instantly on mount
        scanAndBindLenis();

        // Run again after 500ms to catch React hydration / suspense delays
        const scanTimeout = setTimeout(scanAndBindLenis, 500);

        // Run whenever the DOM updates (e.g. clicking a new tab in settings or roles)
        const observer = new MutationObserver(scanAndBindLenis);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

        // 4. Smart Click Handler for anchor elements
        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            if (href.includes('#')) {
                const [path, hash] = href.split('#');
                const targetId = hash;

                const isHomePage = pathname === '/';
                const isHomeLink = path === '/' || path === '';

                // If we are on Home AND the link is for Home -> Intercept & Glide
                if (isHomePage && isHomeLink && targetId) {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        mainLenis.scrollTo(targetElement, {
                            offset: -80, // Offset for typical sticky navbars
                            duration: 1.5,
                        });
                        window.history.pushState({}, '', `/#${targetId}`);
                    }
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        return () => {
            clearTimeout(scanTimeout);
            observer.disconnect();
            mainLenis.destroy();
            lenisInstances.forEach(instance => instance.destroy());
            lenisInstances.clear();
            document.removeEventListener('click', handleAnchorClick);
        };
    }, [pathname]);

    return null;
}
