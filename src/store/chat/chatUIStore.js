//participant UI 전용

import { create } from "zustand";

export const useChatUIStore = create((set) => ({
  showParticipants: false,

  openParticipants: () => set({ showParticipants: true }),
  closeParticipants: () => set({ showParticipants: false }),
  toggleParticipants: () =>
    set((state) => ({ showParticipants: !state.showParticipants })),

  resetChatUI: () => set({ showParticipants: false }),
}));
