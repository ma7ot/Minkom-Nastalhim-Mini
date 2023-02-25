import { dbConnection } from "../../utils/dbConnection";
import moment from "moment";


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

        const query = "SELECT * FROM students ORDER BY created_at DESC";

        const values = [];
        const [data] = await dbconnection.execute(query, values);
        dbconnection.end();

        res.status(200).json({ ok: true, data: data });
      } catch (error) {
        console.error("Error:", error);
        // unhide to check error
        res.status(500).json({ ok: false, error: error.message });
      }
    }

    if (incoming.fetch == 'approveStudent') { //urrent_date

      const limit = incoming.limit
      const ID = incoming.ID
      try {

        const query = "UPDATE students SET status = 1, book_limit = " + limit + " WHERE id = " + ID

        const values = [];
        const [data] = await dbconnection.execute(query, values);
        dbconnection.end();

        res.status(200).json({ ok: true });
      } catch (error) {
        console.error("Error:", error);
        // unhide to check error
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
