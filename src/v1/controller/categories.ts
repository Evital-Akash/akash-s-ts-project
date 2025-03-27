import express from "express";
import { Categorydb } from "../model/Categories";
import { AdminAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";
import { validations } from "../library/validations";

const router = express.Router();

router.post("/createCategory", CategoryAddValidation, createCategory);
router.get("/getAllCategory", getAllCategories);
router.delete("/deleteCategory/:id", deleteCategory);

// ---------------------- create categories -----------------------------------
let functionObj = new functions();

function CategoryAddValidation(req: any, res: any, next: any) {
  const schema = Joi.object({
    cat_name: Joi.string().required().exist(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function createCategory(req: any, res: any, next: any) {
  try {
    const ip = req.ip;
    const categoryObj = new Categorydb();
    const { cat_name } = req.body;
    let result: any = await categoryObj.createCategories(cat_name, ip);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// ------------------- get all categories ---------------------------------------
async function getAllCategories(req: any, res: any, next: any) {
  try {
    const categoryObj = new Categorydb();
    let result: any = await categoryObj.getAllCategories();
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// -------------------------- delete category by id ---------------------------------
async function deleteCategory(req: any, res: any, next: any) {
  try {
    const categoryObj = new Categorydb();
    const { id } = req.params;
    if (!id) {
      return res.status(400).json(functionObj.output(0, "Category ID is required"));
    }
    let result: any = await categoryObj.deleteCategory(id);
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
