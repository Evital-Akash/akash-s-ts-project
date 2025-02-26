import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Checkoutdb extends appdb {
  constructor() {
    super();
    (this.table = "shipping_address"), (this.uniqueField = "id");
  }

  async addShippingAddress(
    sh_address1: any,
    sh_address2: any,
    sh_city: string,
    sh_state: string,
    sh_country: string,
    sh_pincode: number,
    sh_latitude: number,
    sh_logitude: number,
    user_id: number
  ) {
    const functionObj = new functions();

    const data: any = {
      sh_address1,
      sh_address2,
      sh_city,
      sh_state,
      sh_country,
      sh_pincode,
      sh_latitude,
      sh_logitude,
      user_id,
    };

    let result: any = await this.insertRecord(data);
    return functionObj.output(200, 1, "Address added success...", result);
  }
}
