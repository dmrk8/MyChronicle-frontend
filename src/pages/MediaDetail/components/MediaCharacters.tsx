import type { MediaCharacter } from '../../../types/Media';

interface MediaCharactersProps {
  characters: MediaCharacter[];
}

export const MediaCharacters = ({ characters }: MediaCharactersProps) => {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Characters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.slice(0, 12).map((character, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            <div className="flex justify-between">
              {/* Left side - Character */}
              <div className="flex flex-1 min-w-0">
                <div className="w-16 h-24 shrink-0">
                  <img
                    src={character.image || '/placeholder-character.png'}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                  <div className="text-xs text-white font-medium line-clamp-2">
                    {character.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 uppercase">
                    {character.role}
                  </div>
                </div>
              </div>

              {/* Right side - Voice Actor */}
              {character.voiceActor && (
                <div className="flex flex-1 min-w-0">
                  <div className="flex-1 p-2 flex flex-col justify-between min-w-0 text-right">
                    <div className="text-xs text-white font-medium line-clamp-2">
                      {character.voiceActor.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase">
                      Voice Actor
                    </div>
                  </div>
                  <div className="w-16 h-24 shrink-0">
                    <img
                      src={
                        character.voiceActor.image || '/placeholder-actor.png'
                      }
                      alt={character.voiceActor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
