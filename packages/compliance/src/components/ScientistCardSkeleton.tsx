import { primitives } from '@curvenote/scms-core';

export function ScientistCardSkeleton() {
  return (
    <primitives.Card className="flex flex-col gap-4 p-6 shadow-sm bg-background">
      <div className="flex flex-col w-full gap-6 md:flex-row">
        {/* Left Section - Personal and Professional Details */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* Name and Title */}
            <div>
              <div className="mb-1 h-8 w-48 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
              <div className="h-5 w-64 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
            </div>

            {/* Contact and ID Information */}
            <div className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
                <div className="h-4 w-32 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
                <div className="h-4 w-40 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
                <div className="h-4 w-48 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
                <div className="h-4 w-36 rounded bg-stone-300 dark:bg-stone-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Compliance Status Skeleton */}
        <div className="flex flex-col items-center justify-center w-full md:w-auto md:min-w-[200px]">
          <div className="w-full space-y-2">
            <div className="h-6 w-32 rounded bg-stone-300 dark:bg-stone-600 animate-pulse mx-auto" />
            <div className="h-12 w-24 rounded bg-stone-300 dark:bg-stone-600 animate-pulse mx-auto" />
            <div className="h-4 w-40 rounded bg-stone-300 dark:bg-stone-600 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    </primitives.Card>
  );
}
