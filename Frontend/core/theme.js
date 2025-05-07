import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  roundness: 0,
  colors: {
    ...DefaultTheme.colors,
    text: '#1B3B1A',        // Dark green for text
    primary: '#2E7D32',     // Main green shade (Primary)
    secondary: '#66BB6A',   // Light green for secondary
    error: '#D32F2F',       // Keeping error as red for clarity
  },
};
