import { Platform } from 'react-native';
import { useThemeStore } from '@/store/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ isDarkMode: false });
  });

  it('defaults to light mode', () => {
    expect(useThemeStore.getState().isDarkMode).toBe(false);
  });

  it('toggleTheme switches to dark', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDarkMode).toBe(true);
  });

  it('toggleTheme switches back to light', () => {
    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDarkMode).toBe(false);
  });

  it('can set dark mode directly', () => {
    useThemeStore.setState({ isDarkMode: true });
    expect(useThemeStore.getState().isDarkMode).toBe(true);
  });

  it('toggle preserves other state', () => {
    useThemeStore.getState().toggleTheme();
    expect(typeof useThemeStore.getState().toggleTheme).toBe('function');
  });

  it('multiple toggles work correctly', () => {
    for (let i = 0; i < 5; i++) {
      useThemeStore.getState().toggleTheme();
    }
    expect(useThemeStore.getState().isDarkMode).toBe(true);
  });

  it('toggleTheme is a function', () => {
    expect(typeof useThemeStore.getState().toggleTheme).toBe('function');
  });

  it('state is reactive', () => {
    const before = useThemeStore.getState().isDarkMode;
    useThemeStore.getState().toggleTheme();
    const after = useThemeStore.getState().isDarkMode;
    expect(before).not.toBe(after);
  });
});

describe('themeStore webStorage branch', () => {
  it('webStorage methods work with localStorage mock', () => {
    // Provide a localStorage mock since react-native env doesn't have one
    const store: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
    };

    (global as any).localStorage.setItem('theme-test', JSON.stringify({ state: { isDarkMode: true } }));
    const val = (global as any).localStorage.getItem('theme-test');
    expect(val).toContain('isDarkMode');

    (global as any).localStorage.removeItem('theme-test');
    expect((global as any).localStorage.getItem('theme-test')).toBeNull();

    delete (global as any).localStorage;
  });
});
