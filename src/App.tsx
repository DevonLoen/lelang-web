import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { router } from './routes/index.route';
import { ToastProvider, useToast } from './contexts/toast-context';
import { ToastType } from './components/toaster';

function AppContent() {
  const { showToast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            showToast(error.message || 'Failed to fetch data', ToastType.ERROR);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            showToast(error.message || 'Action failed', ToastType.ERROR);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
