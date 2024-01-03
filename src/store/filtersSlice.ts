import { Brand } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

export type FilterType = {
   brands: Brand[];
   // price: string[];
};

export type SortType = {
   column: string;
   type: "desc" | "acs";
};

type StateType = {
   filters: FilterType;
   sort: SortType;
};

const initialState: StateType = {
   filters: {
      brands: [],
      // price: [],
   },
   sort: {
      column: "",
      type: "desc",
   },
};

const filtersSlice = createSlice({
   name: "filters",
   initialState,
   reducers: {
      storingFilters(state, action: { payload: StateType | undefined }) {
         const payload = action.payload;
         console.log("storing filter check payload", payload);

         state.filters = payload?.filters || initialState.filters;
         state.sort = payload?.sort || initialState.sort;
      },
   },
});

export const selectedAllFilter = (state: { filters: StateType }) => state.filters;
export const { storingFilters } = filtersSlice.actions;

export default filtersSlice.reducer;
