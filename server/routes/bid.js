const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { createBid, getBidsByGig, hireBid } = require("../controllers/bid");
const { body } = require("express-validator");
const { isRequestValidated } = require("../middlewares/validator");

router.post(
  "/",
  authenticate,
  [
    body("gigId").notEmpty().withMessage("Gig ID is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Price must be greater than 0");
        }
        return true;
      }),
  ],
  isRequestValidated,
  createBid
);

router.get("/:gigId", authenticate, getBidsByGig);

router.patch("/:bidId/hire", authenticate, hireBid);

module.exports = router;

