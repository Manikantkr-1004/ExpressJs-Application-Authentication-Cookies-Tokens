const { taskModel } = require("../Models/taskModel");
const {userModel} = require("../Models/userModel");

const createTask = async (req, res) => {
    try {
        const { id, title, description, status, priority, dueDate } = req.body;        
        
        if (!id || !title || !dueDate) {
            return res.status(400).send("Title and due date are required");
        }

        const newTask = new taskModel({ owner: id, title, description, status, priority, dueDate });
        await newTask.save();

        res.status(201).send({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error creating task", error);
        res.status(500).send({message:"Internal Server Error", data: error})
    }
};

const getTasks = async (req, res) => {
    try {
        const { status, priority, sort, own } = req.query;
        let query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;

        if(own){
            const user = await userModel.findOne({email: own});
            if(user){
                query.owner = user?._id;
            }
        }

        let sortOptions = {};
        if(sort) sortOptions['createdAt'] = sort==='asc'? 1: -1;
        

        const tasks = await taskModel.find(query).sort(sortOptions);

        res.status(200).send({message: "Tasks retrieved successfully",data: tasks});
    } catch (error) {
        console.error("Error getting tasks", error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate } = req.body;

        const existTask = await taskModel.findOne({_id: id});
        if (!existTask) {
            return res.status(404).send({message:"Task not found" , data: null});
        }

        const updatedData = {
            title: title || existTask.title,
            description: description || existTask.description,
            status: status || existTask.status,
            priority: priority || existTask.priority,
            dueDate: dueDate || existTask.dueDate
        }

        await taskModel.findOneAndUpdate({_id: id}, updatedData, {new: true});
        res.status(200).send({ message: "Task updated successfully", data: null });

    } catch (error) {
        console.error("Error in updating task", error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const existTask = await taskModel.findOne({_id: id});
        if (!existTask) {
            return res.status(404).send({message:"Task not found" , data: null});
        }

        await taskModel.findOneAndDelete({_id: id});
        res.status(200).send({ message: "Task deleted successfully", data: null });
    } catch (error) {
        console.error("Error in deleting task", error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
};

module.exports = { createTask, getTasks, updateTask, deleteTask};
