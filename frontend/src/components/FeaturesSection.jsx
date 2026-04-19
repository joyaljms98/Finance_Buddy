import React from 'react';
import {
    Bot,
    PieChart,
    ShieldCheck,
    TrendingUp,
    Target,
    Smartphone
} from 'lucide-react';

const features = [
    {
        icon: <Bot size={32} />,
        title: "AI Financial Advisor",
        desc: "24/7 chat support to answer tax queries and suggest investment strategies instantly.",
        color: "bg-blue-100 text-blue-600"
    },
    {
        icon: <PieChart size={32} />,
        title: "Smart Expense Tracking",
        desc: "Visualize where your money goes with auto-categorized charts and monthly insights.",
        color: "bg-green-100 text-green-600"
    },
    {
        icon: <ShieldCheck size={32} />,
        title: "Bank-Grade Security",
        desc: "Your data is encrypted with AES-256 standards. We never sell your personal info.",
        color: "bg-purple-100 text-purple-600"
    },
    {
        icon: <TrendingUp size={32} />,
        title: "Market Predictions",
        desc: "Stay ahead with AI-driven market sentiment analysis and stock trend alerts.",
        color: "bg-orange-100 text-orange-600"
    },
    {
        icon: <Target size={32} />,
        title: "Goal Planning",
        desc: "Set targets for a car, home, or retirement. We calculate exactly how much to save.",
        color: "bg-red-100 text-red-600"
    },
    {
        icon: <Smartphone size={32} />,
        title: "Mobile First Design",
        desc: "Access your portfolio anywhere. Optimized for phones, tablets, and desktops.",
        color: "bg-indigo-100 text-indigo-600"
    }
];

export default function FeaturesSection() {
    return (
        <section className="py-32 bg-white overflow-hidden">

            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900">Why Choose Finance Buddy?</h2>
                <p className="text-gray-600 mt-4 text-lg">Everything you need to master your money.</p>
            </div>

            <div className="relative w-full [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">

                <div className="flex animate-infinite-scroll w-max gap-8 px-4 py-8">

                    {[...features, ...features].map((feature, index) => (
                        <div
                            key={index}
                            className="w-[350px] bg-white border border-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}
