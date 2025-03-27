import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";

type UploadFile = fileUpload.UploadedFile;

const UploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UploadDirectory)) {
  fs.mkdirSync(UploadDirectory, { recursive: true });
}

export const fileHandler = (fieldName: string, folder: string, isOptional = false) => async (req: any, res: any, next: any): Promise<any> => {
  if (!req.files || !req.files[fieldName]) {
    if (isOptional) {
      req.body[fieldName] = undefined;
      return next();
    }
    return res.status(400).json({ status_code: 0, status_message: `No ${fieldName} uploaded.` });
  }

  const targetFolder = path.join(UploadDirectory, folder);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }
  const files = Array.isArray(req.files[fieldName]) ? req.files[fieldName] : [req.files[fieldName]];
  const uploadedFileNames: string[] = [];

  for (const file of files) {
    const fileName = await saveFile(file as UploadFile, targetFolder);
    if (!fileName) {
      return res.status(500).json({ status_code: 0, status_message: "Error saving file." });
    }
    uploadedFileNames.push(`${fileName}`);
  }
  req.body[fieldName] = uploadedFileNames.length === 1 ? uploadedFileNames[0] : uploadedFileNames;
  next();
};


const saveFile = async (file: UploadFile, targetFolder: string): Promise<string> => {
  if (!file || !file.name) {
    console.error("File or file name is missing.");
    return "";
  }
  const timestamp = Date.now();
  const uniqueName = `${timestamp}_${file.name}`;
  const uploadPath = path.join(targetFolder, uniqueName);
  try {
    await file.mv(uploadPath);
    return uniqueName;
  } catch (error) {
    console.error("File saving error:", error);
    return "";
  }
};