import express from "express";
import { Categorydb } from "../model/Categories";
import { AdminAuth } from "../library/authentication";

const router = express.Router();

router.post("/createCategory", AdminAuth, createCategory);
router.get("/getAllCategory", getAllCategories);
router.delete("/deleteCategory/:id", AdminAuth, deleteCategory);

// ---------------------- create categories -----------------------------------

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
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// ------------------- get all categories ---------------------------------------

async function getAllCategories(req: any, res: any) {
  try {
    const categoryObj = new Categorydb();
    let result: any = await categoryObj.getAllCategories();

    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

// -------------------------- delete category by id ---------------------------------

async function deleteCategory(req: any, res: any) {
  try {
    const categoryObj = new Categorydb();
    const id = req.params.id;
    let result: any = await categoryObj.deleteCategory(id);

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
