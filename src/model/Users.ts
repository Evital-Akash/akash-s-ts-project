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
    this.where = "where u_email ilike '" + u_email + "'";
    let exist: any[] = await this.select(
      this.table,
      "",
      this.where,
      this.orderby,
      this.limit
    );
    var functionObj = new functions();

    if (exist.length) {
      return functionObj.output(400, 0, "User already exist...");
    } else {
      return functionObj.output(201, 1, "User not exist...");
    }
  }

  // ------------------------------- get currently loged in users ---------------------------

  async getSingleUsers(id: number) {
    let functionObj = new functions();

    this.where = "where id =" + id;
    let result: any[] = await this.selectRecord(id, "*");
    return functionObj.output(201, 1, "Get Users..", result);
  }

  // --------------------------------- register --------------------------------------------

  async register(
    u_name: String,
    u_email: string,
    u_password: any,
    u_mobile: number,
    ip: string
  ) {
    this.where =
      "where u_name ilike '" + u_name + "' or u_email ilike '" + u_email + "'";
    let exist: any[] = await this.select(
      this.table,
      "*",
      this.where,
      this.orderby,
      this.limit
    );

    var functionObj = new functions();

    if (exist.length > 0) {
      return functionObj.output(400, 0, "User already exist...");
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
    let result = await this.insertRecord(data);

    let wh1 = "where u_email ilike '" + u_email + "'";
    let res2: any[] = await this.update(this.table, { u_otp: u_otp }, wh1);

    await sendMail(
      u_email,
      "OTP for Registration",
      `<p>Welcome !! Your OTP for verification is -</p>
        <h1>${u_otp}</h1> `
    );

    return functionObj.output(
      200,
      1,
      "Register success & otp send success",
      result
    );
  }

  //--------------------------------------- login  ------------------------------------------------
  async login(u_email: any, u_password: any) {
    var functionObj = new functions();
    let token;

    this.where = "where u_email ilike '" + u_email + "'";
    let result: any[] = await this.select(
      this.table,
      "*",
      this.where,
      this.orderby,
      this.limit
    );

    if (result.length == 0) {
      return functionObj.output(401, 0, "User is not available...register now");
    }

    let checkPass = await bcrypt.compare(u_password, result[0].u_password);
    if (!checkPass) {
      return functionObj.output(422, 0, "Password is incorrect...");
    } else {
      token = Token.createToken({ id: result[0].id });
      return functionObj.output(200, 1, "login success... ", token);
    }
  }

  //   --------------------------------- verify otp -------------------------------------------------

  async verifyOtp(u_email: any, u_otp: number) {
    var functionObj = new functions();

    this.where = "where u_email ='" + u_email + "'";
    let result = await this.select(
      this.table,
      "u_email,u_otp,u_updated_at",
      this.where,
      this.orderby,
      this.limit
    );

    let storedOtp = result[0].u_otp;

    let currentTime: number = new Date().getTime();
    let otpCreatedTime: number = new Date(result[0].u_updated_at).getTime();
    let timeDiff: number = currentTime - otpCreatedTime;

    if (timeDiff > 120000) {
      let where3 = "where u_email ilike '" + u_email + "'";
      let response3: any[] = await this.update(
        this.table,
        { u_otp: "" },
        where3
      );
      return functionObj.output(422, 0, "OTP has expired.");
    }

    if (storedOtp !== u_otp) {
      return functionObj.output(422, 0, "OTP is not verified..");
    }
    let where2 = "where u_email ilike '" + u_email + "'";
    let response2: any[] = await this.update(
      this.table,
      { u_otp: null, u_otpstatus: "verified" },
      where2
    );

    return functionObj.output(201, 1, "OTP verify success..");
  }

  // --------------------------------------- resend otp -------------------------------------------

  async resendOtp(u_email: any) {
    var functionObj = new functions();

    const u_otp = await this.generateOtp(100000, 999999);

    let wh1 = "where u_email ilike '" + u_email + "'";
    let res2: any[] = await this.update(this.table, { u_otp: u_otp }, wh1);

    await sendMail(
      u_email,
      "Resend OTP for Verifications...",
      `<p>Welcome !! Your resend OTP for verification is -</p>
      <h1>${u_otp}</h1> `
    );

    return functionObj.output(200, 1, "OTP resend success...");
  }
  // ------------------------------------- frogot-password ---------------------------------------------

  async forgotPassword(u_email: any) {
    var functionObj = new functions();

    const u_otp = await this.generateOtp(100000, 999999);

    this.where = "where u_email ilike '" + u_email + "'";
    let res2: any[] = await this.update(
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
    return functionObj.output(201, 1, "OTP send success...", res2);
  }

  // ------------------------------------- reset password -----------------------------------------------

  async resetPassword(id: number, u_password: any) {
    var functionObj = new functions();

    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(u_password, salt);

    let result: any[] = await this.updateRecord(id, {
      u_password: hasedPassword,
    });

    return functionObj.output(200, 1, "password changed success...", result);
  }

  // ------------------------------------ update profile -------------------------------------------------------

  async updateProfile(
    u_name: string,
    u_mobile: number,
    id: number,
    u_img: string
  ) {
    let functionObj = new functions();
    let datas = { u_name: u_name, u_mobile: u_mobile, u_img };
    let result = await this.updateRecord(id, datas);

    return functionObj.output(200, 1, "Profile update Success...", result);
  }
}
