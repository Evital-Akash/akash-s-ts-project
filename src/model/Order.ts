import { appdb } from "./appdb";
import { functions } from "../library/function";
import { OrderItemsdb } from "./order_details";
import { Cartdb } from "./Cart";

export class Orderdb extends appdb {
  constructor() {
    super();
    this.table = "orders";
    this.uniqueField = "id";
  }

  //   ---------------------- create new order (place order) ---------------------------------------
  async createOrder(o_discounts: number, p_gst_percentage: number, user_id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let where1 = `where user_id = ${user_id}`;
      let result1: any[] = await this.select("cart", "id", where1, this.orderby, this.limit);

      if (result1.length === 0 || !result1) {
        return_data.message = "NO ITEMS ARE AVAILABLE IN CART..PLZ ADD PRODUCT IN CART";
        return return_data;
      }
      const cartId = result1[0].id;

      let tb1 = `cart join products on cart.product_id=products.id`;
      let field1 = `cart.product_id, cart.cart_quantity, products.p_price,products.p_discount,products.p_hsn_code`;
      let where2 = `where cart.user_id = ${user_id}`;

      let cartItems: any[] = await this.select(tb1, field1, where2, this.orderby, this.limit);

      if (!cartItems || cartItems.length === 0) {
        return_data.message = "NO ITEMS FOUND IN CART TO ORDER...";
        return return_data;
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

      let data: any = { user_id, o_total: productTotal, o_discounts: totalDiscounts, o_gross_amt: discountedTotal, o_gst: gstAmount, o_net_amt: totalWithGST, };
      let neworder = await this.insertRecord(data);
      let orderId: number = neworder;

      for (let item of cartItems) {
        let OrderItemsObj = new OrderItemsdb();

        let data: any = {
          order_id: orderId,
          product_id: item.product_id,
          oi_quantity: item.cart_quantity,
          oi_price: item.p_price,
          oi_total: item.p_price * item.cart_quantity,
        };
        let result4 = await OrderItemsObj.insertRecord(data);

        if (!result4) {
          return_data.message = "NOT INSERTED IN ORDER_ITEMS..";
          return return_data;
        }
      }

      let cartObj = new Cartdb();
      let res1 = await cartObj.deleteRecord(cartId);
      return_data.error = false;
      return_data.data = res1;
      return_data.message = "ORDER CREATE SUCCESSFULLY...";

    } catch (error) {
      console.error("Error in create order:", error);
      return_data.message = "Error in create order"
    }
    return return_data;
  }

  // ------------------------------ get all order items ---------------------------------

  async getAllOrderItems() {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.select("order_items", "*", this.where, this.orderby, this.limit);
      if (!result || result.length === 0) {
        return_data.message = "NO ANY ORDER_ITEMS FOUND.."
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "GET ALL ORDER_ITEMS SUCCESS...."
    } catch (error) {
      console.error("Error in get order:", error);
      return_data.message = "Error in get order"
    }
    return return_data;
  }

  // ---------------------------- get all orders ----------------------------------------------

  async getAllorders() {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let result: any = await this.select(this.table, "*", this.where, this.orderby, this.limit);
      if (!result || result.length === 0) {
        return_data.message = "NO ANY ORDER FOUND.."
      }
      return_data.error = false;
      return_data.data = result;
      return_data.message = "GET ALL ORDER SUCCESS...."

    } catch (error) {
      console.error("Error in get order:", error);
      return_data.message = "Error in get order"
    }
    return return_data;
  }

  // ---------------------------------- delete orders -------------------------------

  async deleteOrders(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      this.where = `where order_id=${id}`;
      let order_delete: any = await this.delete("order_items", this.where);

      if (!order_delete) {
        return_data.message = "NO ITEMS FOUND IN ORDER..";
        return return_data;
      }

      let wh1 = `where id = ${id}`;
      let orderItems_delete: any = await this.delete(this.table, wh1);
      if (!orderItems_delete) {
        return_data.message = "NO ITEMS DELETED IN ORDER_ITEMS...";
        return return_data;
      }
      return_data.error = false;
      return_data.data = orderItems_delete;
      return_data.message = "ORDER DELETE SUCCESS.."

    } catch (error) {
      console.error("Error in delete order:", error);
      return_data.message = "Error in delete order"
    }
    return return_data;
  }

  //   ----------------------- get current user orders ----------------------------------

  async getCurrentUserOrders(id: number) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let where = `WHERE id=${id}`;
      let result: any = await this.select("users", "*", where, this.orderby, this.limit);

      if (!result || result.length === 0) {
        return_data.message = "USER NOT FOUND..";
        return return_data;
      }

      let fields = `orders.id AS order_id`;
      let where2 = `WHERE orders.user_id=${id}`;
      this.orderby = `ORDER BY orders.o_created_at desc`;
      let result2: any[] = await this.select(this.table, fields, where2, this.orderby, this.limit);

      let productIdQry: any[] = await Promise.all(
        result2.map(async (order: any) => {
          let f2 = `p.id AS product_id`;
          let w2 = `WHERE oi.order_id=${order.order_id}`;
          let or2 = `order_items oi JOIN products p ON oi.product_id=p.id`;
          let productQry: any = await this.select(or2, f2, w2, "", this.limit);
          return {
            order_id: order.order_id,
            products: productQry,
          };
        })
      );
      return_data.error = false;
      return_data.data = {
        username: result[0]?.u_name,
        orders: productIdQry,
      }
      return_data.message = "GET SUCCESS.."

    } catch (error) {
      console.error("Error in get current user order:", error);
      return_data.message = "Error in get current user order"
    }
    return return_data;
  }
}
