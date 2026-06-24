import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { router } from './routes/index.route';
import { ToastProvider, useToast } from './contexts/toast-context';
import { ToastType } from './enums/toast-type';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

function AppContent() {
  const { showToast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            showToast(getErrorMessage(error, 'Failed to fetch data'), ToastType.ERROR);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            showToast(getErrorMessage(error, 'Action failed'), ToastType.ERROR);
          },
        }),
      }),
  );

  useEffect(() => {
    const handleFcmMessage = (event: Event) => {
      const { title, body, targetPath } = (event as CustomEvent<{
        title?: string;
        body?: string;
        targetPath?: string | null;
      }>).detail ?? {};

      showToast(`${title || 'Lelang'}: ${body || 'Ada notifikasi baru.'}`, ToastType.INFO, {
        duration: 7000,
        onClick: targetPath ? () => router.navigate(targetPath) : undefined,
      });
    };

    window.addEventListener('fcm-message', handleFcmMessage);
    return () => window.removeEventListener('fcm-message', handleFcmMessage);
  }, [showToast]);

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
