import express from "express";
import { Productdb } from "../model/Products";
import {
  productValidations,
  UpdateProductValidation,
} from "../library/validations";
import { AdminAuth } from "../library/authentication";
import { fileHandler } from "../library/ImageUpload";

const router = express.Router();

router.post(
  "/addProducts",
  fileHandler,
  AdminAuth,
  productValidations,
  addProducts
);
router.get("/getAllProducts", getAllProducts);
router.delete("/deleteProducts/:id", AdminAuth, deleteProducts);
router.put(
  "/updateProducts/:id",
  AdminAuth,
  UpdateProductValidation,
  updateProducts
);

router.get("/searchProducts", serachProducts);

// --------------------- add new products ---------------------------------------

async function addProducts(req: any, res: any) {
  try {
    const p_img: string = req.body.img || "";
    const ip = req.ip;
    const {
      p_name,
      p_desc,
      p_brand,
      p_price,
      p_qnt,
      cat_id,
      p_hsn_code,
      p_discount,
    } = req.body;

    const ProductObj = new Productdb();
    let result: any = await ProductObj.addProducts(
      p_name,
      p_desc,
      p_brand,
      p_price,
      p_qnt,
      cat_id,
      p_hsn_code,
      p_discount,
      p_img,
      ip
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

// --------------------- get All products -------------------------------------

async function getAllProducts(req: any, res: any) {
  try {
    const productObj = new Productdb();
    let result: any = await productObj.getallProducts();
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ---------------------- delete products ----------------------------------

async function deleteProducts(req: any, res: any) {
  try {
    const p_id = req.params.id;
    const productObj = new Productdb();
    let result: any = await productObj.deleteProducts(p_id);
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ---------------------- update products --------------------------------------

async function updateProducts(req: any, res: any) {
  try {
    const id = req.params.id;
    const { p_name, p_desc, p_brand, p_price, p_qnt } = req.body;
    const productObj = new Productdb();

    let result: any = await productObj.updateProducts(
      p_name,
      p_desc,
      p_brand,
      p_price,
      p_qnt,
      id
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

// ---------------------- search products -------------------------------------

async function serachProducts(req: any, res: any) {
  try {
    const searchValue = req.query.word;
    const productObj = new Productdb();

    let result: any = await productObj.searchProduct(searchValue);

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
