const fs = require('fs')
const cloudinary = require('cloudinary')
const Picture = require('../models/pictureModel');

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


const pictureCtrl = {
    add: async (req, res) => {
       try {
        if(req.files){
            const {image} = req.files;
            if(image){
                const format = image.mimetype.split('/')[1];
                if(format !== 'png' && format !== 'jpeg') {
                    return res.status(403).json({message: 'file format incorrect'})
                }
                const createdImage = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                    folder: 'Gallary'
                }, async (err, result) => {
                    if(err){
                        throw err
                    } else {
                        removeTemp(image.tempFilePath)
                        return result
                    }
                })
               
                const imag = {public_id : createdImage.public_id, url: createdImage.secure_url}
                req.body.picture = imag;
            }
            const newPic = new Picture(req.body);
            await newPic.save()
            return res.status(201).send({message: 'Picture added succesfully', newPic})
        }
        res.status(404).json({message: 'File not found, please see your file'})
       } catch (error) {
        res.status(503).json({message: error.message})
       }
    },
    get: async (req, res) => {
        try {
            const pictures = await Picture.find()
            res.status(200).send({message: 'All pictures', pictures})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    update: async (req, res) => {
        const {id} = req.params
        try {
            const updatePic = await Picture.findById(id)
            if(!updatePic){
                return res.status(404).send('Picture not found')
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
                if(updatePic.picture){
                    await cloudinary.v2.uploader.destroy(updatePic.picture.public_id, async (err) =>{
                        if(err){
                            throw err
                        }
                    })
                }
                const imag = {public_id : imagee.public_id, url: imagee.secure_url}
                req.body.picture = imag;
            }
            }
            const pictureEd = await Picture.findByIdAndUpdate(id, req.body, {new: true});
            return res.status(200).json({message: "Picture update successfully", picture: pictureEd})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    delete: async (req, res) => {
        const {id} = req.params
        try {
            const deletePc = await Picture.findByIdAndDelete(id);
            if(!deletePc) {
                return res.status(404).json({message: 'Picture not found'})
            }
            if(deletePc.picture){
                await cloudinary.v2.uploader.destroy(deletePc.picture.public_id, async (err) =>{
                    if(err){
                        throw err
                    }
                })
            }
            res.status(200).json({message: 'Picture delete successfully', deletePc})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    }
}

module.exports = pictureCtrl