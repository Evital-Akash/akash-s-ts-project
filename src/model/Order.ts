import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Orderdb extends appdb {
  constructor() {
    super();
    this.table = "orders";
    this.uniqueField = "id";
  }

  //   ---------------------- create new order (place order) ---------------------------------------
  async createOrder(
    o_discounts: number,
    p_gst_percentage: number,
    user_id: number
  ) {
    const functionObj = new functions();

    let where1 = `where user_id = ${user_id}`;
    let result1: any[] = await this.select(
      "cart",
      "id",
      where1,
      this.orderby,
      this.limit
    );

    if (result1.length === 0 || !result1) {
      return functionObj.output(
        422,
        0,
        "No items are available in the cart. Please add products to the cart first."
      );
    }
    const cartId = result1[0].id;

    let tb1 = `cart join products on cart.product_id=products.id`;
    let field1 = `cart.product_id, cart.cart_quantity, products.p_price,products.p_discount,products.p_hsn_code`;
    let where2 = `where cart.user_id = ${user_id}`;

    let cartItems: any[] = await this.select(
      tb1,
      field1,
      where2,
      this.orderby,
      this.limit
    );

    if (!cartItems || cartItems.length === 0) {
      return functionObj.output(423, 0, "No items find in cart to orders..");
    }

    let productTotal: number = 0;
    let productDiscount: number = 0;
    let totalWithoutGST: number = 0;
    let additionalDiscount: number = 0;
    let totalDiscounts: number = 0;

    cartItems.forEach((item) => {
      productTotal += item.p_price * item.cart_quantity;
      productDiscount += (productTotal * item.p_discount) / 100;
      totalWithoutGST += productTotal - productDiscount;
      totalDiscounts += productDiscount;
    });

    additionalDiscount = (totalWithoutGST * o_discounts) / 100;

    const discountedTotal = totalWithoutGST - additionalDiscount;
    const gstAmount = (discountedTotal * p_gst_percentage) / 100;
    const totalWithGST = discountedTotal + gstAmount;

    totalDiscounts += additionalDiscount;

    let data: any = {
      user_id,
      o_total: productTotal,
      o_discounts: totalDiscounts,
      o_gross_amt: discountedTotal,
      o_gst: gstAmount,
      o_net_amt: totalWithGST,
    };
    let neworder = await this.insertRecord(data);
    let orderId: number = neworder;

    for (let item of cartItems) {
      this.table = "order_items";
      let data: any = {
        order_id: orderId,
        product_id: item.product_id,
        oi_quantity: item.cart_quantity,
        oi_price: item.p_price,
        oi_total: item.p_price * item.cart_quantity,
      };
      let result4 = await this.insertRecord(data);

      if (!result4) {
        return functionObj.output(
          400,
          0,
          "not inserted in order items...",
          neworder
        );
      }
    }

    let wh2 = `where id=${cartId}`;
    let res1 = await this.delete("cart", wh2);
    return functionObj.output(200, 1, "Order created successfully!", neworder);
  }

  //   ----------------------- get all orders ----------------------------------------------

  async getOrders() {
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

  // ------------------------------ get all order items ---------------------------------

  async getAllOrderItems() {
    let functionObj = new functions();
    let result1: any = await this.select(
      "order_items",
      "*",
      this.where,
      this.orderby,
      this.limit
    );
    return functionObj.output(200, 1, "Get success...", result1);
  }

  // ---------------------------------- delete orders -------------------------------

  async deleteOrders(id: number) {
    let functionObj = new functions();
    let wh2 = `where order_id=${id}`;
    let result1: any = await this.delete("order_items", wh2);

    let wh1 = `where id = ${id}`;
    let result2: any = await this.delete(this.table, wh1);
    return functionObj.output(200, 1, "order delete success...");
  }

  //   ----------------------- get current user orders ----------------------------------

  async getCurrentUserOrders(id: number) {
    let functionObj = new functions();

    let where = `where id=${id}`;
    let result: any = await this.select(
      "users",
      "*",
      where,
      this.orderby,
      this.limit
    );


    if (!result) {
      return functionObj.output(200, 1, "User Not found...");
    }

    let fields = `orders.id as order_id`;
    let where2 = `where orders.user_id=${id}`;
    let orderby = `order by orders.o_created_at desc`;
    let result2: any[] = await this.select(
      this.table,
      fields,
      where2,
      orderby,
      this.limit
    );


    let productIdQry = await Promise.all(
      result2.map(async (order: any) => {
        let f2 = `p.id as product_id`;
        let w2 = `where oi.order_id=${order.order_id}`;
        let or2 = `order_items oi join products p on oi.product_id=p.id`;
        let productQry: any[] = await this.select(
          or2,
          f2,
          w2,
          this.orderby,
          this.limit
        );

        return {
          order_id: order.order_id,
          products: productQry,
        };
      })
    );

    return functionObj.output(200, 1, {
      username: result[0]?.u_name,
      orders: productIdQry,
    });
  }
}
