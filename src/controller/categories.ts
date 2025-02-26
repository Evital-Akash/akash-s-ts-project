import express from "express";
import { Categorydb } from "../model/Categories";
import { AdminAuth } from "../library/authentication";
import { functions } from "../library/function";

const router = express.Router();

router.post("/createCategory", AdminAuth, createCategory);
router.get("/getAllCategory", getAllCategories);
router.delete("/deleteCategory/:id", AdminAuth, deleteCategory);

// ---------------------- create categories -----------------------------------
let functionObj = new functions();

async function createCategory(req: any, res: any) {
  try {
    const categoryObj = new Categorydb();
    const { cat_name } = req.body;

    let result: any = await categoryObj.createCategories(cat_name);

    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// ------------------- get all categories ---------------------------------------

async function getAllCategories(req: any, res: any) {
  try {
    const categoryObj = new Categorydb();
    let result: any = await categoryObj.allRecords();
    return functionObj.output(201, 1, "get success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

// -------------------------- delete category by id ---------------------------------

async function deleteCategory(req: any, res: any) {
  try {
    const categoryObj = new Categorydb();
    const id = req.params.id;
    let result: any = await categoryObj.deleteRecord(id);
    return functionObj.output(200, 1, "delete success..", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

export default router;
