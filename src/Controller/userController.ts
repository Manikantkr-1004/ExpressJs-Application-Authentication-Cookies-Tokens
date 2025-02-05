import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../Models/userModel";

export const UserRegister = async(req:Request, res:Response): Promise<void> => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            res.status(400).send({message:"Please send all details",data: null});
            return;
        }

        const ExistUser = await userModel.findOne({email});
        if(ExistUser){
            res.status(400).send({message:"Email already Exist",data:null});
            return;
        }        

        const hashed = await bcrypt.hash(password, process.env.SALT? +process.env.SALT: 2);

        const newUser = new userModel({name, email, password:hashed});
        await newUser.save();

        res.status(201).send({message:"Register Successfully",data:null});
    } catch (error) {
        console.log('Error while register user',error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
}

export const UserLogin = async(req:Request, res:Response): Promise<void> => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            res.status(400).send({message:"Please send all details",data: null});
            return;
        }

        const ExistUser = await userModel.findOne({email});
        if(!ExistUser){
            res.status(400).send({message:"User doesn't exist",data: null});
            return;
        }

        bcrypt.compare(password, ExistUser.password, async(err, result)=> {
            if(err || !result){
                res.status(401).send({message:"Credentials Wrong",data: null});
                return;
            }

            const token = jwt.sign({id: ExistUser._id, email: ExistUser.email, name: ExistUser.name}, process.env.JWTSECRET as string, {expiresIn: '10m'});
            const token2 = jwt.sign({id: ExistUser._id, email: ExistUser.email, name: ExistUser.name}, process.env.JWTSECRET as string, {expiresIn: '20m'});

            res.cookie('newauth',token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                path:"/",
                maxAge: 10 * 60 * 1000,
            })

            res.cookie('refreshauth',token2, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                path:"/",
                maxAge: 20 * 60 * 1000,
            })

            res.status(200).send({message:"Login successfully", data: {name: ExistUser.name, email: ExistUser.email}});

        })
    } catch (error) {
        console.log('Error while login user',error);
        res.status(500).send({message:"Internal Server Error", data:error}) 
    }
}

export const UserAuth = async(req:Request, res:Response): Promise<void> => {
    try {
        const token = req.cookies.newauth;
        const token2 = req.cookies.refreshauth;

        if(!token && !token2){
            res.status(400).send({message:"Please Login",data: null});
            return;
        }

        if(token || token2){
            jwt.verify(token, process.env.JWTSECRET as string, (err:any, decode:any)=> {
                if(err){

                    if(token2){
                        jwt.verify(token2, process.env.JWTSECRET as string, (err:any, decode:any)=> {
                            if(err){
                                res.status(400).send({message:"Please Login",data: null});
                                return;
                            }
                            
                            const token = jwt.sign({id: decode?.id, email: decode?.email, name: decode?.name}, process.env.JWTSECRET as string, {expiresIn: '10m'});

                            res.cookie('newauth',token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === "production",
                                sameSite: "none",
                                path:"/",
                                maxAge: 10 * 60 * 1000,
                            })
                            
                            res.status(200).send({message:'User available', data: {name: decode?.name, email: decode?.email}});
                            return;

                        })
                    }

                }

                res.status(200).send({message:'User available', data: {name: decode?.name, email: decode?.email}});
            })
        }

    } catch (error) {
        console.log('Error while checking user auth',error);
        res.status(500).send({message:"Internal Server Error", data: error}) 
    }
}

export const UserLogout = async(req:Request, res:Response): Promise<void> => {
    try {
        const token = req.cookies.newauth;
        const token2 = req.cookies.refreshauth;

        if(!token && !token2){
            res.status(400).send({message:"Already logged out, Please refresh",data: null});
            return;
        }

        if(token || token2){
            jwt.verify(token, process.env.JWTSECRET as string, (err:any, decode:any)=> {
                if(err){
                    
                    if(token2){
                        jwt.verify(token2, process.env.JWTSECRET as string, (err:any, decode:any)=> {
                            if(err){
                                res.status(400).send({message:"Already logged out, Please refresh",data: null});
                                return;
                            }
                        })
                    }

                }

            })
        }

        res.cookie('newauth',token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                path:"/",
                maxAge: 0,
            })

            res.cookie('refreshauth',token2, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                path:"/",
                maxAge: 0,
            })

        res.status(200).send({message:"Logged out successfully", data: null});
    } catch (error) {
        console.log('Error while logging out user',error);
        res.status(500).send({message:"Internal Server Error", data: error}) 
    }
}