require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()) 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeflzv2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   //await client.connect();


      const taskCollection = client.db("taskDB").collection("tasks")

     app.get("/tasks", async(req,res)=>{
      const email =req.query.email;
      let query = {};
      if(email){
        query={email:email};
      }
      const tasks= await taskCollection.find(query).toArray();
      res.send(tasks);
     });

   app.get('/tasks/:id',async(req,res)=>{
      
        const id = req.params.id;
        const query ={_id:new ObjectId(id)}
        const result = await taskCollection.findOne(query);
        res.send(result);
    })




    // delete
 // DELETE a task by ID
app.delete('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  try {
    const result = await taskCollection.deleteOne(query);
    res.send(result); // result.deletedCount will be > 0 if successful
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send({ error: 'Failed to delete task' });
  }
});



    // bid

    app.get('/bids', async (req, res) => {
  const taskId = req.query.taskId;

  if (!taskId) {
    return res.status(400).send({ error: 'Missing taskId query parameters' });
  }

  const query = { _id: new ObjectId(taskId) };
  const task = await taskCollection.findOne(query);

  if (!task) {
    return res.status(404).send({ error: 'Task not found' });
  }

  res.send(task.bids || []);
});


    // update 
    app.put('/tasks/:id',async(req,res)=>{
      const id = req.params.id
      const updateTask= req.body

      const filter={_id: new ObjectId(id)};
      const updateDoc ={
        $set:updateTask
      };

      const result = await taskCollection.updateOne(filter,updateDoc )
      res.send(result)
    });
  //  bid***********************
      app.post('/tasks/:id/bids', async (req, res) => {
  const taskId = req.params.id;
  const newBid = req.body;

  const filter = { _id: new ObjectId(taskId) };
  const updateDoc = {
    $push: { bids: newBid }
  };

  const result = await taskCollection.updateOne(filter, updateDoc);
  res.send(result);
});



    app.post("/tasks", async(req,res)=>{
        const newTask =req.body;
        console.log(newTask);
        const result = await taskCollection.insertOne(newTask);
        res.send(result)
    })



    // Send a ping to confirm a successful connection
  //await client.db("admin").command({ ping: 1 });
   // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req ,res)=>{
    res.send(" my server connecting ")
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})