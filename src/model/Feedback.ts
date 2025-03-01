import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Feedbackdb extends appdb {
  constructor() {
    super();
    (this.table = "reviews"), (this.uniqueField = "id");
  }

  //   ---------------------------- add feedback -------------------------------------
  async addFeedback(r_rating: number, r_comment: any, r_img: string, product_id: number, user_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let data: any = { r_rating, r_comment, r_img, product_id, user_id };
      let result = await this.insertRecord(data);
      if (!result || result.length === 0) {
        return_data.message = "FEEDBACK NOT ADDED.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "FEEDBACK ADDED SUCCESS.."
    } catch (error) {
      console.error("Error in add feedback:", error);
      return_data.message = "Error in add feedback"
    }
    return return_data;
  }

  // ---------------------- get all feedbacks ----------------------------------------

  async getAllFeedback() {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any[] = await this.allRecords("*");
      if (!result || result.length === 0) {
        return_data.message = "FEEDBACK NOT GET.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "FEEDBACK GET SUCCESS.."
    }
    catch (error) {
      console.error("Error in GET feedback:", error);
      return_data.message = "Error in GET feedback"
    }
    return return_data;
  }

  // -------------------- delete feedbacks ------------------------------------

  async deleteFeedback(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.deleteRecord(id);
      if (!result || result.length === 0) {
        return_data.message = "FEEDBACK NOT DELETED.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "FEEDBACK DELETE SUCCESS.."
    }
    catch (error) {
      console.error("Error in delete feedback:", error);
      return_data.message = "Error in delete feedback"
    }
    return return_data;
  }
}
