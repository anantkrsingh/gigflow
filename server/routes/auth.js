const express = require("express");
const router = express.Router();
const { validateRegister, isRequestValidated, validateLogin } = require("../middlewares/validator");
const { authenticate } = require("../middlewares/auth");
const { register, login, getMe, logout } = require("../controllers/auth");

router.post("/register", validateRegister(), isRequestValidated, register);
router.post("/login", validateLogin(), isRequestValidated, login);
router.get("/me", authenticate, getMe);
router.post("/logout", logout);

module.exports = router;