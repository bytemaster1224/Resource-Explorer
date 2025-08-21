"use client";

import { useMemo, useState, Suspense, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Search } from "@/components/search";
import { Select, FavoritesToggle, SortToggle } from "@/components/filters";
import { PokemonCard } from "@/components/pokemon-card";
import {
  PokemonGridSkeleton,
  SearchSkeleton,
  FilterSkeleton,
} from "@/components/loading-skeleton";
import { ErrorFallback } from "@/components/error-boundary";
import { useURLState } from "@/hooks/use-url-state";
import {
  usePokemonList,
  usePokemonSearch,
  usePokemonTypes,
  usePokemonByType,
} from "@/hooks/use-pokemon";
import { favoritesStorage } from "@/lib/favorites";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

function HomePageContent() {
  const {
    state,
    setSearch,
    setType,
    setSort,
    setFavorites,
    setPage,
    updateState,
  } = useURLState();
  const [favorites, setFavoritesState] = useState(() =>
    favoritesStorage.getFavorites()
  );

  // Update favorites when they change (for reactivity)
  useEffect(() => {
    const handleStorageChange = () => {
      setFavoritesState(favoritesStorage.getFavorites());
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check for changes on focus (for same-tab updates)
    const handleFocus = () => {
      setFavoritesState(favoritesStorage.getFavorites());
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Fetch data based on current state
  const {
    data: pokemonList,
    isLoading: isLoadingList,
    error: listError,
  } = usePokemonList((state.page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE);

  // Search results (only fetch if search query exists and is >= 2 characters)
  const { data: searchResults, isLoading: isLoadingSearch } = usePokemonSearch(
    state.search
  );

  // Type filtering results (only fetch if type is selected)
  const { data: typeResults, isLoading: isLoadingType } = usePokemonByType(
    state.type
  );

  const { data: typesData, isLoading: isLoadingTypes } = usePokemonTypes();

  const scrollRestored = useRef(false);

  // Determine which data to use based on current filters
  const currentData = useMemo(() => {
    if (state.search && state.search.length >= 2) {
      return searchResults;
    } else if (state.type) {
      // Convert type results to the same format as other endpoints
      if (typeResults) {
        return {
          count: typeResults.pokemon.length,
          next: null,
          previous: null,
          results: typeResults.pokemon.map((p) => ({
            name: p.pokemon.name,
            url: p.pokemon.url,
          })),
        };
      }
    }
    return pokemonList;
  }, [state.search, state.type, searchResults, typeResults, pokemonList]);

  // Determine loading state
  const isLoading = useMemo(() => {
    if (state.search && state.search.length >= 2) {
      return isLoadingSearch;
    } else if (state.type) {
      return isLoadingType;
    }
    return isLoadingList;
  }, [state.search, state.type, isLoadingSearch, isLoadingType, isLoadingList]);

  const error = listError;

  // Filter and sort Pokémon
  const filteredAndSortedPokemon = useMemo(() => {
    let pokemon: Array<{ name: string; url: string }> = [];

    if (state.favorites && !state.search && !state.type) {
      // When only favorites are selected, use all favorites from storage
      pokemon = favorites.map((fav) => ({
        name: fav.name,
        url: `https://pokeapi.co/api/v2/pokemon/${fav.id}/`,
      }));
    } else {
      if (!currentData?.results) return [];
      pokemon = [...currentData.results];

      // Filter by favorites when combined with other filters
      if (state.favorites) {
        const favoriteIds = new Set(favorites.map((fav) => fav.id));
        pokemon = pokemon.filter((p) =>
          favoriteIds.has(extractIdFromUrl(p.url))
        );
      }
    }

    // Sort
    pokemon.sort((a, b) => {
      const aId = extractIdFromUrl(a.url);
      const bId = extractIdFromUrl(b.url);

      if (state.sort === "name") {
        return a.name.localeCompare(b.name);
      }
      return aId - bId;
    });

    return pokemon;
  }, [
    currentData,
    state.favorites,
    state.search,
    state.type,
    state.sort,
    favorites,
  ]);

  // Paginate filtered results when client-side pagination is needed
  const paginatedPokemon = useMemo(() => {
    if (state.search || state.type || state.favorites) {
      const start = (state.page - 1) * ITEMS_PER_PAGE;
      return filteredAndSortedPokemon.slice(start, start + ITEMS_PER_PAGE);
    }
    // When no filters are active, API already returns the correct page
    return filteredAndSortedPokemon;
  }, [
    filteredAndSortedPokemon,
    state.page,
    state.search,
    state.type,
    state.favorites,
  ]);

  useEffect(() => {
    if (scrollRestored.current) return;
    const stored = sessionStorage.getItem("pokemon-list-scroll");
    if (!stored || paginatedPokemon.length === 0) return;
    try {
      const { scrollY, focusId, page } = JSON.parse(stored);
      if (page && page !== state.page) {
        updateState({ page }, false);
        return;
      }
      window.scrollTo(0, scrollY);
      const el = document.getElementById(`pokemon-card-${focusId}`);
      if (el) {
        el.focus();
      }
    } catch {}
    sessionStorage.removeItem("pokemon-list-scroll");
    scrollRestored.current = true;
  }, [paginatedPokemon, state.page, updateState]);

  // Type options for filter
  const typeOptions = useMemo(() => {
    if (!typesData?.results) return [];

    return [
      { value: "", label: "All Types" },
      ...typesData.results.map((type) => ({
        value: type.name,
        label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
      })),
    ];
  }, [typesData]);

  // Handle pagination
  const totalPages = useMemo(() => {
    if (state.search || state.type || state.favorites) {
      return Math.ceil(filteredAndSortedPokemon.length / ITEMS_PER_PAGE) || 1;
    }
    return Math.ceil((currentData?.count || 0) / ITEMS_PER_PAGE);
  }, [
    state.search,
    state.type,
    state.favorites,
    filteredAndSortedPokemon.length,
    currentData?.count,
  ]);

  const hasNextPage = state.page < totalPages;
  const hasPrevPage = state.page > 1;

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetError={() => window.location.reload()}
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            Pokémon Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover and explore Pokémon with advanced search and filtering
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          {isLoadingTypes ? (
            <SearchSkeleton />
          ) : (
            <Search
              value={state.search}
              onChange={setSearch}
              placeholder="Search Pokémon by name..."
              className="max-w-md"
            />
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {isLoadingTypes ? (
              <FilterSkeleton />
            ) : (
              <>
                <Select
                  value={state.type}
                  onChange={setType}
                  options={typeOptions}
                  placeholder="Filter by type"
                  className="w-40"
                />
                <FavoritesToggle
                  value={state.favorites}
                  onChange={setFavorites}
                />
                <SortToggle value={state.sort} onChange={setSort} />
              </>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : (
            <span>
              Showing {paginatedPokemon.length} of{" "}
              {state.search || state.type || state.favorites
                ? filteredAndSortedPokemon.length
                : currentData?.count || 0}{" "}
              Pokémon
              {state.favorites && ` (${favorites.length} favorites)`}
              {state.search && ` matching "${state.search}"`}
              {state.type && ` of type "${state.type}"`}
            </span>
          )}
        </div>

        {/* Pokémon Grid */}
        {isLoading ? (
          <PokemonGridSkeleton />
        ) : filteredAndSortedPokemon.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Pokémon found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {state.search
                ? `No Pokémon match "${state.search}"`
                : state.type
                ? `No Pokémon found for type "${state.type}"`
                : state.favorites
                ? "No favorites yet. Add some Pokémon to your favorites!"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                pokemonId={extractIdFromUrl(pokemon.url)}
                pokemonName={pokemon.name}
                currentPage={state.page}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage(state.page - 1)}
                disabled={!hasPrevPage}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  hasPrevPage
                    ? "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                )}
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {state.page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(state.page + 1)}
                disabled={!hasNextPage}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  hasNextPage
                    ? "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                )}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<PokemonGridSkeleton />}>
      <HomePageContent
        key={typeof window !== "undefined" ? window.location.search : ""}
      />
    </Suspense>
  );
}

// Helper function to extract ID from PokéAPI URL
function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : 0;
}
