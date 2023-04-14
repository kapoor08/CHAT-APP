const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async(req, res) =>{
    const {name, email, password, pic} = req.body;

    if(!name || !email || !password){
        throw new Error("Please enter all the fields", StatusCodes.BAD_REQUEST);
    }
    const userExists = await User.findOne({email});

    if(userExists){
        throw new Error("User already exists", StatusCodes.BAD_REQUEST);
    }
    const user = await User.create({
        name, 
        email,
        password,
        pic
    });

    if(user){
        res.status(StatusCodes.CREATED).json({
            _id : user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }
    else{
        throw new Error("Failed to Create User", StatusCodes.BAD_REQUEST);
    } 
});


const authUser = asyncHandler(async (req, res) =>{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.json({
            _id : user._id,
            name : user.name, 
            email : user.email,
            isAdmin: user.isAdmin,
            pic : user.pic,
            token : generateToken(user._id)
        });
    }
    else{
        throw new Error("Invalid Email or Password", StatusCodes.UNAUTHORIZED);
    }
});


//  /api/user?search=lakshay
const allUsers = asyncHandler(async(req, res) =>{
    const keyword = req.query.search ? {
        $or : [
            { name : { $regex: req.query.search, $options : "i"}},
            { email : { $regex: req.query.search, $options : "i"}}
        ]
    }
    : {};
    // console.log(keyword);
    const users = await User.find(keyword).find({_id :{$ne: req.user._id}}).exec();
    res.send(users);
});


module.exports = {registerUser, authUser, allUsers};