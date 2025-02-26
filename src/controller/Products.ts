import express from "express";
import { Productdb } from "../model/Products";
import { AdminAuth } from "../library/authentication";
import { fileHandler } from "../library/ImageUpload";
import { functions } from "../library/function";
import Joi from "joi";

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

function productValidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    p_name: Joi.string().trim().replace(/'/g, "''").exist().required(),
    p_desc: Joi.string().replace(/'/g, "''").required(),
    p_brand: Joi.string().replace(/'/g, "''").required(),
    p_price: Joi.number().greater(0).required().max(5),
    p_qnt: Joi.number().greater(0).required(),
    cat_id: Joi.number().greater(0).required(),
    p_hsn_code: Joi.string().trim().replace(/'/g, "''").required(),
    p_discount: Joi.number().greater(0).required(),
    img: Joi.required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}

let functionObj = new functions();
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
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// --------------------- get All products -------------------------------------

async function getAllProducts(req: any, res: any) {
  try {
    const productObj = new Productdb();
    let result: any = await productObj.allRecords();
    return functionObj.output(201, 1, "get success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ---------------------- delete products ----------------------------------

async function deleteProducts(req: any, res: any) {
  try {
    const p_id = req.params.id;
    const productObj = new Productdb();
    let result: any = await productObj.deleteRecord(p_id);
    return functionObj.output(201, 1, "delete success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ---------------------- update products --------------------------------------

function UpdateProductValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    p_name: Joi.string().trim().replace(/'/g, "''").required(),
    p_desc: Joi.string().min(10).max(100).replace(/'/g, "''").required(),
    p_brand: Joi.string().replace(/'/g, "''").required(),
    p_price: Joi.number().greater(0).max(5).required(),
    p_qnt: Joi.number().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}

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
    return functionObj.output(500, 0, "Internal server error", error);
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
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

export default router;
