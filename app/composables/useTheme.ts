export const useTheme = () => {
    const theme = useCookie('theme', { default: () => 'system' });

    const applyTheme = (value: string) => {
        if (value === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', value);
        }
    };

    const setTheme = (value: 'light' | 'dark' | 'system') => {
        theme.value = value;
        applyTheme(value);
    };

    return { theme, setTheme, applyTheme };
};
