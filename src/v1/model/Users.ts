import { Token } from "../library/Token";
import { appdb } from "./appdb";
import { sendMail } from "../library/sendMail";
import bcrypt from "bcrypt";

export class Userdb extends appdb {
  constructor() {
    super();
    (this.table = "users"), (this.uniqueField = "id");
  }

  // --------------------------------- OTP generate -----------------------
  async generateOtp(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  // ------------------------------------ check users --------------------------
  async checkUserByEmail(u_email: any) {
    let return_data = {
      error: true,
      message: "",
      data: {},
      is_exist: false
    }
    try {
      this.where = "WHERE u_email ILIKE '" + u_email + "'";
      let exist: any[] = await this.allRecords("*");

      if (!exist || exist.length === 0) {
        return_data.message = "user not exist..";
      } else {
        return_data.error = false;
        return_data.data = exist;
        return_data.message = "User already exist";
        return_data.is_exist = true;
      }
    }
    catch (error) {
      console.error("Error fetching users:", error);
      return_data.message = "Error in fetching all users"
    }
    return return_data;
  }

  // --------------------- get all users -----------------------------------------------

  async getAllUsers() {
    let return_data = {
      error: true,
      message: "",
      data: { result: new Array() }
    }
    try {
      let result = await this.allRecords("*");
      if (!result || result.length === 0) {
        return_data.message = "No user found"
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "Get all user success.."
    }
    catch (error) {
      console.error("Error fetching users:", error);
      return_data.message = "Error in fetching all users"
    }
    return return_data;
  }

  // ------------------------------- get currently loged in users ---------------------------

  async getSingleUsers(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result = await this.selectRecord(id, "*");
      if (!result || result.length === 0) {
        return_data.message = "Not found.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result[0];
      return_data.message = "Get current user success.."
    }
    catch (error) {
      console.error("Error fetching current users:", error);
      return_data.message = "Error in fetching current users"
    }
    return return_data;
  }

  // --------------------------------- register --------------------------------------------
  async register(u_name: string, u_email: string, u_password: string, u_mobile: number, ip: string) {
    let return_data = {
      error: true,
      message: "",
      data: { result: new Array() }
    }
    try {
      this.where = "WHERE u_email ILIKE '" + u_email + "'";
      let exist: any[] = await this.select(
        this.table,
        "*",
        this.where,
        this.orderby,
        this.limit
      );
      if (exist.length > 0) {
        return_data.message = "User already exist..";
        return return_data;
      }
      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(u_password, salt);
      const u_otp = await this.generateOtp(100000, 999999);
      const data: any = { u_name, u_email, u_password: hasedPassword, u_otp, u_mobile, u_ipaddress: ip, };
      let result: any = await this.insertRecord(data);

      if (!result) {
        return_data.message = "Not Inserted data.."
        return return_data;
      }

      // let wh1 = "WHERE u_email ILIKE '" + u_email + "'";
      // await this.update(this.table, { u_otp: u_otp }, wh1);

      await sendMail(
        u_email,
        "🛍️ Welcome to E-Shopper ",
        `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center; background-color: #f9f9f9;"> 
        <h2 style="color: #2C3E50;">🔐 OTP for Registration</h2>
    
         <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Please use the OTP below to verify your account and complete your registration.</p>
        
         <div style="background-color: #27AE60; color: #fff; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; display: inline-block; margin-bottom: 20px;">${u_otp}</div>
          
         <p style="font-size: 14px; color: #777;">This OTP is valid for a limited time. Do not share it with anyone.</p>
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #555;">Need help? Contact our support team at <a href="mailto:support@yourdomain.com" style="color: #3498DB; text-decoration: none;">support@yourdomain.com</a></p>
        <p style="font-size: 14px; color: #777;">🔐 Stay Secure, Stay Safe!</p>
       </div>`
      );
      return_data.error = false;
      return_data.data = data;
      return_data.message = "Register success..."
    }

    catch (error) {
      console.error("Error in register users:", error);
      return_data.message = "Error in register users"
    }
    return return_data;
  }

  //--------------------------------------- login  ------------------------------------------------
  async login(u_email: any, u_password: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      this.where = "WHERE u_email ILIKE '" + u_email + "'";
      let result: any = await this.select(
        this.table,
        "*",
        this.where,
        this.orderby,
        this.limit
      );

      if (!result || result.length === 0) {
        return_data.message = "USER NOT EXIST";
        return return_data;
      }
      let where1 = "WHERE u_email ILIKE '" + u_email + "'";
      let status = await this.select(this.table, "u_otpstatus", where1, this.orderby, this.limit)

      if (status[0].u_otpstatus === 'verified') {
        let checkPass = await bcrypt.compare(u_password, result[0].u_password);
        if (!checkPass) {
          return_data.message = "PASSWORD INCORRECT";
          return return_data;
        }
        const token = Token.createToken({ id: result[0].id, u_role: result[0].u_role, u_email: result[0].u_email });
        return_data.error = false;
        return_data.data = token;
        return_data.message = "LOGIN SUCCESS..."
      }
      else {
        return_data.message = "USER IS NOT VERIFIED..."
      }
    }
    catch (error) {
      console.error("Error in login:", error);
      return_data.message = "Error in login"
    }
    return return_data;
  }

  //   --------------------------------- verify otp -------------------------------------------------

  async verifyOtp(u_email: any, u_otp: number) {
    let return_data = {
      error: true,
      message: "",
      data: {},
      verified: false,
    }
    try {
      this.where = "WHERE u_email ='" + u_email + "'";
      let result = await this.select(
        this.table,
        "u_email,u_otp,u_updated_at",
        this.where,
        this.orderby,
        this.limit
      );

      if (!result || result.length === 0) {
        return_data.message = "NOT VERIFIED..."
        return return_data;
      }
      else {
        let storedOtp = result[0].u_otp;
        let currentTime: number = new Date().getTime();
        let otpCreatedTime: number = new Date(result[0].u_updated_at).getTime();
        let timeDiff: number = currentTime - otpCreatedTime;

        if (storedOtp !== u_otp) {
          return_data.message = "OTP NOT VERIFIED";
          return return_data;
        }
        else if (timeDiff > 120000) {
          let where3 = "WHERE u_email ILIKE '" + u_email + "'";
          await this.update(this.table, { u_otp: null }, where3);
          return_data.message = "OTP HAS EXPIRED.."
          return return_data;
        }
        else {
          let where2 = "WHERE u_email ILIKE '" + u_email + "'";
          let res: any = await this.update(this.table, { u_otp: null, u_otpstatus: "verified" }, where2);
          return_data.error = false;
          return_data.data = res;
          return_data.message = "YOUR REGISTRATION SUCCESS WITH OTP VERIFIED.."
          return_data.verified = true;
        }
      }
    }
    catch (error) {
      console.error("Error in verify otp:", error);
      return_data.message = "Error in verify otp"
    }
    return return_data;
  }

  // --------------------------------------- resend otp -------------------------------------------

  async resendOtp(u_email: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      const u_otp = await this.generateOtp(100000, 999999);
      let wh1 = "WHERE u_email ILIKE '" + u_email + "'";
      await this.update(this.table, { u_otp: u_otp }, wh1);
      await sendMail(
        u_email,
        "🛍️ E-Shopper ",
        `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center; background-color: #f9f9f9;"> 
        <h2 style="color: #2C3E50;">🔐 New OTP </h2>
         <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Please use the OTP below to verify your account and complete your registration.</p>
         <div style="background-color: #27AE60; color: #fff; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; display: inline-block; margin-bottom: 20px;">${u_otp}</div>
         <p style="font-size: 14px; color: #777;">This OTP is valid for a limited time. Do not share it with anyone.</p>
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #555;">Need help? Contact our support team at <a href="mailto:support@yourdomain.com" style="color: #3498DB; text-decoration: none;">support@yourdomain.com</a></p>
        <p style="font-size: 14px; color: #777;">🔐 Stay Secure, Stay Safe!</p>
       </div>`
      );
      return_data.error = false;
      return_data.data = u_otp;
      return_data.message = "NEW OTP SEND YOUR EMAIL..!!"
    }
    catch (error) {
      console.error("Error in resend otp:", error);
      return_data.message = "ERROR IN SENDING NEW OTP..!!"
    }
    return return_data;
  }
  // ------------------------------------- frogot-password ---------------------------------------------

