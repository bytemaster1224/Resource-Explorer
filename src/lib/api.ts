export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonType {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }>;
}

const BASE_URL = "https://pokeapi.co/api/v2";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAbort<T>(
  url: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

export const pokemonApi = {
  // Get paginated list of Pokémon
  async getPokemonList(
    offset: number = 0,
    limit: number = 20,
    signal?: AbortSignal
  ): Promise<PokemonListResponse> {
    const url = `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`;
    return fetchWithAbort<PokemonListResponse>(url, signal);
  },

  // Get detailed Pokémon data
  async getPokemon(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<Pokemon> {
    const url = `${BASE_URL}/pokemon/${idOrName}`;
    return fetchWithAbort<Pokemon>(url, signal);
  },

  // Get all Pokémon types for filtering
  async getPokemonTypes(
    signal?: AbortSignal
  ): Promise<{ results: Array<{ name: string; url: string }> }> {
    const url = `${BASE_URL}/type`;
    return fetchWithAbort<{ results: Array<{ name: string; url: string }> }>(
      url,
      signal
    );
  },

  // Get Pokémon by type
  async getPokemonByType(
    type: string,
    signal?: AbortSignal
  ): Promise<PokemonType> {
    const url = `${BASE_URL}/type/${type}`;
    return fetchWithAbort<PokemonType>(url, signal);
  },

  // Search Pokémon by name (using the list endpoint with a large limit)
  async searchPokemon(
    query: string,
    signal?: AbortSignal
  ): Promise<PokemonListResponse> {
    if (!query || query.length < 2) {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }

    // PokéAPI doesn't have a direct search endpoint, so we'll fetch the full list and
    // filter client-side. We first retrieve the total count, then request all entries.
    const countUrl = `${BASE_URL}/pokemon?limit=1`;
    const countResponse = await fetchWithAbort<PokemonListResponse>(
      countUrl,
      signal
    );

    const listUrl = `${BASE_URL}/pokemon?limit=${countResponse.count}`;
    const fullResponse = await fetchWithAbort<PokemonListResponse>(
      listUrl,
      signal
    );

    const filteredResults = fullResponse.results.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query.toLowerCase().trim())
    );

    return {
      ...fullResponse,
      results: filteredResults,
      count: filteredResults.length,
    };
  },
};
