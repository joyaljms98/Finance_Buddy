'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
    User, Briefcase, DollarSign, Wallet, TrendingUp, Target,
    Save, Download, Upload, Trash2, Check, AlertCircle,
    Home, Users, FileText, Heart, Shield, Info, ChevronDown, ChevronUp, Plus
} from 'lucide-react';

const INFO_CONTENT = {
    residential: {
        title: "Why Residential Status Matters?",
        content: (
            <div className="space-y-4 text-sm text-gray-600">
                <p><strong>This is the most fundamental factor.</strong> It determines what income the Indian government can tax. It is based on your physical stay in India, not your citizenship.</p>

                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <p className="font-semibold text-blue-800 mb-1">Stay Duration Calculation:</p>
                    <p className="mb-2 italic">When calculating days stayed in India, both the <strong>day of arrival</strong> in India and the <strong>day of departure</strong> from India are counted as days spent in India. Staying exactly 182 days makes you a resident.</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm space-y-3">
                    <div>
                        <p className="font-semibold text-gray-800">✅ Resident and Ordinarily Resident (ROR)</p>
                        <p className="text-gray-600">You are taxed on your global income. If you earn interest from a US bank or rent from a London flat, India wants a share.</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">🔄 Resident but Not Ordinarily Resident (RNOR)</p>
                        <p className="text-gray-600">A "transition" status. Taxed only on Indian income (not for income earned outside India) and foreign income derived from a business controlled in India. For those returning after long stays abroad (Non-resident in 9/10 past years).</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">⭐ Deemed Resident</p>
                        <p className="text-gray-600">An Indian citizen earning ₹15 Lakh+ from Indian sources, who is not liable to pay tax in any other country due to residency, is "deemed" a Resident (RNOR) in India, regardless of days stayed.</p>
                    </div>
                </div>

                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                    <p className="font-semibold text-green-800 mb-1">✈️ Non-Resident (NR)</p>
                    <p>You only pay tax on income earned or received in India (e.g., salary for work done in India or rent from an Indian property).</p>
                </div>
            </div>
        )
    },
    age: {
        title: "Why Age Category Matters?",
        content: (
            <div className="space-y-3 text-sm text-gray-600">
                <p>The government offers higher tax relief to older individuals as they rely on savings.</p>
                <ul className="list-disc pl-4 space-y-2">
                    <li><strong>General (&lt; 60 yrs):</strong> Standard tax rates apply.</li>
                    <li><strong>Senior Citizen (60+ yrs):</strong> Higher exemption limits. Deduction up to ₹50,000 on bank interest (Sec 80TTB). Higher medical insurance limits.</li>
                    <li><strong>Super Senior (80+ yrs):</strong> Highest exemption limits.</li>
                    <li><strong>Specified Senior (75+ yrs):</strong> No need to file ITR if income is only from pension & same-bank interest (tax deducted by bank).</li>
                </ul>
            </div>
        )
    },
    income: {
        title: "Nature of Employment & Income",
        content: (
            <div className="space-y-3 text-sm text-gray-600">
                <p>How you earn matters as much as how much you earn.</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-1">💼 Salaried Employees</p>
                    <p>You get a Standard Deduction (recently increased to ₹75,000 in the 2026 updates). Your employer handles TDS (Tax Deducted at Source).</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-1">🎨 Freelancers/Professionals</p>
                    <p>You can use the Presumptive Taxation Scheme (Sec 44ADA). If your receipts are below ₹75 lakh, you can simply declare 50% of your income as profit and pay tax on that, avoiding complex bookkeeping.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-1">🏢 Business Owners</p>
                    <p>You can deduct all "business-related expenses" (rent, electricity, travel, staff salary) before arriving at your taxable profit.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-1">🛑 No Income</p>
                    <p>Even with zero income, filing a "Nil Return" can be highly beneficial for visa processing, claiming refunds, or building credit history.</p>
                </div>
            </div>
        )
    },
    family: {
        title: "Family Status & 'Joint Filing' (New for 2026)",
        content: (
            <div className="space-y-3 text-sm text-gray-600">
                <p>Historically, India only recognized individual filing. However, starting in 2026, there is a major shift:</p>
                <ul className="list-disc pl-4 space-y-2 mt-2">
                    <li><strong>Individual Status:</strong> The standard way. Each spouse files separately.</li>
                    <li><strong>Married (Optional Joint Taxation):</strong> Per the 2026 reforms, married couples can now opt for Joint Filing if one spouse is a high earner and the other has little to no income. This allows for "income splitting," potentially keeping the household in a lower tax bracket.</li>
                    <li><strong>HUF (Hindu Undivided Family):</strong> A unique Indian concept where a family can be treated as a "separate person" for tax purposes, getting its own basic exemption limit and 80C deductions.</li>
                </ul>
            </div>
        )
    },
    regime: {
        title: "Choice of Tax Regime",
        content: (
            <div className="space-y-3 text-sm text-gray-600">
                <p>India currently follows a dual-regime system. You must choose one every year (unless you have business income, then the choice is more restricted).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <p className="font-semibold text-blue-800 mb-1">New Tax Regime (Default)</p>
                        <p>Offers lower tax rates and wider slabs (e.g., zero tax up to ₹12 lakh taxable income in 2026 due to rebates). However, you "sacrifice" almost all deductions (80C, 80D, HRA).</p>
                    </div>
                    <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                        <p className="font-semibold text-green-800 mb-1">Old Tax Regime</p>
                        <p>Higher tax rates, but allows you to reduce your taxable income using investments and expenses (LIC, PPF, Home Loan interest, Mediclaim).</p>
                    </div>
                </div>
            </div>
        )
    },
    health: {
        title: "Health, Disability & Insurance",
        content: (
            <div className="space-y-3 text-sm text-gray-600">
                <p>The government provides "social security" incentives, primarily under the Old Regime.</p>
                <ul className="list-disc pl-4 space-y-2 mt-2">
                    <li><strong>Health Insurance (Sec 80D):</strong> Deductions for premiums paid for self, spouse, children (up to ₹25,000) and parents (up to an additional ₹50,000 if they are seniors).</li>
                    <li><strong>Disability (Sec 80U/80DD):</strong> If you or a dependent have a certified disability, you get a flat deduction (up to ₹1,25,000 for severe disability) regardless of actual expenses.</li>
                    <li><strong>Life Insurance & Savings (Sec 80C):</strong> The "beginner's favorite." Covers EPF, LIC, ELSS, and School Fees up to ₹1.5 lakh.</li>
                </ul>
            </div>
        )
    },
    advanced: {
        title: "Advanced Factors: Digital & Global",
        content: (
            <div className="space-y-3 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Virtual Digital Assets (VDA):</strong> If you trade Crypto or NFTs, gains are taxed at a flat 30% with no deductions allowed, regardless of your total income.</li>
                    <li><strong>Capital Gains:</strong> The tax rate changes based on how long you hold an asset (Stocks, Gold, or Real Estate). Short-term gains are usually taxed higher than long-term gains.</li>
                </ul>
            </div>
        )
    }
};

