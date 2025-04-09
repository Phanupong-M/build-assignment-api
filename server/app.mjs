import express from "express";
import connectionPool from './utils/db.mjs'

const app = express();
const port = 4001;

app.use(express.json())

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});


//post assignments
app.post("/assignments", async (req,res) => {

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
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
   )

  return res.status(201).json({
    message: "Created assignment sucessfully"
  })
  }catch(error){
    return res.status(500).json({
      message: "Server could not create assignment because database connection"
    })
  }
})

//get all assignment
app.get('/assignments', async (req,res) => {
  try{
    const result = await connectionPool.query('select * from assignments')
    return res.status(200).json({
      data: result.rows
    })
  }catch(error){
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    })
  }
})

//get assignment by id
app.get('/assignments/:assignmentId', async (req,res) => {
  const assignmentId = req.params.assignmentId
  try{
    const result = await connectionPool.query('select * from assignments where assignment_id = $1',[assignmentId])
    console.log(result)
    if (!result.rows[0]){
      res.status(404).json({
        message: `Server could not find a requested assignment id: ${assignmentId}`
      })
    }
    return res.status(200).json({
      data: result.rows[0]
    })
  }catch(error){
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    })
  }
})


//put assignment by id
app.put('/assignments/:assignmentId', async (req,res) => {
  const assignmentId = req.params.assignmentId

  const newAssignment = {
    ...req.body,
    updated_at: new Date(),
  }
  try{
    const result = await connectionPool.query(
      `update assignments
      set title = $1,
          content = $2,
          category = $3,
          updated_at = $4
      where assignment_id = $5
      `,
       [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.updated_at,
        assignmentId
      ]
      
   )
   if (result.rowCount === 0){
      return res.status(404).json({
        message: "Server could not find a requested assignment to update"
      })
   }
   return res.status(200).json({
      message: "Updated assignment sucessfully"
  })
  }catch(error){
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
      error: error.message
    })
  }
})

//delete assignment
app.delete('/assignments/:assignmentId', async (req,res)=> {
  const assignmentId = req.params.assignmentId
  try{
    const result = await connectionPool.query(
      `delete from assignments
      where assignment_id = $1 
      `,
       [assignmentId]
   )

   console.log(result.rowCount)
   
   if (result.rowCount === 0){
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete"
      })
   }
   return res.status(200).json({
    message: "Deleted assignment sucessfully"
  })
  }catch(error){
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
      error: error.message
    })
  }
})


app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
