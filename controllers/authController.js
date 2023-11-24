const User = require('../models/User')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const jwt = require('jsonwebtoken');
const {attachCookiesToResponse } = require('../utils');
const createTokenUser = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};
const register  = async(req, res)=>{
    const {name,email,password} = req.body;
    const emailAlreadyExists  = await User.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email already exists');
      }
    //first user registered will be admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';
  const user = await User.create({ name, email, password, role });
  //token generate
  const tokenUser = createTokenUser(user)
  // const token = jwt.sign(tokenUser,'jwtsecret',{expiresIn:'1d'})
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(201).json({user: tokenUser})
   
}
const login = async(req, res)=>{
   const {email, password} = req.body
   if(!email || !password){
    throw new CustomError.BadRequestError('Please provide email and password')
   }
   //query using email from database
   const user = await User.findOne({email});
   if(!user){
    throw new CustomError.UnauthenticatedError('Invalid Credientials')
   }
   //compare password
   const isPasswordCorrect = await user.comparePassword(password)
   if(!isPasswordCorrect){
    throw new CustomError.UnauthenticatedError('Invalid Credientials')
   }
   //token generate
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(200).json({user: tokenUser})
}
const logout = async(req, res)=>{
   res.cookie('token','logout',{
    httpOnly: true,
    expires: new Date(Date.now())
   })
   res.status(200).json({msg:"logout user"})
}
module.exports = {
    register,
    login,
    logout,
  };