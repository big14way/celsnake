export const colors = {
  // Primary Colors
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#6366F1',

  // Secondary Colors
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  // Game Colors
  snakeHead: '#10B981',
  snakeBody: '#34D399',
  food: '#EF4444',
  grid: '#1F2937',
  gridBorder: '#374151',

  // UI Colors
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',
  border: '#4B5563',

  // Text Colors
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textDisabled: '#9CA3AF',

  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};
