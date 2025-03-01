import express from "express";
import { Cartdb } from "../model/Cart";
import { userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";
import { validations } from "../library/validations";

const router = express.Router();

router.post("/addTocart", userAuth, addTocartValidation, addUpdateCart);
router.get("/getAllcartProducts", userAuth, getAllCartProducts);
router.delete("/removeCartItems", removeCartItems);

// ----------------- add product to cart ------------------------------------------

let functionObj = new functions();

function addTocartValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    product_id: Joi.number().greater(0).required(),
    cart_quantity: Joi.number().greater(0).required(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function addUpdateCart(req: any, res: any, next: any) {
  try {
    const Cartobj = new Cartdb();
    const token = res.locals.user;
    const { product_id, cart_quantity } = req.body;
    let result: any = await Cartobj.addUpdateCart(product_id, cart_quantity, token);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------- get all cart products --------------------------------

async function getAllCartProducts(req: any, res: any, next: any) {
  try {
    const user_id = res.locals.user;
    console.log("u-id", user_id);
    const Cartobj = new Cartdb();
    let result: any = await Cartobj.getAllCartProducts(user_id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ----------------------remove cart items ----------------------------------

async function removeCartItems(req: any, res: any, next: any) {
  try {
    const Cartobj = new Cartdb();
    const { id } = req.body;
    let result: any = await Cartobj.removeCartItems(id);
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
