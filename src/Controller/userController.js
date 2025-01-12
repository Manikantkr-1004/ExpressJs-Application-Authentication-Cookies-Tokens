const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel } = require("../Models/userModel");

const UserRegister = async(req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).send({message:"Please send all details",data: null});
        }

        const ExistUser = await userModel.findOne({email});
        if(ExistUser){
            return res.status(400).send({message:"Email already Exist",data:null});
        }        

        const hashed = await bcrypt.hash(password, +process.env.SALT);

        const newUser = new userModel({name, email, password:hashed});
        await newUser.save();

        res.status(201).send({message:"Register Successfully",data:null});
    } catch (error) {
        console.log('Error while register user',error);
        res.status(500).send({message:"Internal Server Error", data: error})        
    }
}

const UserLogin = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).send({message:"Please send all details",data: null});
        }

        const ExistUser = await userModel.findOne({email});
        if(!ExistUser){
            return res.status(400).send({message:"User doesn't exist",data: null});
        }

        bcrypt.compare(password, ExistUser.password, async(err, result)=> {
            if(err || !result){
                return res.status(401).send({message:"Credentials Wrong",data: null});
            }

            const token = jwt.sign({id: ExistUser._id, email: ExistUser.email, name: ExistUser.name}, process.env.JWTSECRET, {expiresIn: '10m'});
            const token2 = jwt.sign({id: ExistUser._id, email: ExistUser.email, name: ExistUser.name}, process.env.JWTSECRET, {expiresIn: '20m'});

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

const UserAuth = async(req, res) => {
    try {
        const token = req.cookies.newauth;
        const token2 = req.cookies.refreshauth;

        if(!token && !token2){
            return res.status(400).send({message:"Please Login",data: null});
        }

        if(token || token2){
            jwt.verify(token, process.env.JWTSECRET, (err, decode)=> {
                if(err){

                    if(token2){
                        jwt.verify(token2, process.env.JWTSECRET, (err, decode)=> {
                            if(err){
                                return res.status(400).send({message:"Please Login",data: null});
                            }
                            
                            const token = jwt.sign({id: decode?.id, email: decode?.email, name: decode?.name}, process.env.JWTSECRET, {expiresIn: '10m'});

                            res.cookie('newauth',token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === "production",
                                sameSite: "none",
                                path:"/",
                                maxAge: 10 * 60 * 1000,
                            })
                            
                            return res.status(200).send({message:'User available', data: {name: decode?.name, email: decode?.email}});

                        })
                    }

                }

                return res.status(200).send({message:'User available', data: {name: decode?.name, email: decode?.email}});
            })
        }

    } catch (error) {
        console.log('Error while checking user auth',error);
        res.status(500).send({message:"Internal Server Error", data: error}) 
    }
}

const UserLogout = async(req, res) => {
    try {
        const token = req.cookies.newauth;
        const token2 = req.cookies.refreshauth;

        if(!token && !token2){
            return res.status(400).send({message:"Already logged out, Please refresh",data: null});
        }

        if(token || token2){
            jwt.verify(token, process.env.JWTSECRET, (err, decode)=> {
                if(err){
                    
                    if(token2){
                        jwt.verify(token2, process.env.JWTSECRET, (err, decode)=> {
                            if(err){
                                return res.status(400).send({message:"Already logged out, Please refresh",data: null});
                            }
                        })
                    }

                }

            })
        }

        res.clearCookie("newauth", {path:"/"});
        res.clearCookie("refreshauth", {path:"/"});

        res.status(200).send({message:"Logged out successfully", data: null});
    } catch (error) {
        console.log('Error while logging out user',error);
        res.status(500).send({message:"Internal Server Error", data: error}) 
    }
}

module.exports = {UserRegister, UserLogin, UserAuth, UserLogout};