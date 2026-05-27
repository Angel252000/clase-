import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/**
 * Hook to use View Transitions API with React Router
 * Provides smooth page transitions with native browser API
 */
export function useViewTransition() {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      // Check if browser supports View Transitions API
      if (!document.startViewTransition) {
        // Fallback for unsupported browsers
        navigate(to, options);
        return;
      }

      // Start view transition
      document.startViewTransition(() => {
        navigate(to, options);
      });
    },
    [navigate]
  );

  return { navigate: navigateWithTransition, standardNavigate: navigate };
}

