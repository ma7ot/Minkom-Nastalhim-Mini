// api folder ---> Welcome to the server-side world
// Request Handler Function
const md5 = require('md5');
const jwt = require("jsonwebtoken");
import moment from 'moment'
import { dbConnection } from "../../utils/dbConnection";
import EscapeData from "../../utils/EscapeData";

function randomString(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}



const jwtSecretKey = "#$^9db7df90$#6907bdf23ldnvsd";

export async function findUser(phone) {

  const dbconnection = await dbConnection();

  try {
    const query = "SELECT * FROM students WHERE phone='" + phone + "'";
    const values = [];
    console.log(query);

    const [data] = await dbconnection.execute(query, values);
    console.log(data);
    dbconnection.end();

    return data;
  } catch (error) {
    // unhide to check error
    return "failed";
  }
}

export async function findUserToken(email) {

  const dbconnection = await dbConnection();

  try {
    //const query = "SELECT u.*, rl.id as shop_id FROM users u LEFT JOIN restaurant_list rl ON rl.user_id=u.id WHERE u.email='"+username+"'";
    const query = "SELECT * FROM users WHERE email = '" + email + "'";
    const values = [];
    console.log(query);
    var [data] = await dbconnection.execute(query, values);

    if (data.length > 0) {
      var query1 = "SELECT * FROM restaurant_list WHERE user_id =" + data[0].id
      var [data1] = await dbconnection.execute(query1, values);

      data[0].shops = data1
    }
    dbconnection.end();

    return data;
  } catch (error) {
    // unhide to check error
    return "failed";
  }
}


export async function registerUser(d) {

  const types = [1, 2, 3, 4, 5, 6]
  const dbconnection = await dbConnection();

  const uni = d.user.univeristy == 0 ? d.user.univeristySelect : d.user.univeristy;
  const limit = d.isVodaphone == true? 3 : 2
  try {
    const query = "INSERT INTO students (name, phone, univeristy, student_id, book_limit, book_received, created_at, img) VALUES (?,?, ?, ?, ?, ?, ?,?)";
    const values = [d.user.fullname, d.phone, uni, d.user.studentID, limit, 0, moment().locale('en').format("YYYY-MM-DD HH:mm:ss"), d.img];

    console.log(values);
    const [data] = await dbconnection.execute(query, values);
    console.log(data);
    dbconnection.end();

    if (data.affectedRows) {

      return data;
      /* const query2 = "INSERT INTO restaurant_list (shop_id,phone,user_id,username,name,email,status,created_at) VALUES ('"+randomString(6)+"', '"+d.bizzPhone+"', "+data.insertId+", '"+d.bizz.slug+"', '"+d.bizz.bizzName+"', '"+d.bizz.bizzEmail+"',1,'"+moment().format("YYYY-MM-DD HH:mm:ss")+"')";
       console.log(query2);
       const [data2] = await dbconnection.execute(query2, values);
       if(data2.affectedRows){
         for(const typ of types){
           var query3 = "INSERT INTO users_active_order_types (user_id, shop_id, type_id,status,is_payment,is_required,created_at) VALUES ('"+data.insertId+"', '"+data2.insertId+"', '"+typ+"', 0, 0, 0, '"+moment().format("YYYY-MM-DD HH:mm:ss")+"')";
           console.log(query3);
           var [data3] = await dbconnection.execute(query3, values);

         }
         return data2;

       }*/

    }
    return 'failed'
  } catch (error) {
    // unhide to check error
    console.log('Error: ', error)
    return "failed";
  }
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(403).json({
      error: "METHOD_NOT_ALLOWED",
      message: `${req.method} is not allowed.`,
    });
    return;
  }

  var incoming = EscapeData(req.body.user);
  console.log(incoming)

  if (incoming.fetch == 'checkUserEmailAvailability') {
    const email = incoming.email

    try {
      const dbconnection = await dbConnection();

      const query = "SELECT * FROM users WHERE email = '" + email + "'"

      const values = [];
      const [data] = await dbconnection.execute(query, values);
      dbconnection.end();

      res.status(200).json({ ok: true, data: data.length });
    } catch (error) {
      console.error("Error checking user email availability:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (incoming.fetch == 'checkPhoneAvailability') {
    const phone = incoming.phone

    try {
      const dbconnection = await dbConnection();

      const query = "SELECT * FROM students WHERE phone = '" + phone + "'"

      const values = [];
      const [data] = await dbconnection.execute(query, values);
      dbconnection.end();

      res.status(200).json({ ok: true, data: data.length });
    } catch (error) {
      console.error("Error checking phone availability:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    try {
      const checkUser = await findUser(incoming.phone)
      var err = true;
      if (checkUser.length == 0) {
        const register = await registerUser(incoming)
        if (register.insertId) {

          res.status(200).json({ set: true });


        } else {
          res.status(200).json({ set: false });
        }

      } else {
        res.status(200).json({ set: false });

      }

    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
