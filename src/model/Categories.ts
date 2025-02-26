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
    try {
      let data: any = { cat_name };
      let result = await this.insertRecord(data);
      return functionObj.output(200, 1, "category Added success...", result);
    } catch (error) {
      return functionObj.output(400, 0, "not inserted data..", error);
    }
  }
}
