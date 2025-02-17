import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";

type UploadFile = fileUpload.UploadedFile;

const UploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UploadDirectory)) {
  fs.mkdirSync(UploadDirectory, { recursive: true });
}

export const fileHandler = (req: any, res: any, next: any): any => {
  if (!req.files || !req.files.img) {
    return res
      .status(401)
      .json({ status_code: 0, status_message: "image is not found.." });
  }

  const files = req.files.img;
  let uploadedImages: string[] = [];

  if (Array.isArray(files)) {
    console.log(`Uploading ${files.length} files...`);
    files.forEach((file: UploadFile) => {
      const fileName = saveFile(file);
      if (fileName) {
        uploadedImages.push(fileName);
      }
    });
  } else {
    console.log("Uploading 1 file...");
    const fileName = saveFile(files);
    if (fileName) {
      uploadedImages.push(fileName);
    }
  }
  req.body.img = uploadedImages;
  next();
};

const saveFile = (file: UploadFile): string => {
  if (!file || !file.name) {
    console.error("File or file name is missing.");
    return "";
  }
  const timestamp = Date.now();
  const uniquename = `${timestamp}_${file.name}`;
  const uploadPath = path.join(UploadDirectory, uniquename);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error while saving file:", err);
    } else {
      console.log("File uploaded successfully:", uniquename);
    }
  });
  return uniquename;
};
