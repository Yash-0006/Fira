'use client';

import { useState, useRef, useEffect } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    icon?: React.ReactNode;
}

export function Select({ value, onChange, options, placeholder, className = '', icon }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-left text-sm hover:border-violet-500/30 transition-all focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-gray-400">{icon}</span>}
                    <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
                        {selectedOption ? selectedOption.label : placeholder || 'Select...'}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${value === option.value ? 'text-violet-400 bg-violet-400/5' : 'text-gray-300'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
