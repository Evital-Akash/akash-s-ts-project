import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Checkoutdb extends appdb {
  constructor() {
    super();
    (this.table = "shipping_address"), (this.uniqueField = "id");
  }

  async addShippingAddress(sh_address1: any, sh_address2: any, sh_city: string, sh_state: string, sh_country: string, sh_pincode: number, sh_latitude: number, sh_logitude: number, user_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      const data: any = { sh_address1, sh_address2, sh_city, sh_state, sh_country, sh_pincode, sh_latitude, sh_logitude, user_id, };
      let result: any = await this.insertRecord(data);
      if (!result || result.length === 0) {
        return_data.message = "ADDRESS NOT ADDED.."
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "ADDRESS ADDED SUCCESS...."

    } catch (error) {
      console.error("Error in add address:", error);
      return_data.message = "Error in add address"
    }
    return return_data;
  }


  // ----------------------- get all address -----------------------------------

  async getCurrentUserShippingAddress(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      this.where = `where user_id=${id}`;
      let result: any[] = await this.select(this.table, "*", this.where, this.orderby, this.limit);
      if (!result || result.length === 0) {
        return_data.message = "ADDRESS NOT FOUND"
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "ADDRESS GET SUCCESS...."

    } catch (error) {
      console.error("Error in add address:", error);
      return_data.message = "Error in add address"
    }
    return return_data;
  }

  // -------------------- delete address by ID ----------------------------------


  async deleteShippingAddress(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.deleteRecord(id);
      if (!result || result.length === 0) {
        return_data.message = "ADDRESS NOT FOUND"
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "ADDRESS DELETE SUCCESS...."
    } catch (error) {
      console.error("Error in delete address:", error);
      return_data.message = "Error in delete address"
    }
    return return_data;
  }
}
