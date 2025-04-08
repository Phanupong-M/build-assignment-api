import express from "express";
import connectionPool from "./utils/db.mjs";
const app = express();
const port = 4001;
app.use(express.json());


app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments",async (req,res)=>{    
  const newAssignments={
      ...req.body,
      created_at : new Date(),
      updated_at : new Date(),
      published_at : new Date(),
    }
    if(!newAssignments.title||!newAssignments.content||!newAssignments.category){
    
      return res.status(400).json({ "message": "Server could not create assignment because there are missing data from client" })
    }
    try{
      await connectionPool.query(
        `Insert into assignments (title,content,category,created_at,updated_at,published_at)
        values($1,$2,$3,$4,$5,$6)`,[
          newAssignments.title,
          newAssignments.content,
          newAssignments.category,
          newAssignments.created_at,
          newAssignments.updated_at,
          newAssignments.published_at
        ]
      )
      return res.status(201).json({ "message": "Created assignment sucessfully"})
    }catch(e){
      return res.status(500).json({ "message": "Server could not create assignment because database connection" })
    }
})

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query('SELECT * FROM assignments');
    return res.status(200).json(result.rows);
  } catch (e) {
    console.error(e); // แนะนำให้ log error
    return res.status(500).json({ message: "Server could not retrieve assignments due to database connection error." });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
