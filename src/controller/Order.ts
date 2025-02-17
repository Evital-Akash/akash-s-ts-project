import express from "express";
import { Orderdb } from "../model/Order";
import { AdminAuth, userAuth } from "../library/authentication";
import { placeOrdersvalidations } from "../library/validations";
const router = express.Router();

router.post("/createOrder", userAuth, placeOrdersvalidations, placeOrder);
router.get("/getAllorders", AdminAuth, getAllorders);

router.get("/getAllorderItems", AdminAuth, getAllorderItems);
router.get("/getCurrentUserOrders/:id", userAuth, getCurrentUserOrders);

router.delete("/deleteOrders/:id", AdminAuth, deleteOrders);

// --------------------- create new orders -------------------------------------

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
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ---------------------- get all orders ------------------------------------

async function getAllorders(req: any, res: any) {
  try {
    const orderObj = new Orderdb();
    let result: any = await orderObj.getOrders();
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
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
    res.status(500).json({ message: "Internal server error...", error: error });
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
    res.status(500).json({ message: "Internal server error...", error: error });
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
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

export default router;