  async forgotPassword(u_email: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      const u_otp = await this.generateOtp(100000, 999999);

      this.where = "WHERE u_email ILIKE '" + u_email + "'";
      await this.update(
        this.table,
        { u_otp: u_otp },
        this.where
      );

      let where2 = `WHERE u_email ILIKE '${u_email}'`;
      let result: any = await this.select(this.table, "id", where2, this.orderby, this.limit);
      await sendMail(
        u_email,
        "🛍️ E-Shopper ",
        `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center; background-color: #f9f9f9;"> 
        <h2 style="color: #2C3E50;">🔐 OTP for Reset Password</h2>
         <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Please use the OTP below to Reset new password</p>
         <div style="background-color: #27AE60; color: #fff; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; display: inline-block; margin-bottom: 20px;">${u_otp}</div>
         <p style="font-size: 14px; color: #777;">This OTP is valid for a limited time. Do not share it with anyone.</p>
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #555;">Need help? Contact our support team at <a href="mailto:support@yourdomain.com" style="color: #3498DB; text-decoration: none;">support@yourdomain.com</a></p>
        <p style="font-size: 14px; color: #777;">🔐 Stay Secure, Stay Safe!</p>
       </div>`
      );
      return_data.error = false;
      return_data.data = result;
      return_data.message = "OTP_SEND"
    } catch (error) {
      console.error("Error in resend otp:", error);
      return_data.message = "Error in resend otp"
    }
    return return_data;
  }

  // ------------------------------------- reset password -----------------------------------------------

  async resetPassword(u_email: any, u_password: any, confirm_password: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      if (u_password !== confirm_password) {
        return_data.message = "PASSWORD DO NOT MATCHED..";
        return return_data;
      }
      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(u_password, salt);

      let where2 = `WHERE u_email ILIKE '${u_email}'`;
      let result: any = await this.update(this.table, { u_password: hasedPassword }, where2);

      if (result === 0) {
        return_data.message = "PASSWORD NOT CHANGED..";
        return return_data;
      }
      else {
        return_data.error = false;
        return_data.data = result;
        return_data.message = "PASSWORD CHANGED SUCCESS..";
      }
    } catch (error) {
      console.error("Error in resend otp:", error);
      return_data.message = "Error in reset otp"
    }
    return return_data;
  }

  // ------------------------------------ delete user by ID --------------------------------------

  async deleteUser(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result = await this.deleteRecord(id);
      if (!result) {
        return_data.message = "USER IS NOT FOUND..";
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "USER DELETE SUCCESS...";
    }
    catch (error) {
      console.error("Error in delete user:", error);
      return_data.message = "Error in delete user"
    }
    return return_data;
  }

  // ------------------------------------ update profile -------------------------------------------------------

  async updateProfile(u_name: string, u_mobile: number, id: number, u_img: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let updateData = { u_name: u_name, u_mobile: u_mobile, u_img: u_img };
      let result = await this.updateRecord(id, updateData);
      if (!result) {
        return_data.message = "USER IS NOT FOUND..";
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PROFILE UPDATE SUCCESS...";
    }
    catch (error) {
      console.error("Error in update profile:", error);
      return_data.message = "Error in update profile"
    }
    return return_data;
  }

}
