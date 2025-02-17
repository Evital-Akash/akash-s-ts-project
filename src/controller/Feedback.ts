import express from "express";
import { Feedbackdb } from "../model/Feedback";
import { AdminAuth, userAuth } from "../library/authentication";
import { addFeedbackValidations } from "../library/validations";

const router = express.Router();

router.post("/addFeedback", userAuth, addFeedbackValidations, addFeedback);
router.get("/getAllFeedback", getAllFeedback);
router.delete("/deleteFeedback/:id", AdminAuth, deleteFeedback);

async function addFeedback(req: any, res: any) {
  try {
    const { r_rating, r_comment, r_img, product_id } = req.body;

    const feedbackObj = new Feedbackdb();

    let result: any = await feedbackObj.addFeedback(
      r_rating,
      r_comment,
      r_img,
      product_id
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

async function getAllFeedback(req: any, res: any) {
  try {
    const feedbackObj = new Feedbackdb();

    let result: any = await feedbackObj.getAllFeedbacks();
    return res.status(result.status_code).json({
      status: result.status,
      message: result.status_message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error...", error: error });
  }
}

async function deleteFeedback(req: any, res: any) {
  try {
    const id = req.params.id;
    const feedbackObj = new Feedbackdb();

    let result: any = await feedbackObj.deleteFeedback(id);
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
