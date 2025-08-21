import { cn } from "@/lib/utils";

interface PokemonCardSkeletonProps {
  className?: string;
}

export function PokemonCardSkeleton({ className }: PokemonCardSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="mx-auto mb-4 h-32 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />

      {/* Text skeletons */}
      <div className="space-y-2 text-center">
        <div className="mx-auto h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mx-auto h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-center space-x-1">
          <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export function PokemonGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700">
      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600" />
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="flex animate-pulse space-x-2">
      <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-9 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
