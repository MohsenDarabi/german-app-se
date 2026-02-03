import { writable } from 'svelte/store';

// Assistant panel state
export const isAssistantOpen = writable(false);
export const activeTab = writable<'overview' | 'chat'>('overview');
export const selectedWord = writable<string | null>(null);

// Toggle the assistant panel
export function toggleAssistant() {
  isAssistantOpen.update(v => !v);
}

// Open assistant and select a specific word
export function openWordDetails(word: string) {
  selectedWord.set(word);
  activeTab.set('overview');
  isAssistantOpen.set(true);
}

// Close assistant
export function closeAssistant() {
  isAssistantOpen.set(false);
  selectedWord.set(null);
}

// Switch to chat tab
export function openChat() {
  activeTab.set('chat');
  isAssistantOpen.set(true);
}
