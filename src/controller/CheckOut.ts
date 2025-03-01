import express from "express";
import { Checkoutdb } from "../model/Checkout";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";
import { validations } from "../library/validations";

const router = express.Router();

router.post("/addShippingAddress", addressValidations, userAuth, addShippingAddress);
router.get("/getCurrentUserAddress", userAuth, getCurrentUserShippingAddress);
router.delete("/deleteAddress", userAuth, deleteShippingAddress);

// ------------------ add shipping_address --------------------------------
let functionObj = new functions();

function addressValidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    sh_address1: Joi.string().trim().replace(/'/g, "''").required(),
    sh_address2: Joi.string().trim().replace(/'/g, "''").required(),
    sh_city: Joi.string().replace(/'/g, "''").trim().required(),
    sh_state: Joi.string().replace(/'/g, "''").trim().required(),
    sh_country: Joi.string().replace(/'/g, "''").trim().required(),
    sh_latitude: Joi.string().replace(/'/g, "''").trim().required(),
    sh_logitude: Joi.string().replace(/'/g, "''").trim().required(),
    sh_pincode: Joi.string().replace(/'/g, "''").pattern(/^\d{6}$/).required(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function addShippingAddress(req: any, res: any, next: any) {
  try {
    const { sh_address1, sh_address2, sh_city, sh_state, sh_country, sh_pincode, sh_latitude, sh_logitude, } = req.body;

    const token = res.locals.user;

    const checkoutObj = new Checkoutdb();
    let result: any = await checkoutObj.addShippingAddress(sh_address1, sh_address2, sh_city, sh_state, sh_country, sh_pincode, sh_latitude, sh_logitude, token);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ----------------- get shipping address -------------------------------

async function getCurrentUserShippingAddress(req: any, res: any, next: any) {
  try {
    const checkoutObj = new Checkoutdb();
    const id = res.locals.user;
    let result: any = await checkoutObj.getCurrentUserShippingAddress(id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ----------------- delete address by id -----------------------------

async function deleteShippingAddress(req: any, res: any, next: any) {
  try {
    const checkoutObj = new Checkoutdb();
    const { id } = req.body;
    let result: any = await checkoutObj.deleteShippingAddress(id);
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
