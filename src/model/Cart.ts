import { appdb } from "./appdb";
import { functions } from "../library/function";
import { Productdb } from "./Products";

export class Cartdb extends appdb {
  constructor() {
    super();
    (this.table = "cart"), (this.uniqueField = "id");
  }

  //    --------------------------- add to cart product --------------------------

  async addUpdateCart(product_id: number, cart_quantity: number, user_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let productObj = new Productdb()
      productObj.where = `where id = ${product_id}`;
      let result1: any = await productObj.selectRecord(product_id, "p_qnt",);
      console.log(result1);

      if (result1.length === 0 || !result1) {
        return_data.message = "PRODUCTS NOT FOUND..";
        return return_data;
      }
      const availStock: number = result1[0].p_qnt;

      if (availStock < cart_quantity) {
        return_data.message = "INSUFFICIENT STOCKS...";
        return return_data;
      }

      //  check if product already exist in cart

      this.where = `where user_id = ${user_id} and product_id = ${product_id}`;
      let existingCartItem: any = await this.select(this.table, "cart_quantity", this.where, this.orderby, this.limit);

      if (existingCartItem.length > 0) {
        let updateQnt = existingCartItem[0].cart_quantity + cart_quantity;

        this.where = `where user_id = ${user_id} and product_id = ${product_id}`;
        await this.update(this.table, { cart_quantity: updateQnt, }, this.where);
        return_data.message = "QTY UPDATED SUCCESS..";
        return return_data;
      }

      let data: any = { product_id, cart_quantity, user_id };
      let result = await this.insertRecord(data);
      return_data.error = false;
      return_data.data = result;
      return_data.message = "INSERTED SUCCES...";
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