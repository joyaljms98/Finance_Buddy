import React from 'react';
import { Target, Trophy, Car, Home, Plane, AlertCircle, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

const GoalCard = ({ goal, onClick, onQuickEdit, iconOptions }) => {
    const percentage = Math.round((goal.saved / Math.max(goal.target, 1)) * 100);

    // Helper for priority color/label
    const getPriorityBadge = (p) => {
        switch (Number(p)) {
            case 1: return <span className="text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase border border-red-200">Critical</span>;
            case 2: return <span className="text-[10px] font-extrabold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md uppercase border border-orange-200">High</span>;
            case 3: return <span className="text-[10px] font-extrabold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md uppercase border border-yellow-200">Medium</span>;
            case 4: return <span className="text-[10px] font-extrabold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase border border-blue-200">Low</span>;
            case 5: return <span className="text-[10px] font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase border border-gray-200">Minimal</span>;
            default: return null;
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between h-auto min-h-[340px] relative overflow-hidden group cursor-pointer"
        >
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${goal.color.split(' ')[0]} rounded-bl-full opacity-50 transition-transform group-hover:scale-110 pointer-events-none`} />

            {/* Top Section */}
            <div className="relative z-10 pointer-events-none">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${goal.color} shadow-inner`}>
                        {iconOptions[goal.iconIndex]?.component || <Target />}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {/* Priority Badge */}
                        {goal.priority && getPriorityBadge(goal.priority)}

                        {/* Completion Badge */}
                        {goal.status === 'achieved' && (
                            <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex flex-col items-end">
                                <div className="text-green-600 text-xs font-black flex items-center gap-1">
                                    <CheckCircle size={10} strokeWidth={3} /> COMPLETED
                                </div>
                                {goal.completedDate && (
                                    <span className="text-[10px] text-green-700 font-bold opacity-80">
                                        ON {new Date(goal.completedDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 max-w-[85%] leading-tight mb-2 line-clamp-2">{goal.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                    Target: <span className="font-semibold text-gray-900">₹{Number(goal.target).toLocaleString()}</span>
                </p>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 mt-auto pt-4">
                <div className="flex justify-between items-end mb-2">
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                        {/* Quick Edit Input */}
                        <div className="flex items-center gap-0.5">
                            <span className="text-2xl font-bold text-gray-900">₹</span>
                            <input
                                type="number"
                                defaultValue={goal.saved}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                                onBlur={(e) => {
                                    // Only trigger update if value changed to avoid unnecessary confetti/saves
                                    if (Number(e.target.value) !== Number(goal.saved)) {
                                        onQuickEdit(goal.id, e.target.value);
                                    }
                                }}
                                className="w-32 bg-transparent text-3xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none p-0 transition-all"
                            />
                        </div>
                        <span className="text-xs text-gray-400 font-medium block mt-1">SAVED (Click to edit)</span>
                    </div>
                    <span className="text-lg font-bold text-gray-400 pointer-events-none">{percentage}%</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner pointer-events-none">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>

                {/* Payment Method Indicator */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 font-medium pointer-events-none">
                    {goal.paymentMethod === 'emi' ? (
                        <div className="flex-1">
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 py-1.5 px-3 rounded-lg border border-blue-100/50 w-fit mb-1">
                                <CreditCard size={12} /> EMI: ₹{goal.installments.emi}/mo
                            </span>
                            {/* Next Payment Date / Recurrence Info (Optional) */}
                            {goal.recurrence?.type && (
                                <span className="text-[10px] text-gray-400 block ml-1">
                                    {goal.recurrence.type === 'monthly' ? `Due on ${goal.recurrence.day}th` : 'Custom Schedule'}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="flex items-center gap-1.5 bg-green-50 text-green-600 py-1.5 px-3 rounded-lg border border-green-100/50">
                            <DollarSign size={12} /> Full Payment
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoalCard;
