const express = require("express");
const {UserRegister, UserLogin, UserAuth, UserLogout} = require("../Controller/userController")

const userRouter = express.Router();

userRouter.route("/register").post(UserRegister);
userRouter.route("/login").post(UserLogin);
userRouter.route("/check").get(UserAuth);
userRouter.route("/logout").post(UserLogout);

module.exports = {userRouter};