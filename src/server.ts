import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import bodyparser from "body-parser";
import UserRoutes from "./controller/Users";
import ProductRoutes from "./controller/Products";
import CategoryRoute from "./controller/categories";
import FeedbackRoutes from "./controller/Feedback";
import CartRoute from "./controller/Cart";
import OrderRoute from "./controller/Order";
import CheckOutRoute from "./controller/CheckOut";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use(bodyparser.json());
app.use(cookieParser());

app.use("/api/users", UserRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/category", CategoryRoute);
app.use("/api/feedback", FeedbackRoutes);
app.use("/api/cart", CartRoute);
app.use("/api/order", OrderRoute);
app.use("/api/checkout", CheckOutRoute);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
