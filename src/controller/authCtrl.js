const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const User = require("../models/UserModel")

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const authCtrl = {
    signup: async (req, res) => {   
        const {firstname, lastname, username} = req.body
        try {
            const setUser = await User.findOne({username});
            if(setUser) {
                return res.status(400).json({message: "This is username already exists!"})
            } else if(!firstname || !lastname || !username){
                return res.status(400).json({message: "Please fill all series!"})
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            const user = new User(req.body)
            await user.save();
            const {password, ...otherDetails} = user._doc
            const token = JWT.sign(otherDetails, JWT_SECRET_KEY, {expiresIn: '1h'});
            res.status(201).json({message: 'Signup successfully', user: otherDetails, token})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    
    login: async (req, res) => {
        const {username} = req.body
        try {
            const findUser = await User.findOne({username});   
            if(!findUser){
                return res.status(400).json({message: 'Login or Password is inCorrect'});
            }
            const verifyPassword = await bcrypt.compare(req.body.password, findUser.password);
            if(!verifyPassword){
                return res.status(400).json({message: 'Login or Password is inCorrect'})
            }
            const {password, ...otherDetails} = findUser._doc
            const token = JWT.sign(otherDetails, JWT_SECRET_KEY, {expiresIn: '1h'})

            res.status(200).json({message: 'Login successfully', user: otherDetails, token})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
}

module.exports = authCtrl