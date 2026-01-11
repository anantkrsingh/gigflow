const Bid = require("../models/bid");
const Gig = require("../models/gig");
const mongoose = require("mongoose");

exports.createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    
    if (gig.status !== "open") {
      return res.status(400).json({ message: "Gig is no longer open" });
    }
    
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot bid on your own gig" });
    }
    
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    });
    
    if (existingBid) {
      return res.status(400).json({ message: "You have already bid on this gig" });
    }
    
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price,
    });
    
    const populatedBid = await Bid.findById(bid._id)
      .populate("freelancerId", "name email")
      .populate("gigId", "title");
    
    return res.status(201).json({ bid: populatedBid, message: "Bid created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBidsByGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }
    
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only gig owner can view bids" });
    }
    
    const bids = await Bid.find({ gigId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ bids });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { bidId } = req.params;
    
    const bid = await Bid.findById(bidId).populate("gigId").session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Bid not found" });
    }
    
    const gig = bid.gigId;
    
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Only gig owner can hire" });
    }
    
    if (gig.status === "assigned") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Gig is already assigned" });
    }
    
    if (bid.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Bid is not pending" });
    }
    
    await Gig.findByIdAndUpdate(
      gig._id,
      { status: "assigned" },
      { session }
    );
    
    await Bid.findByIdAndUpdate(
      bidId,
      { status: "hired" },
      { session }
    );
    
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId }, status: "pending" },
      { status: "rejected" },
      { session }
    );
    
    await session.commitTransaction();
    
    const updatedBid = await Bid.findById(bidId)
      .populate("freelancerId", "name email")
      .populate("gigId", "title");
    
    if (global.io) {
      global.io.emit("bidHired", {
        bidId: updatedBid._id.toString(),
        freelancerId: updatedBid.freelancerId._id.toString(),
        gigTitle: updatedBid.gigId.title,
        message: `You have been hired for ${updatedBid.gigId.title}!`,
      });
    }
    
    return res.status(200).json({
      bid: updatedBid,
      message: "Freelancer hired successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