const InfoDropdown = ({ infoKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const info = INFO_CONTENT[infoKey];

    if (!info) return null;

    return (
        <div className="mb-4 border border-blue-100 rounded-xl overflow-hidden bg-blue-50/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-50 transition-colors"
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Info size={16} /> {info.title}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-blue-500" /> : <ChevronDown size={16} className="text-blue-500" />}
            </button>

            {isOpen && (
                <div className="p-4 bg-white border-t border-blue-100 animate-in fade-in duration-300">
                    {info.content}
                </div>
            )}
        </div>
    );
};

export default function AboutYou() {
    const [profiles, setProfiles] = useState([]);
    const [activeProfileId, setActiveProfileId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState(initialFormState());
    const [notification, setNotification] = useState(null);

    function initialFormState() {
        return {
            id: '',
            profileFor: 'me (main)',
            gender: '',
            name: '',
            dob: '',
            ageCategory: 'General',

            residentialStatus: 'Resident',
            residentSubStatus: 'ROR',
            stayDaysInIndia: '',

            employmentSource: 'Salaried',
            isGovtEmployee: false,
            businessTurnover: '',
            professionalReceipts: '',
            optPresumptiveTax: false,
            auditRequired: false,

            maritalStatus: 'Single',
            taxFilingStatus: 'Individual',
            spouseAssetTransfer: false,
            childrenCount: '',
            payTuitionFee: false,
            minorChildIncome: false,
            dependentDisability: false,

            taxRegime: 'Unsure',

            selfDisability: 'None',
            specificDisease: false,

            hasVDA: false,
            hasCapitalGains: false,

            hasHealthInsurance: false,
            hasLifeInsurance: false,

            annualIncome: '',
            monthlyExpenses: '',
            savings: '',
            riskTolerance: 'Moderate',
            goals: '',
        };
    }

    useEffect(() => {
        if (formData.dob) {
            const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
            let cat = 'General';
            if (age >= 80) cat = 'Super Senior';
            else if (age >= 60) cat = 'Senior';

            setFormData(prev => ({ ...prev, ageCategory: cat }));
        }
    }, [formData.dob]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await api.get('/tax_profile');
                setProfiles(res.data);
                if (res.data.length > 0) {
                    setActiveProfileId(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to load tax profiles from server", err);
            }
        };
        fetchProfiles();
    }, []);

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveProfile = async () => {
        if (!formData.name || !formData.dob) {
            showNotification("Please fill all required fields marked with *", 'error');
            return;
        }

        const cleanNumber = (val) => (val === '' || val === null ? null : Number(val));
        
        const payloadFields = {
            childrenCount: cleanNumber(formData.childrenCount),
            businessTurnover: cleanNumber(formData.businessTurnover),
            professionalReceipts: cleanNumber(formData.professionalReceipts),
            stayDaysInIndia: cleanNumber(formData.stayDaysInIndia),
            annualIncome: cleanNumber(formData.annualIncome),
            monthlyExpenses: cleanNumber(formData.monthlyExpenses),
            savings: cleanNumber(formData.savings),
        };

        try {
            if (editingId) {
                const { id, ...rest } = formData;
                const putData = { ...rest, ...payloadFields };
                await api.put(`/tax_profile/${editingId}`, putData);
                setProfiles(prev => prev.map(p => p.id === editingId ? { ...formData, ...payloadFields, id: editingId } : p));
                setEditingId(null);
                showNotification("Profile updated successfully");
            } else {
                const { id, ...rest } = formData;
                const postData = { ...rest, ...payloadFields };
                const res = await api.post('/tax_profile', postData);
                setProfiles(prev => [...prev, res.data]);
                setActiveProfileId(res.data.id);
                showNotification("Profile created successfully");
            }
            setFormData(initialFormState());
            setIsAddingNew(false);
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (err) {
            console.error(err);
            showNotification("Failed to save profile on backend", 'error');
        }
    };

    const handleEdit = (profile) => {
        // Strip out 'null' values from backend objects and convert to empty strings to avoid React uncontrolled input warnings.
        const normalizedProfile = { ...initialFormState() };
        for (const key in profile) {
            normalizedProfile[key] = profile[key] === null ? '' : profile[key];
        }
        // Migrate legacy combined profileFor value to 'partner'
        if (normalizedProfile.profileFor === 'Wife / husband / partner') {
            normalizedProfile.profileFor = 'partner';
        }

        setFormData(normalizedProfile);
        setEditingId(profile.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this profile?")) {
            try {
                await api.delete(`/tax_profile/${id}`);
                const newProfiles = profiles.filter(p => p.id !== id);
                setProfiles(newProfiles);
                if (activeProfileId === id) setActiveProfileId(newProfiles.length > 0 ? newProfiles[0].id : null);
                if (editingId === id) cancelEdit();
                showNotification("Profile deleted");
            } catch (err) {
                console.error(err);
                showNotification("Failed to delete profile from backend", 'error');
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAddingNew(false);
        setFormData(initialFormState());
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "finance_buddy_profiles.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showNotification("Profiles exported");
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    showNotification("Importing to cloud...", "success");
                    for (const p of imported) {
                        const { id, user_id, updated_at, _id, ...cleanProfile } = p;
                        await api.post('/tax_profile', cleanProfile);
                    }
                    const fresh = await api.get('/tax_profile');
                    setProfiles(fresh.data);
                    if (fresh.data.length > 0) setActiveProfileId(fresh.data[0].id);
                    showNotification("Profiles imported to cloud");
                } else showNotification("Invalid JSON format", 'error');
            } catch (err) { showNotification("Upload failed", 'error'); }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const showForm = profiles.length === 0 || isAddingNew || editingId !== null;

    return (
        <main className="flex-1 flex flex-col bg-gray-50/50 relative rounded-2xl shadow-sm my-4 mx-4 border border-gray-100 overflow-hidden transition-all duration-300">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="text-blue-600" /> Tax Profile (Indian Context)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Detailed profile for accurate tax planning & compliance.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm flex-1 md:flex-none justify-center">
                        <Upload size={18} /> <span className="text-sm font-medium">Import</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex-1 md:flex-none justify-center">
                        <Download size={18} /> <span className="text-sm font-medium">Export</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">

                {notification && (
                    <div className={`p-4 rounded-xl flex items-center gap-2 animate-in fade-in duration-300 ${notification.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {notification.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />} {notification.msg}
                    </div>
                )}

                {showForm ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Form Area */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingId ? 'Edit Tax Profile' : 'Create New Tax Profile'}
                                </h2>
                                {editingId && <button onClick={cancelEdit} className="text-sm text-red-500 hover:underline">Cancel Editing</button>}
                            </div>

                            <div className="space-y-10">

                                {/* 0. Basic Identity */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile For <span className="text-red-500">*</span></label>
                                        <select name="profileFor" value={formData.profileFor} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                            <option value="me (main)">Me (Main)</option>
                                            <option value="wife">Wife</option>
                                            <option value="husband">Husband</option>
                                            <option value="partner">Partner</option>
                                            <option value="father">Father</option>
                                            <option value="mother">Mother</option>
                                            <option value="brother">Brother</option>
                                            <option value="sister">Sister</option>
                                            <option value="grandfather">Grandfather</option>
                                            <option value="grandmother">Grandmother</option>
                                            <option value="son">Son</option>
                                            <option value="daughter">Daughter</option>
                                            <option value="friend">Friend</option>
                                            <option value="customers">Customers</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Full Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="As per PAN Card" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="">Not specified</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Non-binary">Non-binary</option>
                                                <option value="Prefer not to say">Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* 1. Age Category (Reordered) */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                                            Age Category
                                        </h3>
                                    </div>

                                    <InfoDropdown infoKey="age" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category (Auto/Manual)</label>
                                            <select name="ageCategory" value={formData.ageCategory} onChange={handleInputChange} className="w-full px-4 py-2 border border-blue-200 bg-blue-50/20 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="General">General (&lt;60 yrs)</option>
                                                <option value="Senior">Senior Citizen (60-79 yrs)</option>
                                                <option value="Super Senior">Super Senior (80+ yrs)</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {formData.ageCategory === 'General' && 'Standard tax slabs apply.'}
                                            {formData.ageCategory === 'Senior' && 'Higher exemption limit & Section 80TTB benefits.'}
                                            {formData.ageCategory === 'Super Senior' && 'Highest exemption limit applies.'}
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* 2. Residential Status (Reordered) */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                                            Residential Status
                                        </h3>
                                    </div>

                                    <InfoDropdown infoKey="residential" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select name="residentialStatus" value={formData.residentialStatus} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="Resident">Resident</option>
                                                <option value="NRI">Non-Resident (NR)</option>
                                                <option value="Deemed Resident">Deemed Resident</option>
                                            </select>
                                        </div>
                                        {formData.residentialStatus === 'Resident' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Status</label>
                                                <select name="residentSubStatus" value={formData.residentSubStatus} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                    <option value="ROR">Resident & Ordinarily Resident (Global Tax)</option>
                                                    <option value="NOR">Resident but Not Ordinarily Resident</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stay Duration in India (Previous Year)</label>
                                            <input type="number" name="stayDaysInIndia" value={formData.stayDaysInIndia} onChange={handleInputChange} placeholder="Number of days" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" />
                                            <p className="text-xs text-gray-500 mt-1">182+ days usually makes you a Resident. Include both the day of arrival and departure.</p>
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* 3. Employment & Income */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                                            Nature of Employment
                                        </h3>
                                    </div>

                                    <InfoDropdown infoKey="income" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Source of Income</label>
                                            <select name="employmentSource" value={formData.employmentSource} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="Salaried">Salaried Employee</option>
                                                <option value="Business">Business Owner</option>
                                                <option value="Professional">Professional (Freelancer/Doctor etc.)</option>
                                                <option value="Retired">Retired / Pensioner</option>
                                                <option value="No Income">No Income</option>
                                            </select>
                                        </div>

                                        {/* Conditional Inputs */}
                                        {formData.employmentSource === 'Salaried' && (
                                            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                                <input type="checkbox" name="isGovtEmployee" checked={formData.isGovtEmployee} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <label className="text-sm text-gray-700">Government Employee?</label>
                                            </div>
                                        )}

                                        {formData.employmentSource === 'Business' && (
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Turnover</label>
                                                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                                        <input type="number" name="businessTurnover" value={formData.businessTurnover} onChange={handleInputChange} className="w-full pl-6 pr-4 py-2 border border-gray-200 rounded-xl outline-none" /></div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                                    <input type="checkbox" name="optPresumptiveTax" checked={formData.optPresumptiveTax} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                    <label className="text-sm text-gray-700">Opt for Presumptive (44AD)?</label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* 4. Family Status */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                                            Family Status
                                        </h3>
                                    </div>

                                    <InfoDropdown infoKey="family" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Filing Status</label>
                                            <select name="taxFilingStatus" value={formData.taxFilingStatus} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="Individual">Individual (Standard)</option>
                                                {formData.maritalStatus === 'Married' && <option value="Joint">Joint Filing (New 2026)</option>}
                                                <option value="HUF">HUF (Hindu Undivided Family)</option>
                                            </select>
                                        </div>
                                        {formData.taxFilingStatus === 'Joint' && (
                                            <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">
                                                Income splitting benefits apply for your household under the new 2026 reforms.
                                            </div>
                                        )}
                                        {formData.maritalStatus === 'Married' && formData.taxFilingStatus !== 'Joint' && (
                                            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                                <input type="checkbox" name="spouseAssetTransfer" checked={formData.spouseAssetTransfer} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <label className="text-sm text-gray-700">Assets transferred to spouse? (Clubbing)</label>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                                            <input type="number" min="0" name="childrenCount" value={formData.childrenCount} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                        <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                                                <input type="checkbox" name="payTuitionFee" checked={formData.payTuitionFee} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                                                Paying Tuition Fees? (80C)
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-700 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                                                <input type="checkbox" name="dependentDisability" checked={formData.dependentDisability} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                                                Dependent with Disability? (80DD)
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* 5. Tax Regime */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">5</span>
                                            Choice of Tax Regime
                                        </h3>
                                    </div>

                                    <InfoDropdown infoKey="regime" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <div>
                                            <select name="taxRegime" value={formData.taxRegime} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="Unsure">Unsure / Help me decide</option>
                                                <option value="Old">Old Regime (With Exemptions)</option>
                                                <option value="New">New Regime (Lower Rates, No Exemptions)</option>
                                            </select>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-tight">
                                            New Regime (115BAC) has lower rates but you forego HRA, 80C, etc. Old Regime allows all deductions.
                                        </p>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* 6. Health & Disability */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">6</span>
                                            Health & Disability (Self)
                                        </h3>
                                    </div>

                                    <InfoDropdown infoKey="health" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Self Disability (Sec 80U)</label>
                                            <select name="selfDisability" value={formData.selfDisability} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                                                <option value="None">None</option>
                                                <option value="Yes">Yes (Disability &gt; 40%)</option>
                                                <option value="Severe">Severe (Disability &gt; 80%)</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                            <input type="checkbox" name="specificDisease" checked={formData.specificDisease} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                            <label className="text-sm text-gray-700">Specific Disease (80DDB)? (e.g., Cancer)</label>
                                        </div>
                                        <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 bg-white flex-1 transition-colors">
                                                <input type="checkbox" name="hasHealthInsurance" checked={formData.hasHealthInsurance} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                                Health Insurance (Sec 80D)
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-700 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 bg-white flex-1 transition-colors">
                                                <input type="checkbox" name="hasLifeInsurance" checked={formData.hasLifeInsurance} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                                Life Insurance & Savings (Sec 80C)
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* 7. Advanced Factors */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">7</span>
                                            Advanced Factors
                                        </h3>
                                    </div>
                                    <InfoDropdown infoKey="advanced" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-10">
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                                            <input type="checkbox" name="hasVDA" checked={formData.hasVDA} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Crypto / Virtual Digital Assets</p>
                                                <p className="text-xs text-gray-500 mt-1">Traded or hold Crypto, NFTs, etc. (Flat 30% Tax)</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                                            <input type="checkbox" name="hasCapitalGains" checked={formData.hasCapitalGains} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Capital Gains</p>
                                                <p className="text-xs text-gray-500 mt-1">Generated income from Stocks, Real Estate, Gold, etc.</p>
                                            </div>
                                        </label>
                                    </div>
                                </section>

                                {/* Financials Summary */}
                                <section className="bg-blue-50 p-4 rounded-xl space-y-4 border border-blue-100">
                                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                        <DollarSign size={16} /> Quick Financials (₹)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Annual Income</label>
                                            <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none bg-white" placeholder="₹" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Monthly Expenses</label>
                                            <input type="number" name="monthlyExpenses" value={formData.monthlyExpenses} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none bg-white" placeholder="₹" />
                                        </div>
                                    </div>
                                </section>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button onClick={handleSaveProfile} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center gap-2">
                                        <Save size={18} /> {editingId ? 'Update & Save' : 'Save Profile'}
                                    </button>
                                    {editingId && (
                                        <button onClick={cancelEdit} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all">
                                            Cancel
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Profile List */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                                Profiles <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{profiles.length}</span>
                            </h3>

                            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                                {profiles.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                        <User size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No profiles found.</p>
                                        <p className="text-xs">Fill the form to create one.</p>
                                    </div>
                                ) : (
                                    profiles.map(p => (
                                        <div key={p.id} onClick={() => setActiveProfileId(p.id)} className={`p-4 rounded-xl border cursor-pointer transition-all group ${activeProfileId === p.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className={`font-bold ${activeProfileId === p.id ? 'text-blue-700' : 'text-gray-900'}`}>{p.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">{p.ageCategory} • {p.residentialStatus}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Info size={14} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-600">{p.employmentSource}</span>
                                                <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-600">{p.taxRegime} Regime</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                        {profiles.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => handleEdit(p)}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                                        <User size={24} />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} 
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
                                <p className="text-sm font-medium text-gray-500 mb-3 capitalize">{p.profileFor || 'Me (Main)'}</p>
                                {p.gender && (
                                    <span className="inline-block text-[10px] px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-md font-medium mb-3">{p.gender}</span>
                                )}

                                <div className="mt-auto space-y-2">
                                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="font-semibold">Age Group</span>
                                        <span>{p.ageCategory}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="font-semibold">Residency</span>
                                        <span>{p.residentialStatus}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Profile Card */}
                        <div 
                            onClick={() => {
                                setFormData(initialFormState());
                                setIsAddingNew(true);
                            }}
                            className="border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-400 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[200px]"
                        >
                            <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 shadow-sm transition-transform">
                                <Plus size={32} className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="font-bold text-gray-600 group-hover:text-blue-600">Add Profile</span>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
