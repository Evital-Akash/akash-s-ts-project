import express from "express";
import { Productdb } from "../model/Products";
import { AdminAuth } from "../library/authentication";
import { fileHandler } from "../library/ImageUpload";
import { functions } from "../library/function";
import Joi from "joi";
import { validations } from "../library/validations";

const router = express.Router();

router.post("/addProducts", fileHandler("img", "Products"), productValidations, AdminAuth, addProducts);
router.get("/getAllProducts", getAllProducts);
router.delete("/deleteProducts/:id", deleteProducts);
router.put("/updateProducts/:id", AdminAuth, UpdateProductValidation, updateProducts);
router.get("/searchProducts", serachProducts);
router.get("/getProductById/:id", getProductDetailById);
router.get("/getByCategoryId/:cat_id", getByCategoryId);

// --------------------- add new products ---------------------------------------

function productValidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    p_name: Joi.string().trim().replace(/'/g, "''").exist().required(),
    p_desc: Joi.string().replace(/'/g, "''").required(),
    p_brand: Joi.string().replace(/'/g, "''").required(),
    p_price: Joi.number().greater(0).required(),
    p_qnt: Joi.number().greater(0).required(),
    cat_id: Joi.number().greater(0).required(),
    p_hsn_code: Joi.string().trim().replace(/'/g, "''").required(),
    p_discount: Joi.number().greater(0).required(),
  });

  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}
let functionObj = new functions();
async function addProducts(req: any, res: any, next: any) {
  try {
    const { p_name, p_desc, p_brand, p_price, p_qnt, cat_id, p_hsn_code, p_discount, } = req.body;
    const ip = req.ip;
    const img = req.body.img;
    const images = Array.isArray(req.files.img) ? req.files.img : [req.files.img];
    const serverURL = "http://localhost:8080";
    const imagePath = `${serverURL}/uploads/Products/${img}`;
    const ProductObj = new Productdb();
    let result: any = await ProductObj.addProducts(p_name, p_desc, p_brand, p_price, p_qnt, cat_id, p_hsn_code, p_discount, imagePath, ip);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// --------------------- get All products -------------------------------------
async function getAllProducts(req: any, res: any, next: any) {
  try {
    const productObj = new Productdb();
    let result: any = await productObj.getAllProducts();
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------- delete products ----------------------------------
async function deleteProducts(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json(functionObj.output(0, "Category ID is required"));
    }
    const productObj = new Productdb();
    let result: any = await productObj.deleteProducts(id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------- update products --------------------------------------

function UpdateProductValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    p_name: Joi.string().trim().replace(/'/g, "''").required(),
    p_desc: Joi.string().min(10).max(100).replace(/'/g, "''").required(),
    p_brand: Joi.string().replace(/'/g, "''").required(),
    p_price: Joi.number().greater(0).required(),
    p_qnt: Joi.number().required(),
  });

  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function updateProducts(req: any, res: any, next: any) {
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
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ---------------------- search products -------------------------------------
async function serachProducts(req: any, res: any, next: any) {
  try {
    const searchValue = req.query.word;
    const productObj = new Productdb();
    let result: any = await productObj.searchProduct(searchValue);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}
// ------------- get products by id ---------------------------------------
async function getProductDetailById(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const productObj = new Productdb();
    let result: any = await productObj.getProductById(id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  }
  catch (error) {
    next(error);
    return;
  }
}

// -----------------------------------get by category id --------------------
async function getByCategoryId(req: any, res: any, next: any) {
  try {
    const cat_id = req.params.cat_id ? parseInt(req.params.cat_id, 10) : null;
    const productObj = new Productdb();
    let result;
    if (cat_id) {
      result = await productObj.getBycategoryID(cat_id);
    } else {
      result = await productObj.getAllProducts();
    }
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  }
  catch (error) {
    next(error);
    return;
  }
}

export default router;
