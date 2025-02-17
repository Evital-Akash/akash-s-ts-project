import express from "express";
import { Cartdb } from "../model/Cart";
import { userAuth } from "../library/authentication";
import { addTocartValidation } from "../library/validations";

const router = express.Router();

router.post("/addTocart", userAuth, addTocartValidation, addTocart);
router.get("/getAllcartProducts", getAllCartProducts);
router.delete("/removeCartItems/:id", removeCartItems);

// ----------------- add product to cart ------------------------------------------

async function addTocart(req: any, res: any) {
  try {
    const Cartobj = new Cartdb();
    const token = res.locals.user;
    const { product_id, cart_quantity } = req.body;

    let result: any = await Cartobj.addTocart(product_id, cart_quantity, token);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ---------------------- get all cart products --------------------------------

async function getAllCartProducts(req: any, res: any) {
  try {
    const Cartobj = new Cartdb();
    let result: any = await Cartobj.getAllCartProducts();
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ----------------------remove cart items ----------------------------------

async function removeCartItems(req: any, res: any) {
  try {
    const Cartobj = new Cartdb();
    const id = req.params.id;

    let result: any = await Cartobj.removeCartItems(id);
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
