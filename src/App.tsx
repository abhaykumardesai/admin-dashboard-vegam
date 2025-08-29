// src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from './pages/UsersPage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Create a client
const queryClient = new QueryClient();

// A basic theme for Material UI
const theme = createTheme({
  palette: {
    mode: 'dark', // A dark theme often looks good for dashboards
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalizes CSS for a consistent look */}
        <UsersPage />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;