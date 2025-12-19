import type { MediaMinimal } from '../types/MediaInterface';
import type { AnilistMediaMinimal } from '../types/AnilistInterface';
import type { TMDBMediaMinimal } from '../types/TMDBInterface';


export function mapToMedia(item: AnilistMediaMinimal | TMDBMediaMinimal): MediaMinimal {
  
    return {
      ...item
    } as MediaMinimal;
  } 

