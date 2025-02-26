import { appdb } from "./appdb";
import { functions } from "../library/function";

export class Feedbackdb extends appdb {
  constructor() {
    super();
    (this.table = "reviews"), (this.uniqueField = "id");
  }

  //   ---------------------------- add feedback -------------------------------------
  async addFeedback(
    r_rating: number,
    r_comment: any,
    r_img: string,
    product_id: number
  ) {
    let functionObj = new functions();

    let data: any = {
      r_rating,
      r_comment,
      r_img,
      product_id,
    };

    let result = await this.insertRecord(data);
    return functionObj.output(200, 1, "Feedback added success...", result);
  }
}
