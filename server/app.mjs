import express from "express";
import connectionPool from "./utils/db.mjs";
const app = express();
const port = 4001;
app.use(express.json());


app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => { 
  try {
    const result = await connectionPool.query('SELECT * FROM assignments');
    console.log(result)
    return res.status(200).json(result.rows);
  } catch (e) {
    return res.status(500).json( { "message": "Server could not read assignment because database connection" });
  }
});
app.get("/assignments/:assignmentId", async (req, res) => {
  let assignmentId = req.params.assignmentId;
  try {
    const result = await connectionPool.query('SELECT * FROM assignments where assignment_id = $1',[assignmentId]);
    if (result.rows.length <1) {return res.status(404).json({ "message": "Server could not find a requested assignment" })}
    return res.status(200).json(result.rows);
  } catch (e) {
    
    return res.status(500).json({ "message": "Server could not read assignment because database connection" });
  }
});
app.put("/assignments/:assignmentId", async (req,res) => {
  const assignmentId = req.params.assignmentId 
  const updatedAssignments = { ...req.body,
                              updated_at: new Date()
  }
  // if (!updatedAssignments.title||!updatedAssignments.content||!updatedAssignments.category){
  //   return res.status(---).json({ "message": "---" })
  // }
  try{
  const response = await connectionPool.query(
      'Update assignments set title=$1,content=$2,category=$3 where assignment_id=$4',[
        updatedAssignments.title,
        updatedAssignments.content,
        updatedAssignments.category,
        assignmentId
      ])
      if (response.rowCount<1){return res.status(404).json({"message": "Server could not find a requested assignment to delete" })}
  return res.status(200).json({"message": "Updated assignment sucessfully" })
  }catch(e){
     return res.status(500).json( { "message": "Server could not update assignment because database connection" })
    }
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
app.delete("/assignments/:assignmentId", async (req,res)=>{
  try{
  const id = req.params.assignmentId;
  const response = await connectionPool.query(
    'Delete From assignments where assignment_id = $1',[id]
  )
    if (response.rowCount<1){return res.status(404).json({ "message": "Server could not find a requested assignment to delete" })}
  return res.status(200).json({ "message": "Deleted assignment sucessfully" })
  }catch(e){return res.status(500).json({ "message": "Server could not delete assignment because database connection" })}
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
