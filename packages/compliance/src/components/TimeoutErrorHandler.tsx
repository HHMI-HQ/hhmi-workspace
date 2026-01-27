import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ui } from '@curvenote/scms-core';

interface TimeoutErrorHandlerProps {
  promise: Promise<any>;
  onError?: (error: Error) => void;
  children: (props: {
    error: Error | null;
    isRetrying: boolean;
    retry: () => void;
  }) => React.ReactNode;
}

/**
 * Handles timeout errors from promises and provides retry functionality.
 * Catches "Server Timeout" errors and allows users to retry by reloading the page.
 */
export function TimeoutErrorHandler({ promise, onError, children }: TimeoutErrorHandlerProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    promise
      .then(() => {
        if (isMounted) {
          setError(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;

        const isTimeoutError =
          err instanceof Error &&
          (err.message.includes('Server Timeout') ||
            err.message.includes('timeout') ||
            err.message.includes('Timeout'));

        if (isTimeoutError) {
          setError(err);
          onError?.(err);
        } else {
          // Re-throw non-timeout errors so they can be handled elsewhere
          throw err;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [promise, onError]);

  const retry = useCallback(() => {
    setIsRetrying(true);
    // Reload the page to retry the request
    window.location.reload();
  }, []);

  return <>{children({ error, isRetrying, retry })}</>;
}

/**
 * Component that displays a timeout error with a retry button.
 */
export function TimeoutErrorDisplay({
  error,
  isRetrying,
  onRetry,
}: {
  error: Error | null;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  if (!error) return null;

  return (
    <div className="p-4 mb-6 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20">
      <div className="text-yellow-700 dark:text-yellow-400">
        <h3 className="mb-2 font-semibold">Server Timeout</h3>
        <p className="mb-4">
          The request took too long to complete. This may be due to a slow connection or high server
          load.
        </p>
        <ui.Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700"
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </ui.Button>
      </div>
    </div>
  );
}
