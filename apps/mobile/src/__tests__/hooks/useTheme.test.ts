// useTheme is a re-export from ThemeProvider
// Import it directly to exercise the re-export line
import { useTheme } from '@/hooks/useTheme';
import { useTheme as providerUseTheme } from '@/providers/ThemeProvider';

describe('useTheme', () => {
  it('re-exports useTheme from ThemeProvider', () => {
    expect(useTheme).toBe(providerUseTheme);
  });

  it('is a function', () => {
    expect(typeof useTheme).toBe('function');
  });
});
