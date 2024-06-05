import User from '../models/user.model.js';
import Verification from '../models/verify.model.js';
import PasswordReset from '../models/passwordReset.model.js';

import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import eventEmitter from '../utils/eventEmitter.js';

let transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'frieda17@ethereal.email',
    pass: 'ks7SqdX2WWB2HySrWK'
  }
});

// testing success
const test = transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for message");
    console.log(success);
  }
})

// output api function
export const signup = async (req, res, next) => {
  const { username, email, password, firstName, lastName, phoneNumber } = req.body;
  console.log(req.body);
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, firstName, lastName, phoneNumber });

  try {
    await newUser.save().then((result) => {
      sendVerificationEmail(result, res);
    });
    // res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));
    if (!validUser.verified) {
      return next(errorHandler(402, "Email hasn't been verified"));
    } else {
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) return next(errorHandler(401, 'wrong credentials'));
      const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const { password: hashedPassword, ...rest } = validUser._doc;
      const expiryDate = new Date(Date.now() + 36000000); // 10 hour
      res.status(200).send({ message: "Login successful", user: { rest, token, expiryDate } });
    }

  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: hashedPassword, ...rest } = user._doc;
      const expiryDate = new Date(Date.now() + 36000000); // 10 hour
      res.status(200).send({ message: "Login successful", user: { rest, token, expiryDate } });
    } else {
      console.log("Google: ", req.body);
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: hashedPassword2, ...rest } = newUser._doc;
      const expiryDate = new Date(Date.now() + 36000000); // 10 hour
      res.status(200).send({ message: "Login successful", user: { rest, token, expiryDate } });
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json('Signout success!');
};

export const verify = (req, res, next) => {
  let { userId, uniqueString } = req.params;

  Verification
    .find({ userId })
    .then((result) => {
      if (result.length > 0) {

        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        if (expiresAt < Date.now()) {
          //record expires
          Verification
            .deleteOne({ userId })
            .then(() => {
              User
                .findByIdAndDelete(userId)
                .then(() => {
                  return next(errorHandler(401, "Link has expires. Please sign up again"))
                })
                .catch((error) => { return next(errorHandler(404, "Can't delete User when clearing expires email")) });
            })
            .catch((error) => { return next(errorHandler(404, "Can't delete Verification when verify expires")) });
        } else {

          bcryptjs
            .compare(uniqueString, hashedUniqueString)
            .then(result => {
              if (result) {
                User
                  .findByIdAndUpdate({ _id: userId }, { verified: true })
                  .then(() => {
                    Verification.deleteOne({ userId }).then(res.status(201).json({ message: 'User created and verify successfully' }))
                    eventEmitter.emit('userVerifiedStatusChanged', { _id: userId, verified: true });
                  })
                  .catch(error => { return next(errorHandler(404, "Problem with update user")) })

              } else {
                return next(errorHandler(406, "Invalid verification details passed. Check your inbox"))
              }
            })
            .catch(error => { return next(errorHandler(405, error)) })
        }
      } else {
        // No exist verification record
        return next(errorHandler(404, "Account record doesn't exist or have been verified already. Please signup or login."));
      }
    })
    .catch((error) => {
      console.log(error);
      return next(errorHandler(405, error));
    })
};

export const sentEmail = (req, res) => {
  const { _id, email } = req.body;
  sendVerificationEmail({ _id, email }, res);
}

export const resetPasswordEmail = (req, res) => {
  const { email, redirectUrl } = req.body;

  // check email exists
  User.find({ email }).then((data) => {
    if (data.length) {
      // User exists

      // Check if verified
      if (!data[0].verified) {
        res.json({
          status: "FAILED",
          message: "Email hasn't been verified, check inbox",
        })
      } else {
        sendResetEmail(data[0], redirectUrl, res);
      }

    } else {
      res.json({
        status: "FAILED",
        message: "No account with the supplied email",
      })
    }
  }).catch(error => {
    console.log(error);
    res.json({
      status: "FAILED",
      message: "An error occurred while checking existing user",
    })
  })
}

