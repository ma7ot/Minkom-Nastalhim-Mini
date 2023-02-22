import mysql from "mysql2/promise";

export async function dbConnection() {
    const dbconnection = await mysql.createConnection({
      host: process.env.NEXT_PUBLIC_DB_HOST, //DB_HOST
      database: process.env.NEXT_PUBLIC_DB_NAME,
      // port: 8889,
      user: process.env.NEXT_PUBLIC_DB_USER,
      password: process.env.NEXT_PUBLIC_DB_PASS,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
      //socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    });
    return dbconnection;
  }