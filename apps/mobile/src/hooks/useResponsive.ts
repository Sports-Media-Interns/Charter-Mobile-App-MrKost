import { useWindowDimensions } from 'react-native';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= BREAKPOINTS.xl
      ? 'xl'
      : width >= BREAKPOINTS.lg
        ? 'lg'
        : width >= BREAKPOINTS.md
          ? 'md'
          : 'sm';

  return {
    width,
    height,
    breakpoint,
    isSmall: width < BREAKPOINTS.md,
    isMedium: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isLarge: width >= BREAKPOINTS.lg,
    isTablet: width >= BREAKPOINTS.md,
    isLandscape: width > height,
    columns: width >= BREAKPOINTS.lg ? 3 : width >= BREAKPOINTS.md ? 2 : 1,
  };
}
