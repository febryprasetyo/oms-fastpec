import { create } from "zustand";

export const useExpandedStore = create<Expanded>((set) => ({
  isExpanded: true,
  setExpanded: (isExpanded) => set({ isExpanded: isExpanded }),
}));
