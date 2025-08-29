import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * Starts the Mock Service Worker to intercept API calls in development.
 * This function is critical for local-first development, allowing the UI
 * to be built and tested without a live backend.
 */
async function enableMocking() {
  // This environment variable is set by Vite.
  // We only want to enable mocking in development.
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Dynamically import the MSW worker setup.
  const { worker } = await import('./mocks/browser');

  // Start the worker. The `onUnhandledRequest: 'bypass'` option allows
  // requests for assets (like CSS, images) to pass through without warnings.
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

// Start the mocking, and only when it's ready, render the React app.
// This ensures that any API calls made on the initial render are intercepted.
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
