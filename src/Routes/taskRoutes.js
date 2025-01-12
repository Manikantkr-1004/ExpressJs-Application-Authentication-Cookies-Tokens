const express = require("express");
const {createTask, updateTask, getTasks, deleteTask} = require("../Controller/taskController")
const {UserAuth } = require("../Middleware/userAuth");

const taskRouter = express.Router();

taskRouter.route("/tasks").get(getTasks);
taskRouter.route("/tasks").post(UserAuth, createTask);
taskRouter.route("/tasks/:id").put(UserAuth, updateTask);
taskRouter.route("/tasks/:id").delete(UserAuth, deleteTask);

module.exports = {taskRouter};