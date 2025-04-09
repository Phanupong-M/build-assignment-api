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

app.get("/assignments", async (req, res) => {
  try {
    const results = await connectionPool.query("SELECT * FROM assignments");
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json({ message: "Server could not read assignment because database connection" });
  }
}) 


app.get("/assignments/:assignmentId", async (req, res) => {
  const assignFromClient = req.params.assignmentId;
  try {
    const results = await connectionPool.query("SELECT * FROM assignments WHERE assignment_id = $1", [assignFromClient]);
    if (results.rows.length === 0 || !results.rows[0]) {
      return res.status(404).json({ message: "Server could not find a requested assignment" });
    }
    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server could not read assignment because database connection" });
  }
})


app.put("/assignments/:assignmentId", async (req, res) => {
  const assignFromClient = req.params.assignmentId;
 

  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ message: "Server could not update assignment because there are missing data from client"});
}
/// SQL command
try {
  const updatedAssign = { ...req.body, updated_at: new Date() };
  const results = await connectionPool.query(
    `UPDATE assignments 
     SET title = $2, content = $3, category = $4, updated_at = $5 
     WHERE assignment_id = $1 
     RETURNING *`,
    [assignFromClient, updatedAssign.title, updatedAssign.content, updatedAssign.category, updatedAssign.updated_at]
  );

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment to update" });
    }

    res.status(200).json({ message: "Updated assignment successfully", assignment: results.rows[0] });
  } catch (error) {
    console.error("Update error:", error); // Log the error for debugging
    res.status(500).json({ message: "Server could not update assignment due to an internal server error" });
  }
}) 


app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignFromClient = req.params.assignmentId;
  try {
    const results = await connectionPool.query(
      "DELETE FROM assignments WHERE assignment_id = $1",
      [assignFromClient]
    );

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment to delete" });
    }

    res.status(200).json({ message: "Deleted assignment successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server could not delete assignment because database connection" });
  }
}) 



app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});





