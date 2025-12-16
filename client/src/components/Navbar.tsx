'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-3xl transition-all duration-300">
                <div className={`px-6 py-2.5 rounded-full border shadow-2xl transition-all duration-300 ${isScrolled
                        ? 'bg-black border-white/10'
                        : 'nav-floating glass-card border-white/10'
                    }`}>
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                <span className="text-black font-bold text-xs">F</span>
                            </div>
                            <span className="text-lg font-semibold text-white hidden sm:block">FIRA</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/venues" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Venues
                            </Link>
                            <Link href="/events" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Events
                            </Link>
                            <Link href="/create" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Create
                            </Link>
                            <Link href="/brands" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                                Brands
                                <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-3">
                            <Link href="/signin" className="text-gray-400 hover:text-white transition-colors text-sm">
                                Sign In
                            </Link>
                            <Link href="/signup" className="btn-primary px-4 py-1.5 rounded-full text-sm">
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-400 hover:text-white p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Black background */}
                {isMenuOpen && (
                    <div className="md:hidden mt-2 bg-black rounded-2xl p-4 border border-white/10">
                        <div className="flex flex-col space-y-3">
                            <Link href="/venues" className="text-gray-400 hover:text-white transition-colors text-sm py-1">
                                Venues
                            </Link>
                            <Link href="/events" className="text-gray-400 hover:text-white transition-colors text-sm py-1">
                                Events
                            </Link>
                            <Link href="/create" className="text-gray-400 hover:text-white transition-colors text-sm py-1">
                                Create
                            </Link>
                            <Link href="/brands" className="text-gray-400 hover:text-white transition-colors text-sm py-1">
                                Brands
                            </Link>
                            <div className="pt-3 flex flex-col space-y-2 border-t border-white/10">
                                <Link href="/signin" className="text-gray-400 hover:text-white transition-colors text-sm py-1">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="btn-primary px-4 py-2 rounded-full text-sm text-center">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
