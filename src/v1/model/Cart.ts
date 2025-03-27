import { appdb } from "./appdb";
import { functions } from "../library/function";
import { Productdb } from "./Products";

export class Cartdb extends appdb {
  constructor() {
    super();
    (this.table = "cart"), (this.uniqueField = "id");
  }
//------------------------------ add to cart product --------------------------
  async addUpdateCart(product_id: number, cart_quantity: number, user_id: number, cart_ipaddress: any) {
    let return_data = {
      error: true,
      message: "",
      status_code: "",
      data: {}
    }
    try {
      let productObj = new Productdb()
      productObj.where = `where id = ${product_id}`;
      let result1: any = await productObj.selectRecord(product_id, "p_qnt",);
      if (result1.length === 0 || !result1) {
        return_data.message = "PRODUCTS NOT FOUND..";
        return_data.status_code = '0';
        return return_data;
      }
      const availStock: number = result1[0].p_qnt;
      if (availStock < cart_quantity) {
        return_data.message = "INSUFFICIENT STOCKS...";
        return_data.status_code = '0';
        return return_data;
      }
      //  check if product already exist in cart

      this.where = `where user_id = ${user_id} and product_id = ${product_id}`;
      let existingCartItem: any = await this.select(this.table, "cart_quantity", this.where, this.orderby, this.limit);
      if (existingCartItem.length > 0) {
        let updateQnt = existingCartItem[0].cart_quantity;
        if (updateQnt !== cart_quantity) {
          this.where = `where user_id = ${user_id} and product_id = ${product_id}`;
          let updateResult = await this.update(this.table, { cart_quantity }, this.where);
          if (updateResult) {
            return_data.message = "QUANTITY UPDATED SUCCESSFULLY.";
            return_data.status_code = "1";
            return_data.error = false;
            return return_data;
          } else {
            return_data.message = "FAILED TO UPDATE QUANTITY.";
            return_data.status_code = "0";
            return return_data;
          }
        }
        return_data.message = "ITEM ALREADY IN CART WITH SAME QUANTITY.";
        return_data.status_code = "1";
        return_data.error = false;
        return return_data;
      }

      let data: any = { product_id, cart_quantity, user_id, cart_ipaddress };
      let result = await this.insertRecord(data);
      if (result) {
        return_data.message = "ITEM ADDED TO CART SUCCESSFULLY.";
        return_data.status_code = "1";
        return_data.error = false;
        return_data.data = result;
      } else {
        return_data.message = "FAILED TO ADD ITEM TO CART.";
        return_data.status_code = "0";
      }
    }
    catch (error) {
      console.error("Error in add cart products:", error);
      return_data.message = "Error in add cart products"
    }
    return return_data;

  }

  // -------------------- get all cart products -----------------------------------------

  async getAllCartProducts(user_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: { result: new Array() }
    }
    try {
      this.where = `where user_id = ${user_id}`;
      let result: any = await this.select(this.table, "*", this.where, this.orderby, this.limit);
      if (!result || result.length === 0) {
        return_data.message = "CART NOT FOUND.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "CART GET SUCCESS.."
    } catch (error) {
      console.error("Error in get cart products:", error);
      return_data.message = "Error in get cart products"
    }
    return return_data;
  }

// -------------------------- remove cart item by id ------------------------------
  async removeCartItems(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: { result: new Array() }
    }
    try {
      let result: any = await this.deleteRecord(id);
      if (!result || result.length === 0) {
        return_data.message = "CART NOT FOUND.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "CART DELETE SUCCESS.."

    } catch (error) {
      console.error("Error in delete cart products:", error);
      return_data.message = "Error in delete cart products"
    }
    return return_data;
  }
}