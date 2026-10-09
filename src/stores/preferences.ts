import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentGateway } from "@/types/api";

type PreferencesState = {
  /** The payment method chosen last time, offered first next time. */
  gateway: PaymentGateway;
  setGateway: (gateway: PaymentGateway) => void;
};

/**
 * Small per-browser choices that should outlive the tab (localStorage). Only
 * read inside dialogs and menus that open after the page has loaded, so the
 * stored value never has to match server-rendered markup.
 */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      gateway: "BKASH",
      setGateway: (gateway) => set({ gateway }),
    }),
    { name: "enerza-preferences", version: 1 },
  ),
);
