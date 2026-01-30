import { resolveMedia } from "$lib/utils/asset-resolver";
import profiles from "$lib/data/character-profiles.json";

export interface CharacterProfile {
  id: string;
  displayName: {
    fa: string;
    de: string;
  };
  role: string;
  tags: string[];
  avatarImageId?: string;
}

const typedProfiles = profiles as Record<string, CharacterProfile>;

export function getCharacterProfile(id: string): CharacterProfile | null {
  return typedProfiles[id] ?? null;
}

export function getCharacterDisplayName(id: string): string {
  const profile = getCharacterProfile(id);
  return profile?.displayName?.de || profile?.displayName?.fa || id;
}

export function getCharacterAvatarPath(id: string): string | null {
  const profile = getCharacterProfile(id);
  return resolveMedia(profile?.avatarImageId);
}
