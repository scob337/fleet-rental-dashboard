import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  language: "ar";
  direction: "rtl";
  mobileSidebarOpen: boolean;
}

// Helper function to get initial dark mode from localStorage
const getInitialDarkMode = (): boolean => {
  if (typeof window === "undefined") return false;
  
  try {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load darkMode from localStorage:", error);
  }
  
  return false;
};

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: getInitialDarkMode(),
  language: "ar",
  direction: "rtl",
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    // Language locked to Arabic
    setLanguage: (state) => {
      state.language = "ar";
      state.direction = "rtl";
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  setLanguage,
} = uiSlice.actions;
export default uiSlice.reducer;
