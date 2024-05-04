import jwt from"jsonwebtoken";
import User from"../models/user.model.js";

const authCheck = (req, res, next) => {
     const token = req.headers.authorization;
     //test
     console.log("token: ", token);
     console.log("body: ", req.body);
     console.log("env :", process.env.JWT_SECRET)
     jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
          if (err) {
               console.log('test crop')
               return res.status(401).send({ message: "JWT verification error", error: err })
          }

          try {
               const matchedUser = await User.findById(decoded.id);
               console.log("decoded: ", decoded);
               if (matchedUser) {
                    req.headers.userId = decoded.userId;
                    next();
               } else {
                    res.status(401).send({ message: "User doesn't exist!" });
               }
          } catch (error) {
               console.log('error:', error)
               res.status(500).send({ message: error.message, error })
          }

     });

}

export default authCheck;