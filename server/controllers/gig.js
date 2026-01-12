const Gig = require("../models/gig");
const Bid = require("../models/bid");

exports.getAllGigs = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: "open" };
    
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    
    const gigs = await Gig.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ gigs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id,
    });
    
    const populatedGig = await Gig.findById(gig._id).populate("ownerId", "name email");
    
    return res.status(201).json({ gig: populatedGig, message: "Gig created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



