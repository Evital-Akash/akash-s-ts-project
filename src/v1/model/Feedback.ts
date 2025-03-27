import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Feedbackdb extends appdb {
  constructor() {
    super();
    (this.table = "reviews"), (this.uniqueField = "id");
  }

  //   ---------------------------- add feedback -------------------------------------
  async addFeedback(r_rating: number, r_comment: any, r_img: any | null, product_id: number, user_id: number, r_ipaddress: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let tab1 = `order_items oi JOIN orders o ON oi.order_id=o.id`;
      let field1 = `oi.product_id`;
      let wheres = `WHERE o.user_id=${user_id} AND oi.product_id=${product_id} AND o.payment_status='paid'`
      let hasPurchased: any = await this.select(tab1, field1, wheres, this.orderby, this.limit);
      if (!hasPurchased || hasPurchased.length === 0) {
        return_data.message = "YOU CAN ONLY REVIEW PRODUCTS YOU HAVE PURCHASED...";
        return return_data;
      }
      let purchasedProductId = hasPurchased[0]?.product_id;
      if (!purchasedProductId) {
        return_data.message = "Invalid product ID from purchase history.";
        return return_data;
      }

      let proWhere = `WHERE id=${product_id}`;
      let productExists = await this.select("products", "id", proWhere, this.orderby, this.limit);
      if (!productExists || productExists.length === 0) {
        return_data.message = "INVALID PRODUCT ID.";
        return return_data;
      }

      let data: any = { r_rating, r_comment, r_img, product_id: purchasedProductId, user_id, r_ipaddress };
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

  async getAllFeedback(product_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let tab1 = `reviews r JOIN users u ON r.user_id=u.id`;
      let fields = `r.*,u.u_name`;
      let orderBy = `ORDER BY r.r_created_at DESC`;
      let whereClause = `WHERE r.product_id = ${product_id}`;
      let reviewData = await this.select(tab1, fields, whereClause, orderBy, this.limit);
      return_data.error = false;
      return_data.data = reviewData;
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
