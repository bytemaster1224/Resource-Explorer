import { PokemonDetailClient } from "./pokemon-detail-client";

interface PokemonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PokemonDetailPage({
  params,
}: PokemonDetailPageProps) {
  const resolvedParams = await params;
  const pokemonId = parseInt(resolvedParams.id, 10);

  if (!pokemonId || isNaN(pokemonId)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Invalid Pokemon ID
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The Pokemon ID you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PokemonDetailClient pokemonId={pokemonId} />;
}
