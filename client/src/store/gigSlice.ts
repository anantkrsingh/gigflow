import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: "open" | "assigned";
  createdAt: string;
}

interface GigState {
  gigs: Gig[];
  loading: boolean;
  error: string | null;
}

const initialState: GigState = {
  gigs: [],
  loading: false,
  error: null,
};

export const fetchGigs = createAsyncThunk(
  "gigs/fetchGigs",
  async (search?: string) => {
    const response = await api.get("/gigs", {
      params: search ? { search } : {},
    });
    return response.data.gigs;
  }
);

export const createGig = createAsyncThunk(
  "gigs/createGig",
  async (data: { title: string; description: string; budget: number }) => {
    const response = await api.post("/gigs", data);
    return response.data.gig;
  }
);

const gigSlice = createSlice({
  name: "gigs",
  initialState,
  reducers: {
    updateGigStatus: (state, action) => {
      const { gigId, status } = action.payload;
      const gig = state.gigs.find((g) => g._id === gigId);
      if (gig) {
        gig.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch gigs";
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.gigs.unshift(action.payload);
      });
  },
});

export const { updateGigStatus } = gigSlice.actions;
export default gigSlice.reducer;

