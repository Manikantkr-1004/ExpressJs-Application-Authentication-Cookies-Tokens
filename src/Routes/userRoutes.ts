import { UserAuth, UserLogin, UserLogout, UserRegister } from "../Controller/userController";
import express from "express";

export const userRouter = express.Router();

userRouter.route("/register").post(UserRegister);
userRouter.route("/login").post(UserLogin);
userRouter.route("/check").get(UserAuth);
userRouter.route("/logout").post(UserLogout);