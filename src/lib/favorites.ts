const FAVORITES_KEY = "pokemon-favorites";

export interface FavoritePokemon {
  id: number;
  name: string;
  addedAt: string;
}

export const favoritesStorage = {
  // Get all favorites from localStorage
  getFavorites(): FavoritePokemon[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading favorites from localStorage:", error);
      return [];
    }
  },

  // Add a Pokémon to favorites
  addFavorite(pokemon: { id: number; name: string }): void {
    if (typeof window === "undefined") return;

    try {
      const favorites = this.getFavorites();
      const exists = favorites.some((fav) => fav.id === pokemon.id);

      if (!exists) {
        const newFavorite: FavoritePokemon = {
          ...pokemon,
          addedAt: new Date().toISOString(),
        };

        favorites.push(newFavorite);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Error adding favorite to localStorage:", error);
    }
  },

  // Remove a Pokémon from favorites
  removeFavorite(pokemonId: number): void {
    if (typeof window === "undefined") return;

    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter((fav) => fav.id !== pokemonId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing favorite from localStorage:", error);
    }
  },

  // Check if a Pokémon is favorited
  isFavorite(pokemonId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some((fav) => fav.id === pokemonId);
  },

  // Toggle favorite status
  toggleFavorite(pokemon: { id: number; name: string }): boolean {
    const isFavorited = this.isFavorite(pokemon.id);

    if (isFavorited) {
      this.removeFavorite(pokemon.id);
      return false;
    } else {
      this.addFavorite(pokemon);
      return true;
    }
  },

  // Get favorite count
  getFavoriteCount(): number {
    return this.getFavorites().length;
  },
};
