import { type ComponentType, type ReactNode, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

export function lazyPage(loader: () => Promise<{ default: ComponentType }>) {
  return lazy(loader);
}

export function withRouteSuspense(children: ReactNode) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            Loading page...
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
