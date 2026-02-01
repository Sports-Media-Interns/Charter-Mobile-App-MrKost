import { renderHook } from '@testing-library/react-native';
import { useResponsive } from '@/hooks/useResponsive';

// Mock useWindowDimensions at the module level
let mockWidth = 400;
let mockHeight = 800;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: mockHeight, scale: 1, fontScale: 1 }),
}));

describe('useResponsive', () => {
  function setDimensions(width: number, height: number) {
    mockWidth = width;
    mockHeight = height;
  }

  it('returns sm breakpoint for small screens', () => {
    setDimensions(375, 812);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.breakpoint).toBe('sm');
  });

  it('returns md breakpoint for medium screens', () => {
    setDimensions(768, 1024);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.breakpoint).toBe('md');
  });

  it('returns lg breakpoint for large screens', () => {
    setDimensions(1024, 768);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.breakpoint).toBe('lg');
  });

  it('returns xl breakpoint for extra large screens', () => {
    setDimensions(1440, 900);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.breakpoint).toBe('xl');
  });

  it('isSmall is true for small screens', () => {
    setDimensions(375, 812);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isSmall).toBe(true);
    expect(result.current.isLarge).toBe(false);
  });

  it('isTablet is true at md breakpoint', () => {
    setDimensions(768, 1024);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isTablet).toBe(true);
  });

  it('isLandscape when width > height', () => {
    setDimensions(1024, 768);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isLandscape).toBe(true);
  });

  it('returns 1 column for small', () => {
    setDimensions(375, 812);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.columns).toBe(1);
  });

  it('returns 2 columns for medium', () => {
    setDimensions(768, 1024);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.columns).toBe(2);
  });

  it('returns 3 columns for large', () => {
    setDimensions(1024, 768);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.columns).toBe(3);
  });
});
