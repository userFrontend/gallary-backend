const User = require('../models/UserModel');

const cloudinary = require('cloudinary')
const bcrypt = require('bcrypt')
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  })

const removeTemp = (pathes) => {
    fs.unlink(pathes, err => {
      if(err){
        throw err
      }
    })
  }

const userCtrl = {
    get: async (req, res) => {
       try {
        const users = await User.find()
        res.status(200).json({message: 'All users', users})
        } catch (error) {
            res.status(503).json({message: error.message})
       } 
    },
    delete: async (req, res) => {
        const {id} = req.params
        if(!id){
            return res.status(403).json({message: 'insufficient information'})
        }
        try {
            const deleteUser = await User.findByIdAndDelete(id)
            if(!deleteUser){
                return res.status(400).send({message: 'User not found'})
            }
            if(deleteUser.profilePicture){
                await cloudinary.v2.uploader.destroy(deleteUser.profilePicture.public_id, async (err) =>{
                    if(err){
                        throw err
                    }
                })
            }
            res.status(200).send({message: 'User deleted', deleteUser})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    update: async (req, res) => {
        const {id} = req.params
        try {
            const updateUser = await User.findById(id)
            if(updateUser){
                if(req.body.password && (req.body.password != "")){
                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
                    req.body.password = hashedPassword;
                } else{
                    delete req.body.password
                }
                if(req.files){
                    const {image} = req.files;
                    if(image){
                        const format = image.mimetype.split('/')[1];
                        if(format !== 'png' && format !== 'jpeg') {
                            return res.status(403).json({message: 'file format incorrect'})
                        } else if(image.size > 1000000) {
                            return res.status(403).json({message: 'Image size must be less than (1) MB'})
                        }
                        const imagee = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                            folder: 'Gallary'
                        }, async (err, result) => {
                            if(err){
                                throw err
                            } else {
                                removeTemp(image.tempFilePath)
                                return result
                            }
                        })
                        if(updateUser.profilePicture){
                            await cloudinary.v2.uploader.destroy(updateUser.profilePicture.public_id, async (err) =>{
                                if(err){
                                    throw err
                                }
                            })
                        }
                        const imag = {public_id : imagee.public_id, url: imagee.secure_url}
                        req.body.profilePicture = imag;

                    }
                }
                const user = await User.findByIdAndUpdate(id, req.body, {new: true});
                return res.status(200).json({message: "User update successfully", user})
            }
            return res.status(404).json({message: "User not found"})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
}

module.exports = userCtrl