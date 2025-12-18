export const defaultLocale = "en";

import { create } from "zustand"
import { persist } from "zustand/middleware";

interface LocaleState {
    locale: string;
    setLocale: (locale: string) => void
}

export const useLocale = create<LocaleState>() (
    persist((set) => ({
        locale: defaultLocale,
        setLocale: (locale: string) => set({ locale })
    }),
    {
        name: "locale-storage"
    }
)
)