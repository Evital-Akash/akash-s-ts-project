import { userAuth } from "../library/authentication";
import { Userdb } from "./../model/Users";
import express from "express";
import Joi from "joi";
import { fileHandler } from "../library/ImageUpload";
import { functions } from "../library/function";
import { validations } from "../library/validations";


const router = express.Router();

router.get("/getAllUsers", getAllUsers);
router.get("/getSingleUser", userAuth, getSingleUsers);
router.delete("/deleteUsers", deleteUser);
router.post("/checkUser", checkEmailValidation, checkUserByEmail);
router.post("/register", registerValidation, register);
router.post("/login", loginVaidation, login);
router.post("/logout", logout);
router.post("/resendOtp", checkEmailValidation, resendOTP);
router.post("/verifyOtp", verifyOtp);
router.post("/forgotPassword", userAuth, forgotPassword);
router.post("/resetPassword", userAuth, resetPasswordValidation, resetPassword);
router.put("/updateProfile/:id", fileHandler, userAuth, updateProfile);

// -------------------------- get currently loged in users ---------------------------------
let functionObj = new functions();

async function getSingleUsers(req: any, res: any, next: any) {
  try {
    const token = res.locals.user;
    // console.log(token);
    const userObj = new Userdb();
    let result: any = await userObj.getSingleUsers(token);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ------------------------------ register --------------------------------------------

function registerValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_name: Joi.string().trim().replace(/'/g, "''").required(),
    u_email: Joi.string().email().replace(/'/g, "''").trim().exist().required(),
    u_password: Joi.string().trim().replace(/'/g, "''").min(6).max(30).pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).required().messages({
      "string.pattern.base":
        "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
      "string.min": "Password must be at least 6 characters long.",
    }),
    u_mobile: Joi.string().trim().pattern(/^\d{10}$/).required().messages({
      "string.pattern.base": "Mobile number must be exactly 10 digits.",
    }),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function register(req: any, res: any, next: any) {
  try {
    const ip = req.ip;
    const { u_name, u_email, u_password, u_mobile } = req.body;
    const dbObj = new Userdb();
    let result: any = await dbObj.register(u_name, u_email, u_password, u_mobile, ip);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, "REGISTER_SUCCESS", result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------------------- login ------------------------------------------

function loginVaidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_email: Joi.string().email().trim().replace(/'/g, "''").exist().required(),
    u_password: Joi.string().trim().replace(/'/g, "''").min(6).max(30).required(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}


async function login(req: any, res: any, next: any) {
  try {
    const { u_email, u_password } = req.body;
    const userObj = new Userdb();
    let result: any = await userObj.login(u_email, u_password);

    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    res.cookie("token", result.data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    return res.send(functionObj.output(1, "LOGIN_SUCCESS", result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------------------- check uer exist or not ---------------------------------------
function checkEmailValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_email: Joi.string().trim().replace(/'/g, "''").email().exist().required(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}


async function checkUserByEmail(req: any, res: any, next: any) {
  try {
    const { u_email } = req.body;
    const userObj = new Userdb();
    let result: any = await userObj.checkUserByEmail(u_email);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, "USER_EXIST", result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------------------- get all users -------------------------------------------

async function getAllUsers(req: any, res: any, next: any) {
  try {
    const userObj = new Userdb();
    let result: any = await userObj.getAllUsers();
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, "GET_ALL_USER", result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ------------------------------------- verify OTP --------------------------------------------

async function verifyOtp(req: any, res: any, next: any) {
  try {
    const { u_email, u_otp } = req.body;
    let userObj = new Userdb();
    let result: any = await userObj.verifyOtp(u_email, u_otp);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, "OTP_VERIFY", result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ------------------------------------ resend otp ---------------------------------------------

async function resendOTP(req: any, res: any, next: any) {
  try {
    const { u_email } = req.body;
    const dbObj = new Userdb();
    if (!u_email) {
      return res.send({ status_code: '0', status_message: "email is required.." });
    }
    let result: any = await dbObj.resendOtp(u_email);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// --------------------------------- delete by id ----------------------------------------------

async function deleteUser(req: any, res: any, next: any) {
  try {
    const { id } = req.body;
    let userObj = new Userdb();
    let result = await userObj.deleteUser(id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ----------------------------------- logout ------------------------------------------------------------

async function logout(req: any, res: any) {
  try {
    try {
      res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", });
      res.status(201).json({ status_code: 1, status_message: "Logout Success.." });
    } catch (error) {
      res.status(500).json({ message: "Internal server error...", error: error });
    }
  } catch (error) {
    return functionObj.output(0, "Internal server error");
  }
}

// ----------------------------------- forgot password --------------------------------------------------

async function forgotPassword(req: any, res: any, next: any) {
  try {
    const { u_email } = req.body;
    const userObj = new Userdb();
    let result: any = await userObj.forgotPassword(u_email);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, "OTP_SEND", result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ------------------------------------ reset password -------------------------------------------------

function resetPasswordValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_password: Joi.string().trim().replace(/'/g, "''").min(6).max(30).pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).required().messages({
      "string.pattern.base":
        "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
      "string.min": "Password must be at least 6 characters long.",
    }),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}


async function resetPassword(req: any, res: any, next: any) {
  try {
    const id = res.locals.user;
    const { u_password } = req.body;
    const dbObj = new Userdb();
    let result: any = await dbObj.resetPassword(id, u_password);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// -------------------------------------- update profile ---------------------------------------------------

async function updateProfile(req: any, res: any, next: any) {
  try {
    const userID = req.params.id;
    const u_img: string = req.body.img || "";
    const { u_email, u_name, u_mobile } = req.body;
    let userObj = new Userdb();

    if (u_email) {
      return res.status(401).json({ status_code: 0, status_message: "Email can't be changed.." });
    }
    let result: any = await userObj.updateProfile(u_name, u_mobile, userID, u_img);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

export default router;
