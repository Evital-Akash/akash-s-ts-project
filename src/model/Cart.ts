import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Cartdb extends appdb {
  constructor() {
    super();
    (this.table = "cart"), (this.uniqueField = "id");
  }

  //    --------------------------- add to cart product --------------------------

  async addTocart(product_id: number, cart_quantity: number, user_id: number) {
    let functionObj = new functions();

    // check product qnt is available or not

    let where1 = `where id = ${product_id}`;
    let result1: any = await this.select(
      "products",
      "p_qnt",
      where1,
      this.orderby,
      this.limit
    );

    if (result1.length === 0 || !result1) {
      return functionObj.output(422, 0, "products not found..");
    }

    const availStock: number = result1[0].p_qnt;

    if (availStock < cart_quantity) {
      return functionObj.output(423, 0, "Insufficient stock..");
    }

    //  check if product already exist in cart

    let where2 = `where user_id = ${user_id} and product_id = ${product_id}`;
    let existingCartItem: any = await this.select(
      this.table,
      "cart_quantity",
      where2,
      this.orderby,
      this.limit
    );


    if (existingCartItem.length > 0) {
      let updateQnt = existingCartItem[0].cart_quantity + cart_quantity;

      let wh3 = `where user_id = ${user_id} and product_id = ${product_id}`;
      let res2: any = await this.update(
        this.table,
        {
          cart_quantity: updateQnt,
        },
        wh3
      );

      return functionObj.output(200, 1, "quantity updated success...", res2);
    }

    let data: any = { product_id, cart_quantity, user_id };
    let result = await this.insertRecord(data);
    return functionObj.output(200, 1, "Product Added success...", result);
  }

  //   --------------------------- get all cart products --------------------------

  async getAllCartProducts() {
    let functionObj = new functions();
    let result1: any = await this.select(
      this.table,
      "*",
      this.where,
      this.orderby,
      this.limit
    );
    return functionObj.output(200, 1, "Get success...", result1);
  }

  //   ------------------------------- delete by id ----------------------------------

  async removeCartItems(id: number) {
    let functionObj = new functions();
    let where1 = "where id=" + id;
    let result: any = await this.delete(this.table, where1);
    return functionObj.output(200, 1, "Delete cart success...", result);
  }
}
