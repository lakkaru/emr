import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1976d2' } },
  components: {
    MuiContainer: { defaultProps: { maxWidth: 'sm' } }
  }
});

export default function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
