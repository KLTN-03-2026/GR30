"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider: wrap toàn bộ app với React Query client.
 * Phải là "use client" vì QueryClientProvider là client component.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState để mỗi request không chia sẻ cùng client (Next.js SSR safety)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 phút
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
