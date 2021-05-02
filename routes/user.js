const express = require("express");
const User = require("../controllers/user");
const Mailer = require("../utilities/mailer");
const Validator = require("../validators/auth");
// const passport = require("passport");
// const Auth = require("../controllers/auth");

const router = express.Router();

router.post("/register", Validator.userRegisterValidator, User.register, Mailer.sendMailForRegistration, Mailer.sendMailAcquaintanceForRegistration);
router.post("/signin", Validator.userSigninValidator, User.signin);
router.post("/seekHelp", User.scrapeData);
router.post("/sentimentanalysis", User.sentimentanalyis, Mailer.sendMailReport);
router.post("/recommendMusic", User.recommendMusic);

module.exports = router;