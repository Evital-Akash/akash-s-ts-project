import express from "express";
import { Checkoutdb } from "../model/Checkout";
import { AdminAuth, userAuth } from "../library/authentication";
import { addressValidations } from "../library/validations";

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
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ----------------- get shipping address -------------------------------

async function getAllShippingAddress(req: any, res: any) {
  try {
    const checkoutObj = new Checkoutdb();
    let result: any = await checkoutObj.getAllShippingAddress();
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ----------------- delete address by id -----------------------------

async function deleteShippingAddress(req: any, res: any) {
  try {
    const checkoutObj = new Checkoutdb();
    const id = req.params.id;

    let result: any = await checkoutObj.deleteShippingAddress(id);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

export default router;
