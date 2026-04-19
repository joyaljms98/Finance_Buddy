import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    try {
        let baseDir = searchParams.get('baseDir');
        if (!baseDir) {
            baseDir = path.join(process.cwd(), '..', 'RAG_Docs');
        }

        // Prevent path traversal outside of the configured RAG directory
        const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
        const absolutePath = path.join(baseDir, normalizedPath);

        // Normalize baseDir to ensure exact string matching for traversal prevention
        const normalizedBaseDir = path.normalize(baseDir);
        if (!absolutePath.startsWith(normalizedBaseDir)) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
        }

        if (!fs.existsSync(absolutePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const stats = fs.statSync(absolutePath);
        if (stats.isDirectory()) {
            return NextResponse.json({ error: 'Cannot download a directory' }, { status: 400 });
        }

        const fileBuffer = fs.readFileSync(absolutePath);

        // Determine content type based on extension
        const ext = path.extname(absolutePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.txt' || ext === '.md' || ext === '.csv') contentType = 'text/plain';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

        // Return file directly to browser so it can be viewed in a new tab inline
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${path.basename(absolutePath)}"`,
                'Content-Length': stats.size.toString(),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
