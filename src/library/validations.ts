// import Joi from "joi";

// // --------------------------- register validation --------------------------------------

// export async function registerValidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     u_name: Joi.string().trim().replace(/'/g, "''").required(),
//     u_email: Joi.string().email().replace(/'/g, "''").trim().exist().required(),
//     u_password: Joi.string()
//       .trim()
//       .replace(/'/g, "''")
//       .min(6)
//       .max(30)
//       .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
//       .required()
//       .messages({
//         "string.pattern.base":
//           "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
//         "string.min": "Password must be at least 6 characters long.",
//       }),
//     u_mobile: Joi.string()
//       .trim()
//       .pattern(/^\d{10}$/)
//       .required()
//       .messages({
//         "string.pattern.base": "Mobile number must be exactly 10 digits.",
//       }),
//   });

//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // ------------------------------ login validation -----------------------------

// export async function loginVaidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     u_email: Joi.string().email().trim().replace(/'/g, "''").exist().required(),
//     u_password: Joi.string()
//       .trim()
//       .replace(/'/g, "''")
//       .min(6)
//       .max(30)
//       .required(),
//   });
//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // --------------------- checkEmail validation -----------------------------------

// export async function checkEmailValidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     u_email: Joi.string().trim().replace(/'/g, "''").email().exist().required(),
//   });
//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // ------------------------ reset password validation ----------------------------------------

// export async function resetPasswordValidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     u_email: Joi.string().trim().replace(/'/g, "''").email().exist().required(),
//     u_password: Joi.string()
//       .trim()
//       .replace(/'/g, "''")
//       .min(6)
//       .max(30)
//       .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
//       .required()
//       .messages({
//         "string.pattern.base":
//           "Password must have at least 1 uppercase letter, 1 number, and 1 special character.",
//         "string.min": "Password must be at least 6 characters long.",
//       }),
//   });
//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // -------------------------------- otp validation -------------------------------------------

// export async function verifyOtpValidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     u_email: Joi.string().trim().replace(/'/g, "''").email().required(),
//     u_otp: Joi.number().required(),
//   });

//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // ------------------------ productValidations --------------------------------------------------

// export async function productValidations(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     p_name: Joi.string().trim().replace(/'/g, "''").exist().required(),
//     p_desc: Joi.string().replace(/'/g, "''").required(),
//     p_brand: Joi.string().replace(/'/g, "''").required(),
//     p_price: Joi.number().greater(0).required().max(5),
//     p_qnt: Joi.number().greater(0).required(),
//     cat_id: Joi.number().greater(0).required(),
//     p_hsn_code: Joi.string().trim().replace(/'/g, "''").required(),
//     p_discount: Joi.number().greater(0).required(),
//     img: Joi.required(),
//   });

//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // ---------------------- update productDetail validations------------------

// export async function UpdateProductValidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     p_name: Joi.string().trim().replace(/'/g, "''").required(),
//     p_desc: Joi.string().min(10).max(100).replace(/'/g, "''").required(),
//     p_brand: Joi.string().replace(/'/g, "''").required(),
//     p_price: Joi.number().greater(0).max(5).required(),
//     p_qnt: Joi.number().required(),
//   });

//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// //------------------------ address validation -------------------------------------

// export async function addressValidations(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     sh_address1: Joi.string().trim().replace(/'/g, "''").required(),
//     sh_address2: Joi.string().trim().replace(/'/g, "''").required(),
//     sh_city: Joi.string().replace(/'/g, "''").trim().required(),
//     sh_state: Joi.string().replace(/'/g, "''").trim().required(),
//     sh_country: Joi.string().replace(/'/g, "''").trim().required(),
//     sh_pincode: Joi.string()
//       .replace(/'/g, "''")
//       .pattern(/^\d{6}$/)
//       .required(),
//   });
//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // --------------------- place orders ---------------------------------------

// export async function placeOrdersvalidations(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     o_discounts: Joi.number().greater(0).required(),
//     p_gst_percentage: Joi.number()
//       .valid(0, 5, 12, 18, 28)
//       .greater(0)
//       .required(),
//   });

//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // -------------------- add to cart validation ------------------------------

// export async function addTocartValidation(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     product_id: Joi.number().greater(0).required(),
//     cart_quantity: Joi.number().greater(0).required(),
//   });
//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }

// // ----------------- add feedback validations ------------------------------

// export async function addFeedbackValidations(req: any, res: any, next: any) {
//   const schema = Joi.object({
//     r_rating: Joi.number().max(5).required(),
//     r_comment: Joi.string().replace(/\s+/g, " ").required(),
//     r_img: Joi.required(),
//     product_id: Joi.number().greater(0).required(),
//   });
//   const { error, value } = schema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }
//   req.body = value;
//   next();
// }
