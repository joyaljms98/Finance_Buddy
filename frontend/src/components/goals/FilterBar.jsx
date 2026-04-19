import React from 'react';
import { Filter, ArrowUp, ArrowDown, Search, X } from 'lucide-react';

const FilterBar = ({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    groupBy,
    setGroupBy
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4">

            {/* Search */}
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search goals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">

                {/* Sort By */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl text-sm">
                    <span className="text-gray-400 font-bold text-xs uppercase mr-1">Sort</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="createdDate">Date Created</option>
                        <option value="targetDate">Target Date</option>
                        <option value="priority">Priority</option>
                        <option value="saved">Saved Amount</option>
                        <option value="completedDate">Completion Date</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-1 hover:bg-white rounded-lg transition-colors ml-1"
                    >
                        {sortOrder === 'asc' ? <ArrowUp size={14} className="text-blue-600" /> : <ArrowDown size={14} className="text-blue-600" />}
                    </button>
                </div>

                {/* Group By */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl text-sm border-l border-gray-200 ml-2 pl-4">
                    <span className="text-gray-400 font-bold text-xs uppercase mr-1">Group</span>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="none">None</option>
                        <option value="priority">Priority</option>
                        <option value="status">Status</option>
                        <option value="icon">Category</option>
                    </select>
                </div>

            </div>
        </div>
    );
};

export default FilterBar;
