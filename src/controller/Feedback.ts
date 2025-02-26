import express from "express";
import { Feedbackdb } from "../model/Feedback";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";

const router = express.Router();

router.post("/addFeedback", userAuth, addFeedbackValidations, addFeedback);
router.get("/getAllFeedback", getAllFeedback);
router.delete("/deleteFeedback/:id", AdminAuth, deleteFeedback);

let functionObj = new functions();

// ---------------------- add feedbacks ------------------------------

function addFeedbackValidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    r_rating: Joi.number().max(5).required(),
    r_comment: Joi.string().replace(/\s+/g, " ").required(),
    r_img: Joi.required(),
    product_id: Joi.number().greater(0).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  req.body = value;
  next();
}


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
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

async function getAllFeedback(req: any, res: any) {
  try {
    const feedbackObj = new Feedbackdb();

    let result: any = await feedbackObj.allRecords();
    return functionObj.output(201, 1, "get success", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}

async function deleteFeedback(req: any, res: any) {
  try {
    const id = req.params.id;
    const feedbackObj = new Feedbackdb();

    let result: any = await feedbackObj.deleteRecord(id);
    return functionObj.output(200, 1, "delete success..", result);
  } catch (error) {
    return functionObj.output(500, 0, "Internal server error", error);
  }
}
export default router;
