import { Pool } from "pg";

export class connection {
  static connection: any;

  /**
   * Create connection by Singletone method. If connection is not created, then only new connection will create.
   */
  async getConnection() {
    if (!connection.connection) {
      let result = await this.connect();
      if (!result) return false;
    }
    return connection.connection;
  }

  /**
   * This function will connect DB with required DB credentials.
   */
  async connect() {
    connection.connection = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: 5432,
    });

    try {
      let result = await connection.connection.connect();
      if (result) {
        console.log("Database Connected!");
      }
      return result;
    } catch (error) {
      connection.connection = false;
      return false;
    }
  }
}
