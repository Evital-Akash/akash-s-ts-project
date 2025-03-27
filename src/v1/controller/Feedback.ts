import express from "express";
import { Feedbackdb } from "../model/Feedback";
import { AdminAuth, userAuth } from "../library/authentication";
import { functions } from "../library/function";
import Joi from "joi";
import { validations } from "../library/validations";
import { fileHandler } from "../library/ImageUpload";

const router = express.Router();

router.post("/addFeedback", userAuth, fileHandler("img", "Feedbacks", true), addFeedbackValidations, addFeedback);
router.get("/getAllFeedback/:product_id", getAllFeedback);
router.delete("/deleteFeedback", AdminAuth, deleteFeedback);

let functionObj = new functions();

// ---------------------- add feedbacks ------------------------------

function addFeedbackValidations(req: any, res: any, next: any) {
  const schema = Joi.object({
    r_rating: Joi.number().max(5).required(),
    r_comment: Joi.string().replace(/\s+/g, " ").required(),
    product_id: Joi.number().greater(0).required(),
  });
  const validationObj = new validations();
  if (!validationObj.validateRequest(req, res, next, schema)) {
    return;
  }
  next();
}

async function addFeedback(req: any, res: any, next: any) {
  try {
    const ip = req.ip;
    const { r_rating, r_comment, product_id } = req.body;
    const u_id = res.locals.user;
    let imagePath = null;
    if (req.body.img) {
      const img = req.body.img;
      const serverURL = "http://localhost:8080";
      imagePath = `${serverURL}/uploads/Feedbacks/${img}`;
    }
    const feedbackObj = new Feedbackdb();
    let result: any = await feedbackObj.addFeedback(
      r_rating,
      r_comment,
      imagePath,
      product_id,
      u_id,
      ip
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

// ----------------- get all feedbacks ---------------------------
async function getAllFeedback(req: any, res: any, next: any) {
  try {
    const { product_id } = req.params
    if (!product_id) {
      return res.send(functionObj.output(0, "Product ID is required."));
    }
    const feedbackObj = new Feedbackdb();
    let result: any = await feedbackObj.getAllFeedback(product_id);
    if (result?.error) {
      return res.send(functionObj.output(0, result.message));
    }
    return res.send(functionObj.output(1, result.message, result.data));
  } catch (error) {
    next(error);
    return;
  }
}

// -------------------- delete feedbacks ----------------------------------

async function deleteFeedback(req: any, res: any, next: any) {
  try {
    const { id } = req.body;
    const feedbackObj = new Feedbackdb();
    let result: any = await feedbackObj.deleteFeedback(id);
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
