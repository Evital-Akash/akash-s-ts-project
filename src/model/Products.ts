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

    this.where = `WHERE p_name ILIKE '${p_name}'`;
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

    if (!result) {
      return functionObj.output(422, 0, "not updated");
    } else {
      return functionObj.output(200, 1, "Product details update Success...");
    }
  }

  //   ------------------------------search products --------------------------------------------------

  async searchProduct(searchValue: string) {
    let functionObj = new functions();
    let where1 = `WHERE p_name ILIKE '${searchValue}' OR p_desc ILIKE '${searchValue}'`;
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
