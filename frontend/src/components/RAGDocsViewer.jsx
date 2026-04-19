'use client';

import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const FileNode = ({ node, level = 0, folderPath }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (node.type === 'folder') {
        return (
            <div className="select-none mb-1">
                <div
                    className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors text-gray-700"
                    style={{ paddingLeft: `${level * 16 + 8}px`, paddingRight: '12px' }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="text-gray-400 w-4 flex justify-center shrink-0">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <Folder size={18} className="text-blue-500 fill-blue-100/50 shrink-0" />
                    <span className="text-sm font-bold truncate">{node.name}</span>
                </div>
                {isOpen && node.children && (
                    <div className="mt-1 border-l-2 border-gray-100 ml-4">
                        {node.children.map((child, i) => (
                            <FileNode key={i} node={child} level={level + 1} folderPath={folderPath} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // It's a file
    return (
        <a
            href={`/api/rag-docs/download?path=${encodeURIComponent(node.path)}&baseDir=${encodeURIComponent(folderPath)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors text-gray-600 group mb-1"
            style={{ paddingLeft: `${level * 16 + 8 + 24}px`, paddingRight: '12px' }}
        >
            <FileText size={16} className="text-emerald-500 shrink-0" />
            <span className="text-sm font-medium truncate flex-1 group-hover:text-blue-700 transition-colors">{node.name}</span>
            <span className="text-xs text-gray-400 font-mono group-hover:hidden whitespace-nowrap">{(node.size / 1024).toFixed(1)} KB</span>
            <ExternalLink size={14} className="text-blue-500 hidden group-hover:block transition-opacity shrink-0" />
        </a>
    );
};

export default function RAGDocsViewer({ folderPath }) {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!folderPath) return;
        setLoading(true);
        fetch(`/api/rag-docs?baseDir=${encodeURIComponent(folderPath)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTree(data.tree);
                } else {
                    setError(data.error || 'Failed to load documents');
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [folderPath]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed">
                <Loader2 size={24} className="animate-spin mb-3 text-blue-500" />
                <span className="text-sm font-bold">Scanning Document Tree...</span>
                <p className="text-xs mt-1 text-gray-400">Reading external RAG directories securely</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-sm">Connection Failed</h4>
                    <p className="text-xs mt-1 leading-relaxed">Ensure the external <code className="bg-red-100 font-mono px-1 rounded">{folderPath}</code> directory exists and is accessible. Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!tree || tree.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed">
                <Folder size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-600">No Documents Found</p>
                <p className="text-xs text-gray-400 mt-1">The external <code className="bg-gray-200 px-1 rounded text-gray-700 font-mono">{folderPath}</code> folder is completely empty.</p>
            </div>
        );
    }

    return (
        <div
            data-lenis-prevent="true"
            className="bg-white border border-gray-200 rounded-xl p-3 max-h-[400px] overflow-y-auto overscroll-contain custom-scrollbar shadow-sm"
        >
            {tree.map((node, i) => (
                <FileNode key={i} node={node} folderPath={folderPath} />
            ))}
        </div>
    );
}
