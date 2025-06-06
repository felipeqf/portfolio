import { basename, join } from 'path';
import { existsSync, copyFileSync, mkdirSync } from 'fs';

/**
 * Process and copy images from content directory to static folder
 * @param imagePath - The image path from markdown frontmatter
 * @param contentDir - The source content directory containing the image
 * @param sectionType - The section type for organizing static images
 * @returns The processed static URL path
 */
export function processImagePath(imagePath: string, contentDir: string, sectionType: string): string {
    if (!imagePath) return '';
    
    // If already absolute (starts with / or http), return as is
    if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
        return imagePath;
    }
    
    try {
        // Automatically prepend "images/" if not already present
        const imagePathWithFolder = imagePath.startsWith('images/') 
            ? imagePath 
            : `images/${imagePath}`;
        
        // Construct the path to the actual image in content directory
        const sourceImagePath = join(contentDir, imagePathWithFolder);
        
        // Create static path where we'll copy the image
        const staticImageDir = join(process.cwd(), 'static', 'content', sectionType);
        const staticImagePath = join(staticImageDir, basename(imagePath));
        
        // Ensure static directory exists
        mkdirSync(staticImageDir, { recursive: true });
        
        // Copy image to static folder if it exists
        if (existsSync(sourceImagePath)) {
            copyFileSync(sourceImagePath, staticImagePath);
        }
        
        // Return the static URL using just the filename
        return `/content/${sectionType}/${basename(imagePath)}`;
    } catch (e) {
        console.warn(`Could not process image ${imagePath}:`, e);
        // Fallback to original path with leading slash
        return `/${imagePath}`;
    }
} 