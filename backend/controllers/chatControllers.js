const asyncHandler = require("express-async-handler");
const Chat = require("../models/ChatModel");
const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const generateToken = require("../config/generateToken");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("UserId param not sent with request");
    throw new Error("Bad request", StatusCodes.BAD_REQUEST);
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
  }

  try {
    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );
    res.status(StatusCodes.OK).send(fullChat);
  } catch (error) {
    throw new Error(error.message, StatusCodes.BAD_REQUEST);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(StatusCodes.OK).send(results);
      });
  } catch (error) {
    throw new Error(error.message, StatusCodes.BAD_REQUEST);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
    if(!req.body.users || !req.body.name){
        return res.status(StatusCodes).send({message: "Please fill all the fields"});
    }
    var users = JSON.parse(req.body.users);
    if(users.length < 2){
        return res.status(StatusCodes.BAD_REQUEST).send("More than 2 users are required to form a group chat");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName : req.body.name,
            users : users,
            isGroupChat : true,
            groupAdmin : req.user
        });

    const fullGroupChat = await Chat.findOne({_id: groupChat._id}).populate("users","-password").populate("groupAdmin","-password");
    res.status(StatusCodes.OK).json(fullGroupChat);
    } catch (error) {""
        throw new Error(error.message, StatusCodes.UNAUTHORIZED);
    }
});

const renameGroup = asyncHandler(async (req, res) => {
    const {chatId, chatName} = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName
        },
        {
            new: true
        }
    ).populate("users","-password").populate("groupAdmin","-password");


    if(!updatedChat){
        throw new Error("Chat Not Found", StatusCodes.NOT_FOUND);
    }
    else{
        res.json(updatedChat);
    }
});


const addToGroup = asyncHandler(async (req, res) => {
    const {chatId, userId} = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, {
        $push : {users: userId},
    },
    {new: true}).populate("users","-password").populate("groupAdmin","-password");

    if(!added){
        throw new Error("Chat Not found",StatusCodes.NOT_FOUND);
    }
    else{
        res.json(added);
    }
});

const removeFromGroup = asyncHandler(async (req, res) => {
    const {chatId, userId} = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId, {
        $pull : {users: userId},
    },
    {new: true}).populate("users","-password").populate("groupAdmin","-password");

    if(!removed){
        throw new Error("Chat Not found",StatusCodes.NOT_FOUND);
    }
    else{
        res.json(removed);
    }
});


module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
