"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";

export interface URLState {
  page: number;
  search: string;
  type: string;
  sort: "name" | "id";
  favorites: boolean;
}

export function useURLState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const state = useMemo(
    (): URLState => ({
      page: parseInt(searchParams.get("page") || "1"),
      search: searchParams.get("search") || "",
      type: searchParams.get("type") || "",
      sort: (searchParams.get("sort") as "name" | "id") || "id",
      favorites: searchParams.get("favorites") === "true",
    }),
    [searchParams]
  );

  const updateState = useCallback(
    (updates: Partial<URLState>, immediate = true) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === false || value === 0) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      // Reset page when changing filters (except for page changes)
      if (
        (updates.search !== undefined ||
          updates.type !== undefined ||
          updates.favorites !== undefined) &&
        !updates.page
      ) {
        newSearchParams.delete("page");
      }

      const newURL = `?${newSearchParams.toString()}`;

      if (immediate) {
        router.push(newURL, { scroll: false });
      } else {
        router.replace(newURL, { scroll: false });
      }
    },
    [router, searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      updateState({ page });
    },
    [updateState]
  );

  const setSearch = useCallback(
    (search: string) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new timeout for debounced search
      debounceTimeoutRef.current = setTimeout(() => {
        updateState({ search });
      }, 500); // 500ms debounce
    },
    [updateState]
  );

  const setType = useCallback(
    (type: string) => {
      updateState({ type });
    },
    [updateState]
  );

  const setSort = useCallback(
    (sort: "name" | "id") => {
      updateState({ sort });
    },
    [updateState]
  );

  const setFavorites = useCallback(
    (favorites: boolean) => {
      updateState({ favorites });
    },
    [updateState]
  );

  return {
    state,
    setPage,
    setSearch,
    setType,
    setSort,
    setFavorites,
    updateState,
  };
}
