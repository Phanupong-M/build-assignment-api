import express from "express";
// import connectionPool from "./utils/db.mjs";
import connectionPool from './utils/db.mjs';
// import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

// testing
app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});


/// Post, and connectionPool query
app.post("/assignments", async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ message: "Server could not create assignment because there are missing data from client"});
}
  try {
    const newAssignment = { ...req.body };
    newAssignment.created_at = new Date();
    newAssignment.updated_at = new Date();

    // Insert the new assignment into the database via SQL code
    const results = await connectionPool.query(
      `INSERT INTO assignments (title, content, category, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.updated_at
      ]
    );

    res.status(201).json({ message: "Created assignment successfully", assignment: results.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});





