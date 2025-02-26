import { userAuth } from "../library/authentication";
import { Userdb } from "./../model/Users";
import express from "express";
import Joi from "joi";
import { fileHandler } from "../library/ImageUpload";
import { functions } from "../library/function";

const router = express.Router();

router.get("/getAllUsers", getAllUsers);
router.get("/getSingleUser", userAuth, getSingleUsers);

router.delete("/deleteUsers/:id", deleteUser);

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

async function getSingleUsers(req: any, res: any) {
  try {
    const token = res.locals.user;

    const userObj = new Userdb();
    let result: any = await userObj.getSingleUsers(token);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ------------------------------ register --------------------------------------------


function registerValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_name: Joi.string().trim().replace(/'/g, "''").required(),
    u_email: Joi.string().email().replace(/'/g, "''").trim().exist().required(),
    u_password: Joi.string()
      .trim()
      .replace(/'/g, "''")
      .min(6)
      .max(30)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
        "string.min": "Password must be at least 6 characters long.",
      }),
    u_mobile: Joi.string()
      .trim()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Mobile number must be exactly 10 digits.",
      }),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}

async function register(req: any, res: any, next: any) {
  try {
    const ip = req.ip;
    const { u_name, u_email, u_password, u_mobile } = req.body;
    const dbObj = new Userdb();
    let result: any = await dbObj.register(
      u_name,
      u_email,
      u_password,
      u_mobile,
      ip
    );

    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ---------------------------------- login ------------------------------------------

function loginVaidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_email: Joi.string().email().trim().replace(/'/g, "''").exist().required(),
    u_password: Joi.string()
      .trim()
      .replace(/'/g, "''")
      .min(6)
      .max(30)
      .required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}


async function login(req: any, res: any) {
  try {
    const { u_email, u_password } = req.body;
    const userObj = new Userdb();

    let result: any = await userObj.login(u_email, u_password);

    res.cookie("token", result.data, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS)
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 3600000, // 1 hour expiration
    });

    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ---------------------------------- check uer exist or not ---------------------------------------
function checkEmailValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_email: Joi.string().trim().replace(/'/g, "''").email().exist().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}


async function checkUserByEmail(req: any, res: any) {
  try {
    const { u_email } = req.body;

    const userObj = new Userdb();

    let result: any = await userObj.checkUserByEmail(u_email);
    return res
      .status(result.status_code)
      .json({ status: result.status, message: result.status_message });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ---------------------------------- get all users -------------------------------------------

async function getAllUsers(req: any, res: any) {
  try {
    const userObj = new Userdb();
    let result: any = await userObj.allRecords();
    return functionObj.output(201, 1, "get success..", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ------------------------------------- verify OTP --------------------------------------------

async function verifyOtp(req: any, res: any) {
  try {
    const { u_email, u_otp } = req.body;
    let userObj = new Userdb();

    let result: any = await userObj.verifyOtp(u_email, u_otp);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ------------------------------------ resend otp ---------------------------------------------

async function resendOTP(req: any, res: any) {
  try {
    const { u_email } = req.body;
    const dbObj = new Userdb();
    if (!u_email) {
      return res
        .status(401)
        .json({ status: 0, status_message: "Invalid Input Parameter" });
    }

    let result: any = await dbObj.resendOtp(u_email);

    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// --------------------------------- delete by id ----------------------------------------------

async function deleteUser(req: any, res: any) {
  try {
    const userID = req.params.id;
    let userObj = new Userdb();

    let result = await userObj.deleteRecord(userID);

    return functionObj.output(201, 1, "delete success..", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ----------------------------------- logout ------------------------------------------------------------

async function logout(req: any, res: any) {
  try {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res
        .status(201)
        .json({ status_code: 1, status_message: "Logout Success.." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error...", error: error });
    }
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ----------------------------------- forgot password --------------------------------------------------

async function forgotPassword(req: any, res: any) {
  try {
    const { u_email } = req.body;
    const userObj = new Userdb();

    let result2: any = await userObj.forgotPassword(u_email);
    return res
      .status(result2.status_code)
      .json({ status: result2.status, message: result2.status_message });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ------------------------------------ reset password -------------------------------------------------

function resetPasswordValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    u_email: Joi.string().trim().replace(/'/g, "''").email().exist().required(),
    u_password: Joi.string()
      .trim()
      .replace(/'/g, "''")
      .min(6)
      .max(30)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
        "string.min": "Password must be at least 6 characters long.",
      }),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}


async function resetPassword(req: any, res: any) {
  try {
    const { id, u_password } = req.body;
    const dbObj = new Userdb();
    let result: any = await dbObj.resetPassword(id, u_password);

    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// -------------------------------------- update profile ---------------------------------------------------

async function updateProfile(req: any, res: any) {
  try {
    const userID = req.params.id;
    const u_img: string = req.body.img || "";
    const { u_email, u_name, u_mobile } = req.body;
    let userObj = new Userdb();

    if (u_email) {
      return res
        .status(401)
        .json({ status_code: 0, status_message: "Email can't be changed.." });
    }
    let result = await userObj.updateProfile(u_name, u_mobile, userID, u_img);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

export default router;
