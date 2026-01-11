import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface Bid {
  _id: string;
  gigId: string | {
    _id: string;
    title: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  price: number;
  status: "pending" | "hired" | "rejected";
  createdAt: string;
}

interface BidState {
  bids: Bid[];
  loading: boolean;
  error: string | null;
}

const initialState: BidState = {
  bids: [],
  loading: false,
  error: null,
};

export const fetchBidsByGig = createAsyncThunk(
  "bids/fetchBidsByGig",
  async (gigId: string) => {
    const response = await api.get(`/bids/${gigId}`);
    return response.data.bids;
  }
);

export const createBid = createAsyncThunk(
  "bids/createBid",
  async (data: { gigId: string; message: string; price: number }) => {
    const response = await api.post("/bids", data);
    return response.data.bid;
  }
);

export const hireBid = createAsyncThunk(
  "bids/hireBid",
  async (bidId: string) => {
    const response = await api.patch(`/bids/${bidId}/hire`);
    return response.data.bid;
  }
);

const bidSlice = createSlice({
  name: "bids",
  initialState,
  reducers: {
    addBid: (state, action) => {
      state.bids.push(action.payload);
    },
    updateBidStatus: (state, action) => {
      const { bidId, status } = action.payload;
      const bid = state.bids.find((b) => b._id === bidId);
      if (bid) {
        bid.status = status;
      }
    },
    rejectAllOtherBids: (state, action) => {
      const { hiredBidId } = action.payload;
      state.bids.forEach((bid) => {
        if (bid._id !== hiredBidId && bid.status === "pending") {
          bid.status = "rejected";
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidsByGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsByGig.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsByGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bids";
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.bids.push(action.payload);
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        const bid = state.bids.find((b) => b._id === action.payload._id);
        if (bid) {
          bid.status = "hired";
        }
        state.bids.forEach((b) => {
          if (b._id !== action.payload._id && b.status === "pending") {
            b.status = "rejected";
          }
        });
      });
  },
});

export const { addBid, updateBidStatus, rejectAllOtherBids } = bidSlice.actions;
export default bidSlice.reducer;

