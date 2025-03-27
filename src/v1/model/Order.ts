import { appdb } from "./appdb";
import { OrderItemsdb } from "./Order_details";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class Orderdb extends appdb {
  constructor() {
    super();
    this.table = "orders";
    this.uniqueField = "id";
  }

  //   ---------------------- create new order (place order) ---------------------------------------
  async createOrder(user_id: number, cartItems: any[]) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    };
    try {
      let whe2 = `WHERE id=${user_id}`
      let res2: any = await this.select("users", "u_email", whe2, this.orderby, this.limit);
      if (!res2.length) throw new Error("User not found");
      if (!cartItems || cartItems.length === 0) {
        return_data.message = "NO ITEMS FOUND IN CART TO ORDER.";
        return return_data;
      }
      const productIds = cartItems.map(item => item.product_id).join(",");
      let datas = `id,p_name,p_price,p_img`
      let productIDWhere = `WHERE id IN (${productIds})`
      let productData: any[] = await this.select("products", datas, productIDWhere, this.orderby, this.limit);
      if (!productData.length) {
        return_data.message = "PRODUCTS NOT FOUND. PLEASE CHECK YOUR CART.";
        return return_data;
      }

      cartItems = cartItems.map(item => {
        let product = productData.find(p => p.id === item.product_id);
        if (!product) throw new Error(`Product not found for ID: ${item.product_id}`);
        return { ...item, ...product };
      });
      if (!cartItems.every(item => item.p_price && item.p_name)) {
        console.log("Invalid cart items:", JSON.stringify(cartItems, null, 2));
        throw new Error("Missing product details in cartItems.");
      }

      const productTotal = cartItems.reduce((total, item) => total + item.p_price * item.cart_quantity, 0);
      const discount = Math.round((productTotal * 10) / 100);
      const discountedTotal = productTotal - discount;
      const gstPercentage = 12;
      const gstAmount = Math.round((discountedTotal * gstPercentage) / 100);
      const totalWithGST = Math.round(discountedTotal + gstAmount);

      const lineItems = cartItems.map((item: any) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.p_name,
            images: item.p_img ? [item.p_img] : [],
          },
          unit_amount: Math.round((item.p_price - (item.p_price * 0.10)) * 100),
        },
        quantity: item.cart_quantity,
      }));


      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: { name: `GST (${gstPercentage}%)`, images: [] },
          unit_amount: Math.round(gstAmount * 100),
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        customer_email: res2[0].u_email,
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: ["IN"],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 5000, currency: "INR" },
              display_name: "Standard Shipping",
            },
          },
        ],
        metadata: {
          userId: user_id.toString(),
        },
      });
      return_data.error = false;
      return_data.data = { url: session.url };
      return_data.message = "REDIRECTING TO PAYMENT PAGE...";
    } catch (error) {
      console.error("Error in createOrder:", error);
      return_data.message = "Error in processing the order.";
    }
    return return_data;
  }
  // ------------------------ save --------------------------------------------------------------------

  async handlePaymentSuccess(sessionId: string, ip: any) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    };
    try {
      const session: any = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session.metadata?.userId) throw new Error("User ID missing from session metadata");

      const user_id = parseInt(session.metadata?.userId, 10);

      const shipping = session.shipping_details?.address;
      if (!shipping) {
        return_data.message = "SHIPPING DETAILS NOT FOUND.";
        return return_data;
      }
      let tb1 = `cart JOIN products ON cart.product_id=products.id`;
      let field1 = `cart.product_id,cart.cart_quantity,products.id,products.p_price,products.p_discount,products.p_hsn_code`;
      let where2 = `where cart.user_id = ${user_id}`;
      let cartItems: any[] = await this.select(tb1, field1, where2, this.orderby, this.limit);

      if (!cartItems.length) {
        return_data.message = "NO ITEMS FOUND IN CART.";
        return return_data;
      }
      const productTotal = cartItems.reduce((total, item) => total + item.p_price * item.cart_quantity, 0);
      const discount = Math.round((productTotal * 10) / 100);
      const discountedTotal = productTotal - discount;
      const gstAmount = Math.round((discountedTotal * 12) / 100);
      const totalWithGST = discountedTotal + gstAmount;

      let shippingData = {
        user_id: user_id,
        sh_address1: shipping.line1,
        sh_address2: shipping.line2 || "",
        sh_city: shipping.city,
        sh_state: shipping.state,
        sh_country: shipping.country,
        sh_pincode: shipping.postal_code,
        sh_latitude: null,
        sh_logitude: null,
        sh_ipaddress: ip,
      };

      this.where = `WHERE user_id=${user_id} AND sh_address1 ILIKE '${shippingData.sh_address1}' AND sh_address2 ILIKE '${shippingData.sh_address2}' AND sh_pincode='${shippingData.sh_pincode}'`;
      let existingAddress = await this.select("shipping_address", "*", this.where, this.orderby, this.limit);
      if (existingAddress.length > 0) {
        return_data.message = "ADDRESS IS ALREADY EXIST..";
        return return_data;
      }
      else {
        let addUpdated = this.insert("shipping_address", shippingData);
        if (!addUpdated) {
          return_data.message = "ADDRESS IS NOT UPDATED..";
          return return_data;
        }
        let orderData = {
          user_id,
          o_total: productTotal,
          o_discounts: discount,
          o_gross_amt: discountedTotal,
          o_gst: gstAmount,
          o_net_amt: totalWithGST,
          payment_id: sessionId,
          o_address1: shipping.line1,
          o_address2: shipping.line2 || "",
          o_city: shipping.city,
          o_state: shipping.state,
          o_country: shipping.country,
          o_pincode: shipping.postal_code,
          payment_status: 'paid',
          o_ipaddress: ip
        };

        let newOrder = await this.insertRecord(orderData);
        if (!newOrder) {
          return_data.message = "ORDER CREATION FAILED!";
          return return_data;
        }

        let orderId = newOrder;
        let OrderItemsObj = new OrderItemsdb();
        for (let item of cartItems) {
          try {
            await OrderItemsObj.insertRecord({
              order_id: orderId,
              product_id: item.product_id,
              oi_quantity: item.cart_quantity,
              oi_price: item.p_price,
              oi_total: item.p_price * item.cart_quantity,
              oi_ipaddress: ip
            });
            console.log(`Order item inserted successfully for order ID: ${orderId}, product ID: ${item.product_id}`);
          } catch (error) {
            console.error(`Error inserting order item for order ID: ${orderId}, product ID: ${item.product_id}`, error);
            return_data.message = "Error inserting order items.";
            return return_data;
          }
        }

        let cartWhere = `where user_id=${user_id}`;
        let deleteCart: any = await this.delete("cart", cartWhere);

        if (!deleteCart) {
          return_data.message = "CART ITEMS NOT DELETED...";
          return return_data;
        }
        return_data.error = false;
        return_data.message = "YOUR ORDER SUCCESSFULLY PLACED...!";
        return_data.data = { orderId, totalWithGST };
      }
    } catch (error) {
      console.error("Error in handlePaymentSuccess:", error);
      return_data.message = "Error in saving order details.";
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
      data: { result: [] }
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

      let ordersObj: any = {};

      await Promise.all(
        result2.map(async (order: any) => {
          let f2 = `p.id AS product_id,p.p_img,p.p_name,oi.oi_quantity,p.p_price,oi_total,o_address1,o.o_address2,o.o_city,o.o_state,o.o_country,o.o_pincode,o.o_created_at,o.o_gross_amt,o.o_net_amt,o.o_gst,o.o_discounts,o.o_status`;
          let w2 = `WHERE oi.order_id=${order.order_id}`;
          let or2 = `order_items oi JOIN products p ON oi.product_id=p.id JOIN orders o ON oi.order_id = o.id`;
          let productQry: any = await this.select(or2, f2, w2, "", this.limit);

          let productObj: any = {};
          productQry.forEach((product: any) => {
            productObj[product.product_id] = {
              product_id: product.product_id,
              p_img: product.p_img,
              p_name: product.p_name,
              oi_quantity: product.oi_quantity,
              p_price: product.p_price,
              oi_total: product.oi_total,
              o_address1: product.o_address1,
              o_address2: product.o_address2,
              o_city: product.o_city,
              o_state: product.o_state,
              o_country: product.o_country,
              o_pincode: product.o_pincode,
              o_created_at: product.o_created_at,
              o_discounts: product.o_discounts,
              o_gross_amt: product.o_gross_amt,
              o_gst: product.o_gst,
              o_net_amt: product.o_net_amt,
              o_status: product.o_status
            };
          });

          ordersObj[order.order_id] = {
            order_id: order.order_id,
            products: productObj
          };
        })
      );

      return_data.error = false;
      return_data.data = {
        username: result[0]?.u_name,
        orders: ordersObj,
      };
      return_data.message = "GET SUCCESS.."

    } catch (error) {
      console.error("Error in get current user order:", error);
      return_data.message = "Error in get current user order"
    }
    return return_data;
  }


  // ------------------------ update order status ---------------------------------

  async updateorderStatus(id: number, o_status: string) {
    let return_data = {
      error: true,
      message: "",
      data: {}
    }
    try {
      let data: any = { o_status }
      let result: any = this.updateRecord(id, data);

      if (!result || result.length === 0) {
        return_data.message = "STATUS NOT UPDATED...";
        return return_data;
      }

      return_data.error = false;
      return_data.data = result;
      return_data.message = "STATUS UPDATE SUCCESS.."
    } catch (error) {
      console.error("Error in UPDATE orders status:", error);
      return_data.message = "Error in update order status"
    }
    return return_data;
  }
}
