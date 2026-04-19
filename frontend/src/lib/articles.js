import fs from 'fs';
import path from 'path';

// Files are located in src/contents
const contentDirectory = path.join(process.cwd(), 'src/contents');

export function getArticles() {
    try {
        // Check if directory exists
        if (!fs.existsSync(contentDirectory)) return [];

        const fileNames = fs.readdirSync(contentDirectory);

        // Filter only .md files
        const allArticlesData = fileNames
            .filter(fileName => fileName.endsWith('.md'))
            .map((fileName) => {
                // Remove ".md" from file name to get id
                const id = fileName.replace(/\.md$/, '');

                // Read markdown file as string
                const fullPath = path.join(contentDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, 'utf8');

                // Extract Title (H1) and Description (First paragraph)
                const titleMatch = fileContents.match(/^# (.*)/m);
                const title = titleMatch ? titleMatch[1] : "Untitled Article";

                const descMatch = fileContents.split('\n').find(line =>
                    line.trim().length > 0 && !line.trim().startsWith('#')
                );
                const description = descMatch ? descMatch.slice(0, 100) + "..." : "Click to read more.";

                // Construct Image Path (Assumes .png exists in public/contents with same basename)
                const imagePath = path.join(process.cwd(), 'public', 'contents', `${id}.png`);
                const image = fs.existsSync(imagePath) ? `/contents/${id}.png` : null;

                return {
                    id,
                    title,
                    description,
                    image,
                    section: 'Financial Wisdom',
                    category: 'Investing',
                    views: Math.floor(Math.random() * 500) + 100,
                    fullContent: fileContents,
                };
            });

        return allArticlesData;
    } catch (error) {
        console.error("Error reading articles:", error);
        return [];
    }
}
