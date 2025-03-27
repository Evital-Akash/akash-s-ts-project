import express from "express";
import { Orderdb } from "../model/Order";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Stripe from "stripe";
import { sendMail } from "../library/sendMail";
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
router.post("/createOrder/create", userAuth, placeOrder);
router.post("/createOrder/success", successOrders);
router.get("/getAllorders", getAllorders);
router.get("/getAllorderItems", getAllorderItems);
router.get("/getCurrentUserOrders", userAuth, getCurrentUserOrders);
router.delete("/deleteOrders", AdminAuth, deleteOrders);
router.put("/updateOrderStatus/:id", AdminAuth, updateorderStatus);

// --------------------- create new orders -------------------------------------

let functionObj = new functions();

async function placeOrder(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    const token = res.locals.user;
    const { cartItems } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.send(functionObj.output(0, "NO ITEMS FOUND IN CART TO ORDER."));
    }
    let result: any = await orderObj.createOrder(token, cartItems);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ------------ success order --------------------------------------------

async function successOrders(req: any, res: any, next: any) {
  try {
    const ip = req.ip;
    const { session_id } = req.body;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID is required." });
    }
    const session: any = await stripe.checkout.sessions.retrieve(session_id);
    if (!session || session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed." });
    }

    const orderObj = new Orderdb();
    let result: any = await orderObj.handlePaymentSuccess(session.id, ip);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }

    const paymentIntentId = session.payment_intent;
    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ success: false, message: "Payment Intent ID not found." });
    }

    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
    });

    if (!charges.data.length) {
      return res
        .status(400)
        .json({ success: false, message: "Charge not found." });
    }
    const receiptUrl = charges.data[0].receipt_url;
    const customerEmail = session.customer_details?.email;

    if (customerEmail && receiptUrl) {
      sendMail(
        customerEmail,
        "🛍️ Your E-Shopper Order Receipt",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #2C3E50; margin: 0;">🛍️ E-Shopper</h1>
        <h3 style="color: #27AE60;">Thank You for Your Purchase!</h3>
      </div>
      <p style="font-size: 16px; color: #333;">Dear Customer,</p>
      <p style="font-size: 16px; color: #333;">
        We appreciate your order and hope you enjoy your purchase. You can download your receipt using the link below.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${receiptUrl}" target="_blank" 
           style="background-color: #3498DB; color: #fff; text-decoration: none; 
                  padding: 12px 20px; border-radius: 5px; display: inline-block; font-size: 16px;">
          🧾 Download Your Receipt
        </a>
      </div>
      <p style="font-size: 14px; color: #555;">
        If you have any questions, feel free to contact our support team at 
        <a href="mailto:support@eshopper.com" style="color: #3498DB; text-decoration: none;">support@eshopper.com</a>.
      </p>
      <hr style="border: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 14px; color: #777; text-align: center;">
        📦 Happy Shopping! | E-Shopper Team
      </p>
    </div>
    `
      );
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    console.error("Error in webhook handler:", error);
    next(error);
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

// -------------------- update orderStatus -------------------------------------------
async function updateorderStatus(req: any, res: any, next: any) {
  try {
    const orderObj = new Orderdb();
    const { id } = req.params;
    const { o_status } = req.body;
    let result: any = await orderObj.updateorderStatus(id, o_status);
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
