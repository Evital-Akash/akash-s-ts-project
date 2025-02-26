import express from "express";
import { Orderdb } from "../model/Order";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";
const router = express.Router();

router.post("/createOrder", userAuth, placeOrdersvalidations, placeOrder);
router.get("/getAllorders", AdminAuth, getAllorders);

router.get("/getAllorderItems", AdminAuth, getAllorderItems);
router.get("/getCurrentUserOrders/:id", userAuth, getCurrentUserOrders);

router.delete("/deleteOrders/:id", AdminAuth, deleteOrders);

// --------------------- create new orders -------------------------------------

let functionObj = new functions();

function placeOrdersvalidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    o_discounts: Joi.number().greater(0).required(),
    p_gst_percentage: Joi.number()
      .valid(0, 5, 12, 18, 28)
      .greater(0)
      .required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}

async function placeOrder(req: any, res: any) {
  try {
    const orderObj = new Orderdb();
    const token = res.locals.user;
    const { o_discounts, p_gst_percentage } = req.body;

    let result: any = await orderObj.createOrder(
      o_discounts,
      p_gst_percentage,
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

// ---------------------- get all orders ------------------------------------

async function getAllorders(req: any, res: any) {
  try {
    const orderObj = new Orderdb();
    let result: any = await orderObj.allRecords();
    return functionObj.output(201, 1, "get success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ----------------------- get all order items table -------------------------

async function getAllorderItems(req: any, res: any) {
  try {
    const orderObj = new Orderdb();
    let result: any = await orderObj.getAllOrderItems();
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ---------------------- delete orders ---------------------------------

async function deleteOrders(req: any, res: any) {
  try {
    const orderObj = new Orderdb();
    const id = req.params.id;
    let result: any = await orderObj.deleteOrders(id);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// -------------------------- get current user orders ------------------------------

async function getCurrentUserOrders(req: any, res: any) {
  try {
    const orderObj = new Orderdb();
    const id = req.params.id;
    let result: any = await orderObj.getCurrentUserOrders(id);
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
