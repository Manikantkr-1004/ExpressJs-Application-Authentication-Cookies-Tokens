const jwt = require("jsonwebtoken");

const UserAuth = async (req, res, next) => {
    try {
        const token = req.cookies.newauth;
        const token2 = req.cookies.refreshauth;

        if (!token && !token2) {
            return res.status(400).send({ message: "Please Login", data: null });
        }

        if (token || token2) {
            jwt.verify(token, process.env.JWTSECRET, (err, decode) => {
                if (err) {

                    if (token2) {
                        jwt.verify(token2, process.env.JWTSECRET, (err, decode) => {
                            if (err) {
                                return res.status(400).send({ message: "Please Login", data: null });
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

module.exports = {UserAuth};