import { appdb } from "./appdb";

export class OrderItemsdb extends appdb {
  constructor() {
    super();
    (this.table = "order_items"), (this.uniqueField = "id");
  }
}