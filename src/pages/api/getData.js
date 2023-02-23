import { dbConnection } from "../../utils/dbConnection";
import moment from "moment";

function verifyCouponUsage(data) {

  var res = {
    status: true,
    msg: ''
  }

  if (data.status == 0) {
    res.status = false
    res.msg = 'Coupon invalid!';
    return res;
  }

  if (data.total_used >= data.total_limit) {
    res.status = false
    res.msg = 'Coupon max usage limit reached';
    return res;
  }

  const currentDate = new Date();
  const currentTimeUTC = new Date(currentDate.getTime() + currentDate.getTimezoneOffset() * 60000);
  //conole.log(currentTimeUTC);

  if (new Date(data.start_date) >= currentTimeUTC) {
    res.status = false
    res.msg = 'Coupon will be available for usage on ' + moment(data.start_date).locale("en").format('DD-MM-YYYY HH:mm A');
    return res;
  }

  if (data.end_date != null && new Date(data.end_date) < currentTimeUTC) {
    res.status = false
    res.msg = 'Coupon expired on ' + moment(data.end_date).locale("en").format('DD-MM-YYYY HH:mm A');
    return res;
  }


  return res
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(403).json({
      error: "METHOD_NOT_ALLOWED",
      message: `Access denied!`,
    });
    return;
  }

  const authorizationToken = req.headers.authorization;
  if (authorizationToken) {
    const dbconnection = await dbConnection();

    var incoming = await req.body.user;
    console.log("incoming data: ", incoming)
    if (incoming.fetch == 'studentsList') { //urrent_date
      try {

        var query = "SELECT * FROM students"

        const values = [];
        const [data] = await dbconnection.execute(query, values);
        dbconnection.end();

        res.status(200).json({ ok: true, data: data });
      } catch (error) {
        console.error("Error:", error);
        // unhide to check error
        console.error("Error:", error);
        res.status(500).json({ ok: false, error: error.message });
      }
    }

    if (incoming.fetch == 'approveStudent') { //urrent_date

      const limit = incoming.limit
      const ID = incoming.ID
      try {

        var query = "UPDATE students SET status = 1, book_limit = " + limit + " WHERE id = " + ID

        const values = [];
        const [data] = await dbconnection.execute(query, values);
        dbconnection.end();

        res.status(200).json({ ok: true });
      } catch (error) {
        console.error("Error:", error);
        // unhide to check error
        console.error("Error:", error);
        res.status(500).json({ ok: false, error: error.message });
      }
    }
    if (incoming.fetch == 'updateStudent') { //urrent_date

      const limit = incoming.limit
      const ID = incoming.ID
      const rec = incoming.rec
      const prev = incoming.prev

      const books = incoming.books
      const booksImg = incoming.booksImg

      if (rec + prev > limit) {
        res.status(500).json({ ok: false, error: "Book limit exceeded" });
        return;
      }
      try {

        var query = "UPDATE students SET book_received = book_received + " + rec + " WHERE id = " + ID

        const values = [];
        const [data] = await dbconnection.execute(query, values);

        var key = 0
        for (const book of books) {
          let query = "INSERT INTO student_books (student_id, name, received_at, img) VALUES (?,?, ?, ?)";
          let values = [ID, book, moment().locale('en').format("YYYY-MM-DD HH:mm:ss"), booksImg[key]];
          let [data] = await dbconnection.execute(query, values);
          console.log(data)
          key++;
        }
        dbconnection.end();

        res.status(200).json({ ok: true });
      } catch (error) {
        console.error("Error:", error);
        // unhide to check error
        console.error("Error:", error);
        res.status(500).json({ ok: false, error: error.message });
      }
    }
  } else {
    res.status(401).json({
      error: "Unauthorized",
      message: "Not allowed.",
    });
  }

}
