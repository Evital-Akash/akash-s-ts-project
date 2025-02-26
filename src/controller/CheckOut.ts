import express from "express";
import { Checkoutdb } from "../model/Checkout";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";

const router = express.Router();

router.post(
  "/addShippingAddress",
  addressValidations,
  userAuth,
  addShippingAddress
);
router.get("/getAlladdress", AdminAuth, getAllShippingAddress);
router.delete("/deleteAddress/:id", userAuth, deleteShippingAddress);

// ------------------ add shipping_address --------------------------------
let functionObj = new functions();


function addressValidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    sh_address1: Joi.string().trim().replace(/'/g, "''").required(),
    sh_address2: Joi.string().trim().replace(/'/g, "''").required(),
    sh_city: Joi.string().replace(/'/g, "''").trim().required(),
    sh_state: Joi.string().replace(/'/g, "''").trim().required(),
    sh_country: Joi.string().replace(/'/g, "''").trim().required(),
    sh_pincode: Joi.string()
      .replace(/'/g, "''")
      .pattern(/^\d{6}$/)
      .required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}



async function addShippingAddress(req: any, res: any) {
  try {
    const {
      sh_address1,
      sh_address2,
      sh_city,
      sh_state,
      sh_country,
      sh_pincode,
      sh_latitude,
      sh_logitude,
    } = req.body;

    const token = res.locals.user;

    const checkoutObj = new Checkoutdb();
    let result: any = await checkoutObj.addShippingAddress(
      sh_address1,
      sh_address2,
      sh_city,
      sh_state,
      sh_country,
      sh_pincode,
      sh_latitude,
      sh_logitude,
      token
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

// ----------------- get shipping address -------------------------------

async function getAllShippingAddress(req: any, res: any) {
  try {
    const checkoutObj = new Checkoutdb();
    let result: any = await checkoutObj.allRecords();
    return functionObj.output(201, 1, "get success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ----------------- delete address by id -----------------------------

async function deleteShippingAddress(req: any, res: any) {
  try {
    const checkoutObj = new Checkoutdb();
    const id = req.params.id;

    let result: any = await checkoutObj.deleteRecord(id);
    return functionObj.output(200, 1, "delete success..", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

export default router;
