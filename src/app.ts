import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path"
import bodyParser from "body-parser";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization"
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "v1", "uploads")));


app.use('/v1', require('./v1'))

let port: any = process.env.PORT || 8080;

var server = app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

module.exports = server;
