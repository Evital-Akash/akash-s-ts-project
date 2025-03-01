import express from "express";
import { Orderdb } from "../model/Order";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";
import { validations } from "../library/validations";
const router = express.Router();

router.post("/createOrder", userAuth, placeOrdersvalidations, placeOrder);
router.get("/getAllorders", AdminAuth, getAllorders);

router.get("/getAllorderItems", AdminAuth, getAllorderItems);
router.get("/getCurrentUserOrders", userAuth, getCurrentUserOrders);

router.delete("/deleteOrders", AdminAuth, deleteOrders);

// --------------------- create new orders -------------------------------------

let functionObj = new functions();

function placeOrdersvalidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    o_discounts: Joi.number().greater(0).required(),
    p_gst_percentage: Joi.number().valid(0, 5, 12, 18, 28).greater(0).required(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function placeOrder(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    const token = res.locals.user;
    const { o_discounts, p_gst_percentage } = req.body;
    let result: any = await orderObj.createOrder(o_discounts, p_gst_percentage, token);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------- get all orders ------------------------------------

async function getAllorders(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    let result: any = await orderObj.getAllorders();
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ----------------------- get all order items table -------------------------

async function getAllorderItems(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    let result: any = await orderObj.getAllOrderItems();
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------- delete orders ---------------------------------

async function deleteOrders(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    const { id } = req.body;
    let result: any = await orderObj.deleteOrders(id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// -------------------------- get current user orders ------------------------------

async function getCurrentUserOrders(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    const id = res.locals.user;
    let result: any = await orderObj.getCurrentUserOrders(id);
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
