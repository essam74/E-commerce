import userModel from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/GenerateAndVerifyToken.js";
import { hash , compare } from "../../../utils/HashAndCompare.js";

// signup

export const signup = asyncHandler(async (req, res, next) => {
  //checkUser
  const { userName, email, password } = req.body;
  const checkUser = await userModel.findOne({ email });

  if (checkUser) {
    return next(new Error("Email Exist", { cause: 409 }));
  }
  //send email ......
  const token = generateToken({
    payload: { email },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 60 * 60 * 24,
  });
  const refreshToken = generateToken({
    payload: {},
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 60 * 60 * 24,
  });

  //hashPassword
  const hashedPassword = hash({ plaintext: password });

  //save
  const { _id } = await userModel.create({
    userName,
    email,
    password: hashedPassword,
  });
  return res.status(201).json({ message: "Success", _id, token, refreshToken });
});

// confirm email

// export const confirmEmail = asyncHandler(async (req, res, next) => {
//   const { token } = req.params;
//   const { email } = verifyToken({ token, signature: process.env.EMAIL_TOKEN });
//   if (!email) {
//     return next(new Error("In-valid token payload", { cause: 400 }));
//   }
//   const user = await userModel.findOneAndUpdate(
//     { email },
//     { confirmEmail: true }
//   );
//   if (!user) {
//     return next(new Error("Not registered account", { cause: 400 }));
//   }
//   return res.status(200);
// });

// generate refreshToken || confirm email

export const generateRefreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({ token, signature: process.env.EMAIL_TOKEN });
  if (!email) {
    return next(new Error("In-valid token payload", { cause: 400 }));
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Not registered account", { cause: 400 }));
  }
//   if (user.confirmEmail) {
//     return res.status(200).redirect(`${process.env.FE_URL}/#/login`);
//   }
  // const newToken = generateToken({
  //   payload: { email },
  //   signature: process.env.EMAIL_TOKEN,
  //   expiresIn: 60 * 2,
  // });

 });


// login

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Not registered account", { cause: 404 }));
  }
//   if (!user.confirmEmail) {
//     return next(new Error("please confirm your email first", { cause: 400 }));
//   }
  // const hashedPassword = hash({ plaintext: password });
  // if (hashedPassword !== user.password) {
  //   return next(new Error("Invalid password", { cause: 400 }));
  // }

  if(!compare({plaintext: password , hashValue: user.password})){
    return next(new Error("In-valid login data", { cause: 400 }));
  }
  const access_token = generateToken({
    payload: { id: user._id, role: user.role },
    expiresIn: 60 * 60 * 60 * 60,
  });
  const refresh_token = generateToken({
    payload: { email },
    expiresIn: 60 * 60 * 24 * 365,
  });

  user.status = "online";
  await user.save();

  return res
    .status(200)
    .json({ message: "Success", access_token, refresh_token });
});


// send code

export const sendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const code = Math.floor(Math.random() * (9999 - 1000) + 1000);
  const user = await userModel.findOneAndUpdate({ email }, { code });
  if (!user) {
    return next(new Error("In-valid account", { cause: 400 }));
  }

  if (!(await sendEmail({ to: email, subject: "forget password", html }))) {
    return next(new Error("code not sent", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done" });
});

//forget password

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, password, code } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("In-valid account", { cause: 400 }));
  }
  if (user.code != parseInt(code)) {
    return next(new Error("In-valid reset code", { cause: 400 }));
  }
  user.password = hash({ plaintext: password });
  user.forgetPassword = null;
  user.changePasswordTime = Date.now();
  await user.save();

  return res.status(200).json({ message: "Done" });
});