export const resetPassword = (req, res) => {
  let { newPassword } = req.body;
  let { userId, resetString } = req.params;

  PasswordReset.find({ userId }).then(result => {
    if (result.length > 0) {
      // Record exist

      const { expiresAt } = result[0];
      const hashedResetString = result[0].resetString;
      // Checking for expired
      if (expiresAt < Date.now()) {
        PasswordReset.deleteOne({ userId }).then(() => {
          res.json({
            status: "FAILED",
            message: "Password reset link has expired",
          })
        }
        ).catch(error => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Clearing password reset request failed",
          });
        });
      } else {
        bcryptjs.compare(resetString, hashedResetString)
          .then(() => {
            if (result) {
              const saltRounds = 10;
              bcryptjs.hash(newPassword, saltRounds).then(hashhedNewPassword => {
                User.updateOne({ _id: userId }, { password: hashhedNewPassword })
                  .then(() => {
                    PasswordReset.deleteOne({ userId }).then(()=>{
                      res.json({
                        status: "SUCCESS",
                        message: "Password reset successfully",
                      })
                    }).catch(error => {
                      console.log(error);
                      res.json({
                        status: "FAILED",
                        message: "Error when finalizing password reset",
                      })
                    })
                  })
                  .catch(error => {
                    console.log(error);
                    res.json({
                      status: "FAILED",
                      message: "Updating user failed",
                    })
                  })
              }).catch(error => {
                console.log(error);
                res.json({
                  status: "FAILED",
                  message: "hashing new password failed",
                });
              })
            } else {
              res.json({
                status: "FAILED",
                message: "Invaid password reset details passed",
              });
            }
          })
          .catch(error => {
            console.log(error);
            res.json({
              status: "FAILED",
              message: "Comparing password reset strings failed",
            });
          });
      }
    } else {
      // Password reset record doesn't exist
      res.json({
        status: "FAILED",
        message: "Password reset request not found",
      })
    }
  }
  ).catch(error => {
    console.log(error);
    res.json({
      status: "FAILED",
      message: "Checking for existing password reset record failed",
    })
  });
}

// work function
const sendVerificationEmail = ({ _id, email }, res) => {
  const currentUrl = "http://localhost:8080/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete the sign up and login into your account.</p><p>This link <b>exprires in 10 minutes</b></p>
    <p>Press <a href=${currentUrl + "api/auth/verify/" + _id + "/" + uniqueString}>here</a> to proceed</p>`,
  };
  Verification.findOneAndDelete({ userId: _id }).then(() => {
    //hash the uniqueString
    const saltRounds = 10;
    bcryptjs.hash(uniqueString, saltRounds).then((hashedUniqueString) => {
      const newVerification = new Verification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createAt: Date.now(),
        expiresAt: Date.now() + 600000, //10 minutes
      });

      newVerification.save()
        .then(() => {
          transporter.sendMail(mailOptions)
            .then(() => {
              res.json({
                status: "PENDING",
                message: "Verification email sent",
                data: {
                  user: _id,
                }
              })
            })
            .catch((error) => {
              console.log(error);
              res.json({
                status: "FAILED",
                message: "Verification email failed",
              })
            })
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Couldn't save verification email data!",
          })
        })
    }).catch(() => {
      res.json({
        status: "FAILED",
        message: "An error occurred while hasing email data!",
      })
    });
  }).catch(() => {
    res.json({
      status: "FAILED",
      message: "An error occurred while deleting verification document!",
    })
  })

}

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    //mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete sign up</p><p>This code <b>exprires in 10 minutes</b></p>`,
    };

    //hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcryptjs.hash(otp, saltRounds);
    const newOTPVerification = await new OTPVerfication({
      userID: _id,
      otp: hashedOTP,
      createAt: Date.now(),
      expiresAt: Date.now() + 600000, //10 minutes
    });

    // save otp record
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        user: _id,
        email,
      }
    })
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    })
  }
};

// Fuction use socket.io update verification status
export async function verifyPolling(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("connection");
    // Check if user is already verified when they connect
    // If verified, emit the verified status
    // This ensures that when a user refreshes the page, they don't see a 'pending' status
    User.findById(userId)
      .then((user) => {
        if (user && user.verified) {
          const value = 'true';
          const id = user._id
          socket.emit('verifiedStatus', { id: id, value: value });
          console.log("verifiedStatus", { id: id, value: value });
        } else {
          const value = 'pending';
          const id = user._id
          socket.emit('verifiedStatus', { id: id, value: value });
          console.log('verifiedStatus', { id: id, value: value });
        }
      })
      .catch((error) => {
        console.error('Error checking user verification:', error);
      });
  });
}

const sendResetEmail = ({ _id, email }, redirectUrl, res) => {
  const resetString = uuidv4() + _id;

  PasswordReset.deleteMany({ userId: _id })
    .then((result) => {

      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Password Reset",
        html: `<p>Use the link below to reset the password.</p><p>This link <b>exprires in 10 minutes</b></p>
      <p>Press <a href=${redirectUrl + "api/auth/resetPassword/" + _id + "/" + resetString}>here</a> to proceed</p>`,
      };

      // hash the reset string
      const saltRounds = 10;
      bcryptjs.hash(resetString, saltRounds).then(hashedResetString => {

        const newPasswordReset = new PasswordReset({
          userId: _id,
          resetString: hashedResetString,
          createdAt: Date.now(),
          expiresAt: Date.now() + 600000,
        });

        newPasswordReset
          .save()
          .then(() => {
            transporter.sendMail(mailOptions).then(() => {
              res.json({
                status: "PENDING",
                message: "Password reset email sent",
              })
            }).catch(error => {
              console.log(error);
              res.json({
                status: "FAILED",
                message: "Password reset email failed!",
              })
            })
          })
          .catch(error => {
            console.log(error);
            res.json({
              status: "FAILED",
              message: "Couldn't save the password reset data!",
            })
          })
      })
        .catch(error => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "An error occurred while hashing the password reset data!",
          })
        })
    }).catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Clearing existing password reset records failed",
      })
    })
}

export default test;