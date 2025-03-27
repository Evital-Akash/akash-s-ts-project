import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Productdb extends appdb {
  constructor() {
    super();
    (this.table = "products"), (this.uniqueField = "id");
  }

  //   ------------------------ add new products ----------------------------------------------

  async addProducts(p_name: String, p_desc: any, p_brand: string, p_price: number, p_qnt: number, cat_id: number, p_hsn_code: number, p_discount: number, p_img: any, p_ipaddress: string) {
    let return_data = {
      error: true,
      message: "",
      data: { result: [] }
    }
    try {
      this.where = `WHERE "p_name" ILIKE '${p_name}'`;
      let exist: any[] = await this.select(this.table, "*", this.where, this.orderby, this.limit);
      if (exist && exist.length > 0) {
        return_data.message = "PRODUCT ALREADY EXIST..";
        return return_data;
      }
      let data: any = { p_name, p_desc, p_brand, p_price, p_qnt, cat_id, p_hsn_code, p_discount, p_img, p_ipaddress };
      let result = await this.insertRecord(data);
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT INSERTED.."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT INSERTED SUCCESS.."
    }
    catch (error) {
      console.error("Error in add products:", error);
      return_data.message = "Error in add products"
    }
    return return_data;
  }
  //   ------------------------------ update products ------------------------------------------------

  async updateProducts(p_name: string, p_desc: string, p_brand: string, p_price: number, p_qnt: number, id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let where1 = "where id =" + id;
      let proData = { p_name: p_name, p_desc: p_desc, p_brand: p_brand, p_price: p_price, p_qnt: p_qnt, };

      let result: any = await this.update(this.table, proData, where1);
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT UPDATED."
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT UPDATED SUCCESS.."
    } catch (error) {
      console.error("Error in update products:", error);
      return_data.message = "Error in update products"
    }
    return return_data;
  }

  //   ------------------------------search products --------------------------------------------------

  async searchProduct(searchValue: string) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      this.where = `WHERE p_name ILIKE '${searchValue}' OR p_desc ILIKE '${searchValue}'`;
      let result: any = await this.listRecords("*")
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT FOUND"
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT SEARCH SUCCESS.."
    }
    catch (error) {
      console.error("Error in search products:", error);
      return_data.message = "Error in search products"
    }
    return return_data;
  }

  // ---------------------- get all products ------------------------------

  async getAllProducts() {
    let return_data = {
      error: true,
      message: "",
      data: []
    }
    try {
      let result: any = await this.allRecords("*");
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT exist"
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT GET SUCCESS.."
    }
    catch (error) {
      console.error("Error in get products:", error);
      return_data.message = "Error in get products"
    }
    return return_data;
  }

  // ----------------- delete products by ID ----------------------------

  async deleteProducts(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.deleteRecord(id);
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT exist"
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT DELETE SUCCESS.."
    }
    catch (error) {
      console.error("Error in delete products:", error);
      return_data.message = "Error in delete products"
    }
    return return_data;
  }

  // ------------------ get products by id --------------------------------------

  async getProductById(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.selectRecord(id, "*");
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT exist"
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT GET SUCCESS"
    }
    catch (error) {
      console.error("Error in getting products by id:", error);
      return_data.message = "Error in getting products by id.."
    }
    return return_data;
  }

  // -------------- filter by category id --------------------------
  async getBycategoryID(cat_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let wh2 = `WHERE cat_id=${cat_id}`
      let result: any = await this.select(this.table, "*", wh2, this.orderby, this.limit);
      if (!result || result.length === 0) {
        return_data.message = "PRODUCT NOT exist"
        return return_data;
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "PRODUCT GET SUCCESS"
    }
    catch (error) {
      console.error("Error in getting products by id:", error);
      return_data.message = "Error in getting products by id.."
    }
    return return_data;
  }
}



