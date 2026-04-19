import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function getDirectoryTree(dirPath, basePath = '') {
    const isExists = fs.existsSync(dirPath);
    if (!isExists) return [];

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) return null;

    const files = fs.readdirSync(dirPath);
    return files.map(file => {
        const fullPath = path.join(dirPath, file);
        const relPath = path.join(basePath, file).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            return {
                name: file,
                type: 'folder',
                path: relPath,
                children: getDirectoryTree(fullPath, relPath)
            };
        } else {
            return {
                name: file,
                type: 'file',
                path: relPath,
                size: stat.size
            };
        }
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let baseDir = searchParams.get('baseDir');

        if (!baseDir) {
            baseDir = path.join(process.cwd(), '..', 'RAG_Docs');
        }

        const tree = getDirectoryTree(baseDir);
        return NextResponse.json({ success: true, tree });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
