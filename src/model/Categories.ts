import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Categorydb extends appdb {
  constructor() {
    super();
    (this.table = "categories"), (this.uniqueField = "id");
  }

  //   ----------------- create categories ----------------------------
  async createCategories(cat_name: string) {
    let functionObj = new functions();
    this.where = "where cat_name ilike'" + cat_name + "'";
    let exist: any[] = await this.select(
      this.table,
      "*",
      this.where,
      this.orderby,
      this.limit
    );

    if (exist.length) {
      return functionObj.output(402, 0, "category is already exist..");
    }

    let data: any = { cat_name };
    let result = await this.insertRecord(data);
    return functionObj.output(200, 1, "category Added success...", result);
  }

  // -------------------- get all categories -------------------------------

  async getAllCategories() {
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

  //   --------------------------delete by id ---------------------------------

  async deleteCategory(id: number) {
    let functionObj = new functions();
    let where = "where id=" + id;
    let result: any[] = await this.delete(this.table, where);
    return functionObj.output(200, 1, "delete category success..", result);
  }
}
