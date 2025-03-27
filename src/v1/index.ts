import express from "express"
import UserRoutes from "../v1/controller/Users"
import ProductRoutes from "../v1/controller/Products";
import CategoryRoute from "../v1/controller/categories";
import FeedbackRoutes from "../v1/controller/Feedback";
import CartRoute from "../v1/controller/Cart";
import OrderRoute from "../v1/controller/Order";
import CheckOutRoute from "../v1/controller/CheckOut";

const router = express.Router();

router.use("/api/users", UserRoutes);
router.use("/api/products", ProductRoutes);
router.use("/api/category", CategoryRoute);
router.use("/api/feedback", FeedbackRoutes);
router.use("/api/cart", CartRoute);
router.use("/api/order", OrderRoute);
router.use("/api/checkout", CheckOutRoute);

module.exports = router;