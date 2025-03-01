import { functions } from "../library/function";
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

  // ------------------------------------ check users ----------------------------------------------

  async checkUserByEmail(u_email: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      this.where = "WHERE u_email ILIKE '" + u_email + "'";
      let exist: any[] = await this.allRecords("*");

      if (!exist || exist.length === 0) {
        return_data.message = "user not exist.."
      } else {
        return_data.error = false;
        return_data.data = exist;
        return_data.message = "User already exist"
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
      this.where = "WHERE id =" + id;
      let result = await this.selectRecord(id, "*");

      if (!result || result.length === 0) {
        return_data.message = "Not found.."
      }
      return_data.error = false;
      return_data.data = result;
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
      data: {}
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
      const data: any = {
        u_name,
        u_email,
        u_password: hasedPassword,
        u_mobile,
        u_ipaddress: ip,
      };
      let result: any = await this.insertRecord(data);

      if (!result) {
        return_data.message = "Not Inserted data.."
        return return_data;
      }

      let wh1 = "WHERE u_email ILIKE '" + u_email + "'";
      await this.update(this.table, { u_otp: u_otp }, wh1);

      await sendMail(
        u_email,
        "OTP for Registration",
        `<p>Welcome !! Your OTP for verification is -</p>
        <h1>${u_otp}</h1> `
      );
      return_data.error = false;
      return_data.data = result;
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

    let token;

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
      let checkPass = await bcrypt.compare(u_password, result[0].u_password);
      if (!checkPass) {
        return_data.message = "PASSWORD INCORRECT";
        return return_data;
      }
      token = Token.createToken({ id: result[0].id });
      return_data.error = false;
      return_data.data = token;
      return_data.message = "LOGIN SUCCESS..."
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
      data: {}
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
      let storedOtp = result[0].u_otp;
      let currentTime: number = new Date().getTime();
      let otpCreatedTime: number = new Date(result[0].u_updated_at).getTime();
      let timeDiff: number = currentTime - otpCreatedTime;

      if (timeDiff > 120000) {
        let where3 = "WHERE u_email ILIKE '" + u_email + "'";
        await this.update(this.table, { u_otp: null }, where3);
        return_data.message = "OTP HAS EXPIRED.."
        return return_data;
      }

      if (storedOtp !== u_otp) {
        return_data.message = "OTP NOT VERIFIED";
        return return_data;
      }

      let where2 = "WHERE u_email ILIKE '" + u_email + "'";
      await this.update(this.table, { u_otp: null, u_otpstatus: "verified" }, where2);
      return_data.error = false;
      return_data.data = storedOtp;
      return_data.message = "OTP VERIFIED SUCCESS.."
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
        "Resend OTP for Verifications...",
        `<p>Welcome !! Your resend OTP for verification is -</p>
        <h1>${u_otp}</h1> `
      );
      return_data.error = false;
      return_data.data = u_otp;
      return_data.message = "OTP RESEDN SECCESS.."
    }
    catch (error) {
      console.error("Error in resend otp:", error);
      return_data.message = "Error in resend otp"
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
      await sendMail(
        u_email,
        "OTP for Reset password...",
        `<p>WYour OTP for Reset password is -</p>
       <h1>${u_otp}</h1> `
      );
      return_data.error = false;
      return_data.data = u_otp;
      return_data.message = "OTP SEDN SECCESS.."

    } catch (error) {
      console.error("Error in resend otp:", error);
      return_data.message = "Error in resend otp"
    }
    return return_data;
  }

  // ------------------------------------- reset password -----------------------------------------------

  async resetPassword(id: number, u_password: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(u_password, salt);

      let result: any[] = await this.updateRecord(id, {
        u_password: hasedPassword,
      });

      if (result.length > 0) {
        return_data.message = "NOT CHANGED..";
        return return_data;
      }

      return_data.error = false;
      return_data.data = hasedPassword;
      return_data.message = "PASSWORD CHANGED SUCCESS..";

    } catch (error) {
      console.error("Error in resend otp:", error);
      return_data.message = "Error in resend otp"
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

  async updateProfile(u_name: string, u_mobile: number, id: number, u_img: string) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let datas = { u_name: u_name, u_mobile: u_mobile, u_img };
      let result = await this.updateRecord(id, datas);
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
