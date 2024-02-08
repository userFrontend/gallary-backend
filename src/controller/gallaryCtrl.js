const Gallary = require('../models/gallaryModel');
const Picture = require('../models/pictureModel');

const cloudinary = require('cloudinary')

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

const gallaryCtrl = {
    add: async (req, res) => {
        const {title, userId} = req.body
       try {
        if(!title || !userId){
            return res.status(403).json({message: 'insufficient information'})
        }
        const gallary = new Gallary(req.body)
        await gallary.save()
        res.status(201).json({message: 'new Gallary created', gallary})
        } catch (error) {
            res.status(503).json({message: error.message})
       } 
    },
    get: async (req, res) => {
        try {
            const gallarys = await Gallary.aggregate([
                {$lookup: {from: "pictures", let: {picId: '$_id'},
                pipeline: [
                    {$match: {$expr: {$eq: ["$gallaryId", "$$picId"]}}}
                ],
                as: "pictures"
            }},
            ])
            res.status(200).json({message: 'All Gallary', gallarys})
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
            const deleteGall = await Gallary.findByIdAndDelete(id)
            if(!deleteGall){
                return res.status(400).send({message: 'Gallary not found'})
            }
            const deletePic = await Picture.find({gallaryId: id})
            
            if(deleteGall.length > 0){
                deletePic.map(async pic => {
                    console.log(pic);
                    await cloudinary.v2.uploader.destroy(pic.picture.public_id, async (err) =>{
                        if(err){
                            throw err
                        }
                    })
                })
            }
            await Picture.deleteMany({gallaryId: id})
            res.status(200).send({message: 'Gallary deleted', deleteGall})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    },
    update: async (req, res) => {
        const {title} = req.body
        const {id} = req.params
        console.log(title, id);
        if(!title || !id){
            return res.status(403).json({message: 'insufficient information'})
        }
        try {
            const updateGall = await Gallary.findById(id)
            console.log(updateGall);
            if(!updateGall){
                return res.status(400).send({message: 'Gallary not found'})
            }
            const newGall = await Gallary.findByIdAndUpdate(id, req.body, {new: true})
            res.status(200).send({message: 'Update successfully', newGall})
        } catch (error) {
            res.status(503).json({message: error.message})
        }
    }
}

module.exports = gallaryCtrl