"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { favoritesStorage } from "@/lib/favorites";
import { usePokemon } from "@/hooks/use-pokemon";
import { PokemonCardSkeleton } from "./loading-skeleton";

interface PokemonCardProps {
  pokemonId: number;
  pokemonName: string;
  className?: string;
  currentPage: number;
}

export function PokemonCard({
  pokemonId,
  pokemonName,
  className,
  currentPage,
}: PokemonCardProps) {
  const [isFavorite, setIsFavorite] = useState(() =>
    favoritesStorage.isFavorite(pokemonId)
  );

  const { data: pokemon, isLoading, error } = usePokemon(pokemonId);

  // Update favorite state when it changes
  useEffect(() => {
    const checkFavorite = () => {
      setIsFavorite(favoritesStorage.isFavorite(pokemonId));
    };

    // Check on mount and when storage changes
    checkFavorite();

    const handleStorageChange = () => {
      checkFavorite();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check on focus for same-tab updates
    const handleFocus = () => {
      checkFavorite();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [pokemonId]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newFavoriteState = favoritesStorage.toggleFavorite({
      id: pokemonId,
      name: pokemonName,
    });

    setIsFavorite(newFavoriteState);
  };
  const handleNavigate = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "pokemon-list-scroll",
        JSON.stringify({
          scrollY: window.scrollY,
          focusId: pokemonId,
          page: currentPage,
        })
      );
    }
  };

  if (isLoading) {
    return <PokemonCardSkeleton className={className} />;
  }

  if (error || !pokemon) {
    return (
      <div
        className={cn(
          "rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20",
          className
        )}
      >
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load {pokemonName}
        </p>
      </div>
    );
  }

  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "/pokemon-placeholder.png";

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600",
        className
      )}
      id={`pokemon-card-${pokemon.id}`}
      onClick={handleNavigate}
      scroll={false}
    >
      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-400 group-hover:text-red-400"
          )}
        />
      </button>

      {/* Pokémon Image */}
      <div className="relative mx-auto mb-4 h-32 w-32">
        <Image
          src={imageUrl}
          alt={pokemon.name}
          fill
          className="object-contain"
          sizes="128px"
          priority={pokemon.id <= 20} // Prioritize first 20 Pokémon
        />
      </div>

      {/* Pokémon Info */}
      <div className="text-center">
        <h3 className="mb-1 text-lg font-semibold capitalize text-gray-900 dark:text-white">
          {pokemon.name}
        </h3>
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          #{pokemon.id.toString().padStart(3, "0")}
        </p>

        {/* Types */}
        <div className="flex justify-center space-x-1">
          {pokemon.types.map((type) => (
            <span
              key={type.type.name}
              className={cn(
                "inline-block rounded-full px-2 py-1 text-xs font-medium text-white",
                getTypeColor(type.type.name)
              )}
            >
              {type.type.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// Type color mapping
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: "bg-gray-500",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-500",
    grass: "bg-green-500",
    ice: "bg-cyan-400",
    fighting: "bg-red-700",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-400",
    psychic: "bg-pink-500",
    bug: "bg-green-600",
    rock: "bg-yellow-800",
    ghost: "bg-purple-700",
    dragon: "bg-indigo-700",
    dark: "bg-gray-800",
    steel: "bg-gray-600",
    fairy: "bg-pink-300",
  };

  return colors[type] || "bg-gray-500";
}
