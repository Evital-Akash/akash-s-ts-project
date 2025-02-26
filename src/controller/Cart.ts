import express from "express";
import { Cartdb } from "../model/Cart";
import { userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";

const router = express.Router();

router.post("/addTocart", userAuth, addTocartValidation, addUpdateCart);
router.get("/getAllcartProducts", getAllCartProducts);
router.delete("/removeCartItems/:id", removeCartItems);

// ----------------- add product to cart ------------------------------------------

let functionObj = new functions();

function addTocartValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    product_id: Joi.number().greater(0).required(),
    cart_quantity: Joi.number().greater(0).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}
async function addUpdateCart(req: any, res: any) {
  try {
    const Cartobj = new Cartdb();
    const token = res.locals.user;
    const { product_id, cart_quantity } = req.body;

    let result: any = await Cartobj.addUpdateCart(
      product_id,
      cart_quantity,
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

// ---------------------- get all cart products --------------------------------

async function getAllCartProducts(req: any, res: any) {
  try {
    const Cartobj = new Cartdb();
    let result: any = await Cartobj.allRecords();
    return functionObj.output(201, 1, "get success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ----------------------remove cart items ----------------------------------

async function removeCartItems(req: any, res: any) {
  try {
    const Cartobj = new Cartdb();
    const id = req.params.id;

    let result: any = await Cartobj.deleteRecord(id);
    return functionObj.output(200, 1, "delete success..", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

export default router;
