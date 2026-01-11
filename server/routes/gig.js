const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { getAllGigs, createGig } = require("../controllers/gig");
const { body } = require("express-validator");
const { isRequestValidated } = require("../middlewares/validator");

router.get("/", getAllGigs);

router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("budget")
      .notEmpty()
      .withMessage("Budget is required")
      .isNumeric()
      .withMessage("Budget must be a number")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Budget must be greater than 0");
        }
        return true;
      }),
  ],
  isRequestValidated,
  createGig
);

module.exports = router;

