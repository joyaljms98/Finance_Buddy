'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Search } from 'lucide-react';

export default function ContactSection() {
    const [contactInfo, setContactInfo] = useState({
        adminName: 'Finance Buddy Team',
        email: 'support@financebuddy.com',
        phone: '+91 98765 43210',
        officeAddress: 'Finance Buddy Admin HQ'
    });

    useEffect(() => {
        const stored = localStorage.getItem('systemSettings');
        if (stored) {
            const parsed = JSON.parse(stored);
            setContactInfo({
                adminName: parsed.adminName || 'Finance Buddy Team',
                email: parsed.supportEmail || 'support@financebuddy.com',
                phone: parsed.contactNumber || '+91 98765 43210',
                officeAddress: parsed.officeAddress || 'Finance Buddy Admin HQ'
            });
        }
    }, []);

    return (
        <section className="relative py-24 overflow-hidden bg-white">
            {/* Interactive Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 right-20 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                        Contact the Team
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Have questions about your proactive wealth architecture? We're here to help you get the most out of {contactInfo.adminName}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

                    {/* Email Card (Hover effect translates it up) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                        <div className="relative z-10">
                            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-500 mb-4 text-sm">Our team typically replies within 2 hours.</p>
                            <a href={`mailto:${contactInfo.email}`} className="text-blue-600 font-bold hover:underline">
                                {contactInfo.email}
                            </a>
                        </div>
                    </div>

                    {/* Phone Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-purple-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                        <div className="relative z-10">
                            <div className="mx-auto w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                                <Phone size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-500 mb-4 text-sm">Mon-Fri from 9am to 6pm IST.</p>
                            <a href={`tel:${contactInfo.phone}`} className="text-purple-600 font-bold hover:underline">
                                {contactInfo.phone}
                            </a>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                        <div className="relative z-10">
                            <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Office</h3>
                            <p className="text-gray-500 mb-4 text-sm">Drop by for a coffee and chat.</p>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.officeAddress)}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
                                {contactInfo.officeAddress}
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
