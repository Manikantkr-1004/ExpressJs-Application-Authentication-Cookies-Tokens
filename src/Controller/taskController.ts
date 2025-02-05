import { Request, Response } from "express";
import { taskModel } from "../Models/taskModel";
import { userModel } from "../Models/userModel";

export const createTask = async (req:Request, res:Response): Promise<void> => {
    try {
        const { id, title, description, status } = req.body;        
        
        if (!id || !title || !description || !status) {
            res.status(400).send("Please provide required fields");
            return;
        }

        const newTask = new taskModel({ owner: id, title, description, status });
        await newTask.save();

        res.status(201).send({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error creating task", error);
        res.status(500).send({message:"Internal Server Error", data: error})
    }
};

export const getTasks = async (req:Request, res:Response): Promise<void> => {
    try {
        const { status, title, sort, own } = req.query;
        let query:any = {};

        if (status) query.status = status;
        if (title) query.title = { $regex: title, $options: "i" };

        if(own){
            const user = await userModel.findOne({email: own});
            if(user){
                query.owner = user?._id;
            }
        }

        let sortOptions:any = {};
        if(sort) sortOptions['createdAt'] = sort==='asc'? 1: -1;
        

        const tasks = await taskModel.find(query).sort(sortOptions);

        res.status(200).send({message: "Tasks retrieved successfully",data: tasks});
    } catch (error) {
        console.error("Error getting tasks", error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
};

export const updateTask = async (req:Request, res:Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const existTask = await taskModel.findOne({_id: id});
        if (!existTask) {
            res.status(404).send({message:"Task not found" , data: null});
            return;
        }

        const updatedData = {
            title: title || existTask.title,
            description: description || existTask.description,
            status: status || existTask.status
        }

        await taskModel.findOneAndUpdate({_id: id}, updatedData, {new: true});
        res.status(200).send({ message: "Task updated successfully", data: null });

    } catch (error) {
        console.error("Error in updating task", error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
};

export const deleteTask = async (req:Request, res:Response):Promise<void> => {
    try {
        const { id } = req.params;

        const existTask = await taskModel.findOne({_id: id});
        if (!existTask) {
            res.status(404).send({message:"Task not found" , data: null});
            return;
        }

        await taskModel.findOneAndDelete({_id: id});
        res.status(200).send({ message: "Task deleted successfully", data: null });
    } catch (error) {
        console.error("Error in deleting task", error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
};