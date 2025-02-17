import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Productdb extends appdb {
  constructor() {
    super();
    (this.table = "products"), (this.uniqueField = "id");
  }

  //   ------------------------ add new products ----------------------------------------------

  async addProducts(
    p_name: String,
    p_desc: any,
    p_brand: string,
    p_price: number,
    p_qnt: number,
    cat_id: number,
    p_hsn_code: number,
    p_discount: number,
    p_img: string,
    ip: string
  ) {
    let functionObj = new functions();

    this.where = `where p_name ilike '${p_name}'`;
    let exist: any = await this.select(
      this.table,
      "*",
      this.where,
      this.orderby,
      this.limit
    );

    if (exist && exist.length > 0) {
      return functionObj.output(400, 0, "Product already exist...");
    }
    let data: any = {
      p_name,
      p_desc,
      p_brand,
      p_price,
      p_qnt,
      cat_id,
      p_hsn_code,
      p_discount,
      p_img,
    };

    let result = await this.insertRecord(data);

    return functionObj.output(200, 1, "Product Added success...", result);
  }

  //   ------------------------ get all products ---------------------------------------------

  async getallProducts() {
    let result: any = await this.select(
      this.table,
      "*",
      this.where,
      this.orderby,
      this.limit
    );

    var functionObj = new functions();
    return functionObj.output(201, 1, "get success", result);
  }

  //   ----------------------------- delete products by id -------------------------------------

  async deleteProducts(id: number) {
    let functionObj = new functions();
    let where = "where id = " + id;
    let result: any[] = await this.delete(this.table, where);
    return functionObj.output(200, 1, "delete products success..", result);
  }

  //   ------------------------------ update products ------------------------------------------------

  async updateProducts(
    p_name: string,
    p_desc: string,
    p_brand: string,
    p_price: number,
    p_qnt: number,
    id: number
  ) {
    let functionObj = new functions();

    let where1 = "where id =" + id;
    let proData = {
      p_name: p_name,
      p_desc: p_desc,
      p_brand: p_brand,
      p_price: p_price,
      p_qnt: p_qnt,
    };
    let result: any[] = await this.update(this.table, proData, where1);

    return functionObj.output(200, 1, "Product details update Success...");
  }

  //   ------------------------------search products --------------------------------------------------

  async searchProduct(searchValue: string) {
    let functionObj = new functions();

    let where1 =
      "where p_name ilike '" +
      searchValue +
      "' or " +
      "p_desc ilike '" +
      searchValue +
      "'";
    let result: any = await this.select(
      this.table,
      "*",
      where1,
      this.orderby,
      this.limit
    );
    return functionObj.output(200, 1, "search success...", result);
  }
}
