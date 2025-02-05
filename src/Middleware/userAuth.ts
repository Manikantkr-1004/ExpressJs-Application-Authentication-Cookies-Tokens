import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

export const UserAuth = async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    try {
        const token = req.cookies.newauth;
        const token2 = req.cookies.refreshauth;

        if (!token && !token2) {
            res.status(400).send({ message: "Please Login", data: null });
            return;
        }

        if (token || token2) {
            jwt.verify(token, process.env.JWTSECRET as string, (err:any, decode:any) => {
                if (err) {

                    if (token2) {
                        jwt.verify(token2, process.env.JWTSECRET as string, (err:any, decode:any) => {
                            if (err) {
                                res.status(400).send({ message: "Please Login", data: null });
                                return;
                            }

                            req.body = {...req.body, id: decode?.id};
                            next();
                        })
                    }

                }

                req.body = {...req.body, id: decode?.id};
                next();

            })
        }

    } catch (error) {
        console.log('Error while checking user auth', error);
        res.status(500).send({ message: "Internal Server Error", data: error })
    }
}