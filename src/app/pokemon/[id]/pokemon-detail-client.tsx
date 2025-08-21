"use client";

import { ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { favoritesStorage } from "@/lib/favorites";
import { usePokemon } from "@/hooks/use-pokemon";
import { Header } from "@/components/header";
import { ErrorFallback } from "@/components/error-boundary";
import { PokemonCardSkeleton } from "@/components/loading-skeleton";

interface PokemonDetailClientProps {
  pokemonId: number;
}

export function PokemonDetailClient({ pokemonId }: PokemonDetailClientProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Update favorite state when pokemonId changes
  useEffect(() => {
    if (pokemonId) {
      setIsFavorite(favoritesStorage.isFavorite(pokemonId));
    }
  }, [pokemonId]);

  const { data: pokemon, isLoading, error } = usePokemon(pokemonId);

  const handleToggleFavorite = () => {
    if (!pokemon) return;

    const newFavoriteState = favoritesStorage.toggleFavorite({
      id: pokemon.id,
      name: pokemon.name,
    });

    setIsFavorite(newFavoriteState);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <PokemonCardSkeleton className="mx-auto max-w-2xl" />
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorFallback
            error={error || new Error("Failed to load Pokemon")}
            resetError={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "/pokemon-placeholder.png";

  const shinyImageUrl = pokemon.sprites.front_shiny || imageUrl;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm sm:text-base">Back to Explorer</span>
        </Link>

        {/* Pokémon Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
          <div>
            <h1 className="text-2xl font-bold capitalize text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
              {pokemon.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
              #{pokemon.id.toString().padStart(3, "0")}
            </p>
          </div>

          <button
            onClick={handleToggleFavorite}
            className="flex w-fit items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 sm:px-4"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors sm:h-5 sm:w-5",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-400"
              )}
            />
            <span className="text-xs sm:text-sm">
              {isFavorite ? "Favorited" : "Favorite"}
            </span>
          </button>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          {/* Left Column - Image and Types */}
          <div className="space-y-6">
            {/* Main Image Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <div className="flex justify-center">
                <div className="relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72">
                  <Image
                    src={imageUrl}
                    alt={pokemon.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
                    priority
                  />
                </div>
              </div>

              {/* Shiny Variant */}
              {shinyImageUrl !== imageUrl && (
                <div className="mt-4 text-center">
                  <p className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                    Shiny Variant
                  </p>
                  <div className="relative mx-auto h-12 w-12 sm:h-16 sm:w-16">
                    <Image
                      src={shinyImageUrl}
                      alt={`Shiny ${pokemon.name}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 48px, 64px"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Types Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-lg">
                Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={cn(
                      "inline-block rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm sm:px-4 sm:py-2 sm:text-sm",
                      getTypeColor(type.type.name)
                    )}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-lg">
                Basic Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                    Height:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white sm:text-base">
                    {pokemon.height / 10}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                    Weight:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white sm:text-base">
                    {pokemon.weight / 10}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                    Base Experience:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white sm:text-base">
                    {pokemon.base_experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Base Stats Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-lg">
                Base Stats
              </h3>
              <div className="space-y-4">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name}>
                    <div className="mb-2 flex justify-between text-xs sm:text-sm">
                      <span className="capitalize text-gray-600 dark:text-gray-400">
                        {stat.stat.name.replace("-", " ")}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stat.base_stat}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-lg">
                Abilities
              </h3>
              <div className="space-y-3">
                {pokemon.abilities.map((ability) => (
                  <div
                    key={ability.ability.name}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-600 sm:p-4"
                  >
                    <span className="text-sm capitalize text-gray-900 dark:text-white sm:text-base">
                      {ability.ability.name.replace("-", " ")}
                    </span>
                    {ability.is_hidden && (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Hidden
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
