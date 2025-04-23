"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User_js_1 = require("../controllers/User.js");
var express_1 = require("express");
var router = (0, express_1.Router)();
router.post("/login", function (req, res) {
    (0, User_js_1.loginUser)(req, res);
});
router.post("/register", function (req, res) {
    (0, User_js_1.registerUser)(req, res);
});
exports.default = router;
