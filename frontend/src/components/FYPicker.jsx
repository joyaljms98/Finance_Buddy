import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FYPicker({ selectedFY, onChange, options, currentFY }) {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef(null);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle scroll wheel hovering over the closed component
    useEffect(() => {
        const handleWheel = (e) => {
            if (isOpen) return; // Let the dropdown scroll natively if opened

            e.preventDefault(); // Prevent page scrolling

            // We use a simple Timeout to debounce extreme fast scroll events from trackpads
            const currentIndex = options.indexOf(selectedFY);

            if (e.deltaY > 0) {
                // Scrolled Down -> Next Year
                if (currentIndex < options.length - 1) {
                    onChange(options[currentIndex + 1]);
                }
            } else if (e.deltaY < 0) {
                // Scrolled Up -> Previous Year
                if (currentIndex > 0) {
                    onChange(options[currentIndex - 1]);
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            // Need { passive: false } to successfully prevent default page scrolling
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [isOpen, selectedFY, options, onChange]);

    // Scroll selected item into view automatically when opened
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedElement) {
                // Scroll the parent so the selected item is centered
                const container = scrollRef.current;
                const scrollPos = selectedElement.offsetTop - (container.offsetHeight / 2) + (selectedElement.offsetHeight / 2);
                container.scrollTop = scrollPos;
            }
        }
    }, [isOpen, selectedFY]);

    return (
        <div className="relative shrink-0" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer font-bold shadow-sm hover:shadow-md transition-all w-36 justify-between"
            >
                <div className="flex items-center gap-2">
                    <span>FY {selectedFY}</span>
                    {selectedFY === currentFY && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Current FY" />}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Wheel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wider">Select Financial Year</p>
                    </div>

                    {/* The Scrollable Wheel Area */}
                    <div
                        ref={scrollRef}
                        className="max-h-56 overflow-y-auto overflow-x-hidden scroll-smooth p-1 custom-scrollbar"
                    >
                        {/* Empty padding blocks to allow scrolling the first/last items to the vertical center if desired */}
                        <div className="h-2"></div>

                        {options.map((fy) => {
                            const isSelected = fy === selectedFY;
                            return (
                                <button
                                    key={fy}
                                    data-selected={isSelected}
                                    onClick={() => {
                                        onChange(fy);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-center py-2.5 px-4 mb-1 rounded-xl transition-all duration-200 ${isSelected
                                        ? 'bg-blue-50 text-blue-700 font-bold scale-100 border border-blue-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 scale-95 hover:scale-100'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2 w-full relative">
                                        <span>FY {fy}</span>
                                        {fy === currentFY && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 absolute right-2" title="Current FY" />}
                                    </div>
                                </button>
                            );
                        })}

                        <div className="h-2"></div>
                    </div>
                </div>
            )}
            <style jsx>{`
                /* Stylish custom scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
