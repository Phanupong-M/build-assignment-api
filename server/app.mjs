import express from "express";
import connectionPool from './utils/db.mjs'

const app = express();
const port = 4001;

app.use(express.json())

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/posts", async (req,res) => {

  const { title, content, category } = req.body

  if (!title || !content || !category) {
    return res.status(400).json({
      message: "Server could not create assignment because there are missing data from client"
    })
  }

   const newAssignment = {
     ...req.body,
     created_at: new Date(),
     updated_at: new Date(),
     published_at: new Date(),
   }
   try{
   await connectionPool.query(
      `insert into assignments (title, content, category, created_at, updated_at, published_at)
      values($1, $2, $3, $4, $5, $6)`,
       [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.created_at,
        newAssignment.published_at,
      ]
   )

  return res.status(201).json({
    message: "Created assignment sucessfully"
  })
  }catch(error){
    console.log(error.message)
    return res.status(500).json({
      message: "Server could not create assignment because database connection"
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
