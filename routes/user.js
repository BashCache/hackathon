const express = require("express");
const User = require("../controllers/user");
const Mailer = require("../utilities/mailer");
const Validator = require("../validators/auth");
// const passport = require("passport");
// const Auth = require("../controllers/auth");

const router = express.Router();
// require("../config/passport.js")(passport);
// Validator.userRegisterValidator
// Validator.userSigninValidator
router.post("/register", Validator.userRegisterValidator, User.register, Mailer.sendMailForRegistration, Mailer.sendMailAcquaintanceForRegistration);
router.post("/signin", Validator.userSigninValidator, User.signin);
router.post("/sentimentanalysis", User.sentimentanalyis);

module.exports = router;