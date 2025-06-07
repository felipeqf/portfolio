import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import { processImagePath } from './imageUtils';

/**
 * Create a configured Marked instance with syntax highlighting and custom image renderer
 * @param contentDir - The content directory for processing images
 * @param sectionType - The section type for organizing images
 * @returns Configured Marked instance
 */
export function createMarkedWithHighlight(contentDir: string, sectionType: string): Marked {
    // Custom renderer for images
    const renderer = {
        image(token: { href: string; title: string | null; text: string }) {
            const { href, title, text } = token;
            
            // Use the processImagePath function for consistent image processing
            const processedHref = processImagePath(href, contentDir, sectionType);
            const titleAttr = title ? ` title="${title}"` : '';
            return `<img src="${processedHref}" alt="${text}"${titleAttr}>`;
        }
    };

    // Setup marked with syntax highlighting and custom renderer
    const marked = new Marked(
        markedHighlight({
            langPrefix: 'hljs language-',
            highlight(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        })
    );

    marked.use({ renderer });
    
    return marked;
} 