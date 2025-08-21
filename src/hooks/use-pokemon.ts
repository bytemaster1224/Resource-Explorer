import { useQuery } from "@tanstack/react-query";
import { pokemonApi } from "@/lib/api";

export function usePokemonList(offset: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: ["pokemon-list", offset, limit],
    queryFn: ({ signal }) => pokemonApi.getPokemonList(offset, limit, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePokemon(idOrName: string | number) {
  return useQuery({
    queryKey: ["pokemon", idOrName],
    queryFn: ({ signal }) => pokemonApi.getPokemon(idOrName, signal),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!idOrName,
  });
}

export function usePokemonSearch(query: string) {
  return useQuery({
    queryKey: ["pokemon-search", query],
    queryFn: ({ signal }) => pokemonApi.searchPokemon(query, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: query.length >= 2,
    placeholderData: (previousData) => previousData,
  });
}

export function usePokemonTypes() {
  return useQuery({
    queryKey: ["pokemon-types"],
    queryFn: ({ signal }) => pokemonApi.getPokemonTypes(signal),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function usePokemonByType(type: string) {
  return useQuery({
    queryKey: ["pokemon-by-type", type],
    queryFn: ({ signal }) => pokemonApi.getPokemonByType(type, signal),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!type,
  });
}
