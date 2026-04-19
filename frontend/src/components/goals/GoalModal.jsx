import React, { useRef, useEffect } from 'react';
import { Target, Flag, Clock, Calendar, CheckSquare, X, DollarSign, CreditCard, Save, Trash2 } from 'lucide-react';

const GoalModal = ({
    isOpen,
    onClose,
    goal,
    setGoal,
    onSave,
    onDelete,
    colors,
    iconOptions
}) => {

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in cursor-default">
            {/* Modal Container: Fixed Height, Hidden Overflow (Desktop) / Scrollable (Mobile) */}
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl h-[90vh] max-h-[90vh] flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 overflow-y-auto md:overflow-hidden custom-scrollbar">

                {/* CLOSE BUTTON */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-[110] transition-colors">
                    <X size={20} className="text-gray-600" />
                </button>

                {/* LEFT COLUMN: VISUALS & CORE INFO - Scrollable only on Desktop */}
                <div
                    className="w-full md:w-5/12 bg-gray-50 p-8 border-r border-gray-100 flex flex-col shrink-0 md:overflow-y-auto md:h-full custom-scrollbar overscroll-contain"
                >

                    {/* Advanced Icon Selector */}
                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 text-center">Choose Icon & Color</label>

                        {/* Selected Icon Large Preview */}
                        <div className={`w-24 h-24 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-md mb-6 transition-all ${goal.color}`}>
                            {iconOptions[goal.iconIndex]?.component}
                        </div>

                        {/* Icon Grid */}
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            {iconOptions.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setGoal({ ...goal, iconIndex: idx })}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${goal.iconIndex === idx ? 'bg-white shadow-md ring-2 ring-blue-500' : 'hover:bg-gray-200 text-gray-400'}`}
                                >
                                    {React.cloneElement(opt.component, { size: 18 })}
                                </button>
                            ))}
                        </div>

                        {/* Color Grid */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {colors.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setGoal({ ...goal, color: c })}
                                    className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm ${c.split(' ')[0]} ${goal.color === c ? 'ring-2 ring-blue-600 ring-offset-2 scale-110' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Title</label>
                            <input
                                type="text"
                                value={goal.title}
                                onChange={(e) => setGoal({ ...goal, title: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none placeholder-gray-300"
                                placeholder="e.g. Dream Home"
                            />
                        </div>

                        {/* Priority Selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block flex items-center gap-2">
                                <Flag size={12} /> Priority Level
                            </label>
                            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setGoal({ ...goal, priority: level })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${goal.priority === level
                                            ? level === 1 ? 'bg-red-500 text-white shadow-md'
                                                : level === 5 ? 'bg-gray-200 text-gray-600'
                                                    : 'bg-blue-500 text-white shadow-md'
                                            : 'text-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        {level === 1 ? 'Critical' : level === 5 ? 'Low' : level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium flex items-center gap-2"><Clock size={14} /> Created On:</span>
                                <span className="font-bold text-gray-700">{new Date(goal.createdDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium flex items-center gap-2"><Target size={14} /> Target Date:</span>
                                <input
                                    type="date"
                                    value={goal.targetDate || ''}
                                    onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })}
                                    className="bg-transparent font-bold text-gray-700 text-right outline-none focus:text-blue-600 cursor-pointer"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILS - Scrollable only on Desktop */}
                <div
                    className="w-full md:w-7/12 p-8 flex flex-col shrink-0 md:overflow-y-auto md:h-full custom-scrollbar overscroll-contain"
                >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Financial Configuration</h3>

                    <div className="space-y-8 flex-1">

                        {/* Saved & Target Inputs */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Target Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl group-focus-within:text-blue-500">₹</span>
                                    <input
                                        type="number"
                                        value={goal.target}
                                        onChange={(e) => setGoal({ ...goal, target: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-4 font-bold text-gray-800 text-3xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder-gray-300"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Currently Saved</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xl">₹</span>
                                    <input
                                        type="number"
                                        value={goal.saved}
                                        onChange={(e) => setGoal({ ...goal, saved: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-4 font-bold text-green-700 text-3xl outline-none focus:bg-white focus:ring-4 focus:ring-green-50 transition-all placeholder-gray-300"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method & Recurrence */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setGoal({ ...goal, paymentMethod: 'full' })}
                                    className={`flex-1 py-3 font-bold rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${goal.paymentMethod === 'full' ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'border-transparent hover:bg-gray-200 text-gray-400'}`}
                                >
                                    <DollarSign size={24} />
                                    <span className="text-sm">Full Payment</span>
                                </button>
                                <button
                                    onClick={() => setGoal({ ...goal, paymentMethod: 'emi' })}
                                    className={`flex-1 py-3 font-bold rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${goal.paymentMethod === 'emi' ? 'bg-white border-blue-500 text-blue-700 shadow-sm' : 'border-transparent hover:bg-gray-200 text-gray-400'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="text-sm">Monthly EMI</span>
                                </button>
                            </div>

                            {/* Recurrence Engine (Only for EMI) */}
                            {goal.paymentMethod === 'emi' && (
                                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">Installment Schedule</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Monthly EMI Amount</label>
                                            <input
                                                type="number"
                                                value={goal.installments?.emi || ''}
                                                onChange={(e) => setGoal({ ...goal, installments: { ...goal.installments, emi: e.target.value } })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                                placeholder="₹ 0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tenure (Months)</label>
                                            <input
                                                type="text"
                                                value={goal.installments?.tenure || ''}
                                                onChange={(e) => setGoal({ ...goal, installments: { ...goal.installments, tenure: e.target.value } })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                                                placeholder="e.g. 24"
                                            />
                                        </div>
                                    </div>

                                    {/* Recurrence Pattern */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <Calendar size={16} className="text-blue-500" /> Payment Frequency
                                            </label>
                                            <select
                                                value={goal.recurrence?.type || 'monthly'}
                                                onChange={(e) => setGoal({ ...goal, recurrence: { ...(goal.recurrence || {}), type: e.target.value } })}
                                                className="bg-gray-100 border-none rounded-lg text-xs font-bold px-3 py-1 cursor-pointer outline-none"
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="interval">Custom Interval</option>
                                            </select>
                                        </div>

                                        {/* Dynamic inputs based on type */}
                                        {(!goal.recurrence?.type || goal.recurrence?.type === 'monthly') && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                Running every month on day
                                                <input
                                                    type="number"
                                                    min="1" max="31"
                                                    value={goal.recurrence?.day || 5}
                                                    onChange={(e) => setGoal({ ...goal, recurrence: { ...(goal.recurrence || {}), day: e.target.value } })}
                                                    className="w-12 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center font-bold text-gray-900"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
                        {goal.id && (
                            <button onClick={onDelete} className="px-5 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-colors mr-auto flex items-center gap-2">
                                <Trash2 size={18} /> <span className="hidden sm:inline">Delete</span>
                            </button>
                        )}
                        <button onClick={onClose} className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onSave} className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all transform active:scale-95 flex items-center gap-2">
                            <Save size={18} /> Save Details
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GoalModal;
