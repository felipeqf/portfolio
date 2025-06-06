import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'forest' | 'ocean' |'sunset' | 'forest-dark' | 'ocean-dark' | 'sunset-dark';
export const availableThemes: Theme[] = ['light', 'dark', 'forest', 'ocean', 'sunset', 'forest-dark', 'ocean-dark', 'sunset-dark'];
const defaultTheme: Theme = 'light';

export const themeLoading = writable(true);

function isValidTheme(themeName: any): themeName is Theme {
    return typeof themeName === 'string' && availableThemes.includes(themeName as Theme);
}

// Helper function to get base theme name (without -dark suffix)
function getBaseTheme(themeName: Theme): string {
    if (themeName.endsWith('-dark')) {
        return themeName.slice(0, -5);
    }
    return themeName;
}

// Helper function to check if theme is dark variant
function isDarkTheme(themeName: Theme): boolean {
    return themeName === 'dark' || themeName.endsWith('-dark');
}

// Helper function to apply dark variant to base theme
function applyDarkVariant(baseTheme: string, shouldBeDark: boolean): Theme {
    if (baseTheme === 'light') {
        return shouldBeDark ? 'dark' : 'light';
    }
    return shouldBeDark ? `${baseTheme}-dark` as Theme : baseTheme as Theme;
}

export function initializeTheme(portfolioTheme: Theme): Theme {
    if (typeof window === 'undefined') return portfolioTheme;
    
    const savedTheme = localStorage.getItem('user-theme-preference');
    const savedBaseTheme = localStorage.getItem('portfolio-base-theme');
    
    const currentBaseTheme = getBaseTheme(portfolioTheme);
    
    if (savedTheme && savedBaseTheme) {
        // Check if portfolio base theme changed
        if (savedBaseTheme !== currentBaseTheme) {
            // Portfolio theme changed - apply new base theme but keep dark/light preference
            const wasDark = isDarkTheme(savedTheme as Theme);
            const newTheme = applyDarkVariant(currentBaseTheme, wasDark);
            
            // Update localStorage with new base theme
            localStorage.setItem('portfolio-base-theme', currentBaseTheme);
            localStorage.setItem('user-theme-preference', newTheme);
            
            return newTheme;
        } else {
            // Portfolio theme hasn't changed - use saved preference
            return savedTheme as Theme;
        }
    } else {
        // First time visit - save initial values
        localStorage.setItem('portfolio-base-theme', currentBaseTheme);
        localStorage.setItem('user-theme-preference', portfolioTheme);
        return portfolioTheme;
    }
}

// Update theme store creation
function createThemeStore() {
    // Start with the theme that should already be applied by the blocking script
    const initialTheme = browser ? 
        (localStorage.getItem('user-theme-preference') as Theme || 'light') : 
        'light';
    
    const { subscribe, set, update } = writable<Theme>(initialTheme);
    
    return {
        subscribe,
        set: (value: Theme) => {
            if (browser) {
                localStorage.setItem('user-theme-preference', value);
                localStorage.setItem('portfolio-base-theme', getBaseTheme(value));
                
                // Update DOM classes - add null checks
                if (document.documentElement && document.body) {
                    availableThemes.forEach(t => {
                        document.documentElement.classList.remove(`theme-${t}`);
                        document.body.classList.remove(`theme-${t}`);
                    });
                    document.documentElement.classList.add(`theme-${value}`);
                    document.body.classList.add(`theme-${value}`);
                }
            }
            set(value);
        },
        update,
        init: (portfolioTheme: Theme) => {
            // Theme should already be applied by blocking script
            // Just sync the store with what's already applied
            const currentTheme = browser ? 
                (localStorage.getItem('user-theme-preference') as Theme || portfolioTheme) : 
                portfolioTheme;
            set(currentTheme);
            themeLoading.set(false);
        }
    };
}

export const theme = createThemeStore();

export function getThemeToggle(currentTheme: Theme): Theme {
    // Handle the basic light/dark toggle
    if (currentTheme === 'light') return 'dark';
    if (currentTheme === 'dark') return 'light';
    
    // Handle themed variants
    if (currentTheme.endsWith('-dark')) {
        // Remove '-dark' suffix to get light variant
        return currentTheme.slice(0, -5) as Theme;
    } else {
        // Add '-dark' suffix to get dark variant
        return `${currentTheme}-dark` as Theme;
    }
}