import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  vehicleStatus: string;
  vehicleType: string;
  dateRange: {
    start: string;
    end: string;
  };
  searchQuery: string;
}

const initialState: FiltersState = {
  vehicleStatus: "ALL",
  vehicleType: "ALL",
  dateRange: {
    start: "",
    end: "",
  },
  searchQuery: "",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setVehicleStatus: (state, action: PayloadAction<string>) => {
      state.vehicleStatus = action.payload;
    },
    setVehicleType: (state, action: PayloadAction<string>) => {
      state.vehicleType = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.dateRange = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetFilters: (state) => {
      state.vehicleStatus = "ALL";
      state.vehicleType = "ALL";
      state.dateRange = { start: "", end: "" };
      state.searchQuery = "";
    },
  },
});

export const {
  setVehicleStatus,
  setVehicleType,
  setDateRange,
  setSearchQuery,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
