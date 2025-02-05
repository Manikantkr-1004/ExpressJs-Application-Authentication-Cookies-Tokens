import express from "express";
import { UserAuth } from "../Middleware/userAuth";
import { createTask, deleteTask, getTasks, updateTask } from "../Controller/taskController";

export const taskRouter = express.Router();

taskRouter.route("/tasks").get(getTasks);
taskRouter.route("/tasks").post(UserAuth, createTask);
taskRouter.route("/tasks/:id").put(UserAuth, updateTask);
taskRouter.route("/tasks/:id").delete(UserAuth, deleteTask);