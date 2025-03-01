import express from "express";
import { Categorydb } from "../model/Categories";
import { AdminAuth } from "../library/authentication";
import { functions } from "../library/function";

const router = express.Router();

router.post("/createCategory", AdminAuth, createCategory);
router.get("/getAllCategory", getAllCategories);
router.delete("/deleteCategory", AdminAuth, deleteCategory);

// ---------------------- create categories -----------------------------------
let functionObj = new functions();

async function createCategory(req: any, res: any, next: any) {
  try {
    const categoryObj = new Categorydb();
    const { cat_name } = req.body;
    let result: any = await categoryObj.createCategories(cat_name);
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
    const { id } = req.body;
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
