// api folder ---> Welcome to the server-side world
// Request Handler Function
const md5 = require('md5');
const jwt = require("jsonwebtoken");

import { dbConnection } from "../../utils/dbConnection";

const jwtSecretKey = "#$^9db7df90$#6907bdf23ldnvsd";

export async function findUser(username) {

  const dbconnection = await dbConnection();

  try {
    //const query = "SELECT u.*, rl.id as shop_id FROM users u LEFT JOIN restaurant_list rl ON rl.user_id=u.id WHERE u.email='"+username+"'";
    const query = "SELECT * FROM user WHERE name = '" + username + "'";
    const values = [];
    var [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    return data;
  } catch (error) {
    // unhide to check error
    console.log("Error: ", error)

    return "failed";
  }
}

export async function findStaff(username) {

  const dbconnection = await dbConnection();

  try {
    const query = "SELECT * FROM staff_list WHERE email = '" + username + "'";
    const values = [];
    const [data] = await dbconnection.execute(query, values);

    var query1 = "SELECT * FROM restaurant_list WHERE id =" + data[0].shop_id
    var [data1] = await dbconnection.execute(query1, values);

    data[0].shops = data1
    dbconnection.end();

    // console.log(data);
    return data;
  } catch (error) {
    // unhide to check error
    console.log("Error: ", error)

    return "failed";
  }
}

// ----------------------------------------------------*
export async function login(username, password, isQrlix) {
  var user;
  var isStaff = false;
  if (!username || !password) {
    return {
      error: "WRONG_CREDENTIAL",
      message: `Both Username and Password are required.`,
    };
  }
  user = await findUser(username); //user={}

  if (user.length == 0) {
    return {
      error: "WRONG_CREDENTIAL",
      message: "Email and password combination mismatch!",
    };
  }
  var hashedPassword;
  hashedPassword = password;


  if (!checkPassword(hashedPassword, user[0].password)) {
    return {
      error: "WRONG_CREDENTIAL",
      message: "Your Password is wrong.",
    };
  }

  if (isStaff == true) {
    user[0]['is_staff'] = 1
  } else {
    user[0]['is_staff'] = 0
  }
  // Create new token by username
  const token = jwt.sign(user[0], jwtSecretKey, {
    expiresIn: 864000, // 48 HOURS
  });

  return {
    payload: {
      token,
      user: user[0]
    },
  };
}

function hashPassword(password) {
  return md5(password);
}

function checkPassword(currentHashedPassword, hashedPassword) {
  return currentHashedPassword == hashedPassword;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(403).json({
      error: "METHOD_NOT_ALLOWED",
      message: `${req.method} is not allowed.`,
    });
    return;
  }

  console.log("incoming data: ", req.body)
  const { username, password, isQrlix } = JSON.parse(req.body);

  try {
    var response = await login(username, password, isQrlix);

    res.status(200).json(response);

  } catch (error) {
    // unhide to check error
    console.log("Error: ", error)
    res.status(500).json({ error: error.message });
  }


}
