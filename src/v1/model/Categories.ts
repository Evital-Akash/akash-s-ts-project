import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Categorydb extends appdb {
  constructor() {
    super();
    (this.table = "categories"), (this.uniqueField = "id");
  }

  //   ----------------- create categories ----------------------------
  async createCategories(cat_name: string, cat_ipaddress: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      this.where = "where cat_name ilike'" + cat_name + "'";
      let exist: any[] = await this.select(this.table, "*", this.where, this.orderby, this.limit);
      if (exist.length) {
        return_data.message = "CATEGORY ALREADY EXIST..";
        return return_data;
      }

      let data: any = { cat_name, cat_ipaddress };
      let result = await this.insertRecord(data);
      if (!result || result.length === 0) {
        return_data.message = "CATEGORY NOT FOUND.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "CATEGORY INSERTED SUCCESS.."
    } catch (error) {
      console.error("Error in add category:", error);
      return_data.message = "Error in add category"
    }
    return return_data;
  }

  // ----------------- get all categories ------------------------------
  async getAllCategories() {
    let return_data = {
      error: true,
      message: "",
      data: { result: new Array() }
    }
    try {
      let result: any = await this.allRecords("*");
      if (!result || result.length === 0) {
        return_data.message = "CATEGORY NOT FOUND.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "CATEGORY GET SUCCESS.."
    }
    catch (error) {
      console.error("Error in GET category:", error);
      return_data.message = "Error in GET category"
    }
    return return_data;
  }

  // ----------------- delete categories ------------------------------

  async deleteCategory(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.deleteRecord(id);
      if (!result || result.length === 0) {
        return_data.message = "CATEGORY NOT FOUND.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "CATEGORY DELETE SUCCESS.."
    } catch (error) {
      console.error("Error in delete category:", error);
      return_data.message = "Error in delete category"
    }
    return return_data;

  }
}
