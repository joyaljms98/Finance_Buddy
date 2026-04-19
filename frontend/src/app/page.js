import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import MarketTicker from "@/components/MarketTicker";
import FeaturesSection from "@/components/FeaturesSection";
import ArticleSection from "@/components/ArticleSection";
import AdminCheatcodeListener from "@/components/AdminCheatcodeListener";
import ContactSection from "@/components/ContactSection";
import HeroVisual from "@/components/HeroVisual";
import HeroCTA from "@/components/HeroCTA";

export const metadata = {
    title: 'Finance Buddy - Proactive Wealth Architecture',
    description: 'Stop reacting to the market. Start architecting your future with AI-driven tax planning, smart savings, and personalized financial wisdom.',
};

export default function Home() {
    return (
        <div id="home" className="min-h-screen flex flex-col bg-gray-50">
            <AdminCheatcodeListener />
            <Navbar />

            {/* --- Hero Section --- */}
            <header className="relative bg-gradient-to-br from-blue-50 to-white overflow-hidden min-h-[calc(100vh-6.9rem)] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center">

                    <div className="md:w-1/2 z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                            Proactive Wealth <br />
                            <span className="text-blue-600">Architecture</span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 max-w-lg">
                            Stop reacting to the market. Start architecting your future with AI-driven tax planning, smart savings, and personalized financial wisdom.
                        </p>
                    <HeroCTA />
                    </div>

                    {/* Hero Visual */}
                    <HeroVisual />
                </div>
            </header>

            {/* Ticker */}
            <MarketTicker />

            {/* --- Features Section --- */}
            <div id="features">
                <FeaturesSection />
            </div>

            {/* --- Articles Section --- */}
            <div id="articles">
                <ArticleSection />
            </div>

            {/* --- Contact Team Section --- */}
            <div id="contact">
                <ContactSection />
            </div>

            {/* --- Footer --- */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2026 Finance Buddy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
