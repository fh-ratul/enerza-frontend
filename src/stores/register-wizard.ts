import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ConnectionType } from "@/types/api";

/** What the registration wizard remembers between steps and across a reload. */
export type RegisterDraft = {
  name: string;
  email: string;
  contactNumber: string;
  areaId: string;
  meterNumber: string;
  connectionType: ConnectionType;
};

type RegisterWizardState = {
  step: number;
  draft: RegisterDraft;
  setStep: (step: number) => void;
  saveDraft: (draft: Partial<RegisterDraft>) => void;
  reset: () => void;
};

export const emptyRegisterDraft: RegisterDraft = {
  name: "",
  email: "",
  contactNumber: "",
  areaId: "",
  meterNumber: "",
  connectionType: "RESIDENTIAL",
};

/**
 * Progress through the registration wizard, kept for the browser tab
 * (sessionStorage), so an accidental reload does not throw away two steps of
 * typing. Passwords are deliberately never part of the draft.
 */
export const useRegisterWizard = create<RegisterWizardState>()(
  persist(
    (set) => ({
      step: 0,
      draft: emptyRegisterDraft,
      setStep: (step) => set({ step }),
      saveDraft: (draft) => set((state) => ({ draft: { ...state.draft, ...draft } })),
      reset: () => set({ step: 0, draft: emptyRegisterDraft }),
    }),
    {
      name: "enerza-register",
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrated by the wizard after it mounts, so the server-rendered
      // markup and the first client render are identical.
      skipHydration: true,
    },
  ),
);
