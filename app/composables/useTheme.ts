export const useTheme = () => {
    const theme = useCookie('theme', { default: () => 'system' });

    const applyTheme = (value: string) => {
        const isDark =
            value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    const setTheme = (value: 'light' | 'dark' | 'system') => {
        theme.value = value;
        applyTheme(value);
    };

    return { theme, setTheme, applyTheme };
};
