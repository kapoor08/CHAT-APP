//external packages
require("dotenv").config({path: "./.env"});
const express = require("express");
require("express-async-errors");
// const { chats } = require("./data/data");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5200;
const uri = process.env.MONGO_URI;
const hostname = "localhost";


const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes"); 
const errorHandler  = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); //to accept JSON Data from the frontend
connectDB(uri);


app.use("/api/user", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);


//middleware
app.use(errorHandler);
app.use(notFound);

// app.get("/", (req, res)=>{
//     res.send("API is running");
// });

// app.get("/api/chat", (req, res)=>{
//     res.send(chats);
// });


const server = app.listen(PORT, () => {
        console.log(`Connected To MongoDB + Server is listening on http://${hostname}:${PORT}`); 

      });


  //start the app
  // server();


  
io = require("socket.io")(server, {
  cors: {
    origin : "http://localhost:3000"
  }
})

io.on("connection", (socket) =>{
  console.log("Connected to Socket.io");

  socket.on("setup", (userData) =>{
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  })

  socket.on("join chat", (room) =>{
    socket.join(room);
    console.log("User joined Room: " + room);
  })

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) =>{
    var chat = newMessageReceived.chat;
    if(!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach(user =>{
      if(user._id == newMessageReceived.sender._id){
        return;
      }

      socket.in(user._id).emit("message received", newMessageReceived);
    })
  })

  socket.off("setup", ()=>{
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  })
})

