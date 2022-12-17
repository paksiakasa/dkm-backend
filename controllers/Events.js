import Event from "../models/EventModel.js"
import path from "path";
import fs from "fs";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getEvents = async (req, res) => {
    try {
      let response;
      if (req.role === "admin") {
        response = await Event.findAll({
          attributes: ["uuid", "name", "description", "image", "url"],
          include: [
            {
              model: User,
              attributes: ["name", "email"],
            },
          ],
        });
      } else {
        response = await Event.findAll({
          attributes: ["uuid", "name", "description", "image", "url"],
          where: {
            userId: req.userId,
          },
          include: [
            {
              model: User,
              attributes: ["name", "email"],
            },
          ],
        });
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  export const getEventById = async (req, res) => {
    try {
      const event = await Event.findOne({
        where: {
          uuid: req.params.id,
        },
      });
      if (!event) return res.status(404).json({ msg: "Data tidak ditemukan!" });
      let response;
      if (req.role === "admin") {
        response = await Event.findOne({
          attributes: ["uuid", "name", "description", "image", "url"],
          where: {
            id: event.id,
          },
          include: [
            {
              model: User,
              attributes: ["name", "email"],
            },
          ],
        });
      } else {
        response = await Event.findOne({
          attributes: ["uuid", "name", "description", "image", "url"],
          where: {
            [Op.and]: [{ id: event.id }, { userId: req.userId }],
          },
          include: [
            {
              model: User,
              attributes: ["name", "email"],
            },
          ],
        });
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  export const createEvent = (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).json({ msg: "No file is uploaded!" });
    const name = req.body.title;
    const description = req.body.title3;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = [".png", ".jpg", ".jpeg"];
  
    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid Images" });
    if (fileSize > 5000000)
      return res.status(422).json({ msg: "Image must be less than 5 MB" });
  
    file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
      try {
        await Event.create({
          name: name,
          description: description,
          image: fileName,
          url: url,
          userId: req.userId,
        });
        res.status(201).json({ msg: "Event berhasil dibuat" });
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
    });
  };
  
  export const updateEvent = async (req, res) => {
    try {
      const event = await Event.findOne({
        where: {
          uuid: req.params.id,
        },
      });
      if (!event) return res.status(404).json({ msg: "Data tidak ditemukan" });
      if (req.role === "admin") {
        let fileName = "";
        if (!req.files) {
          fileName = event.image;
        } else {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          fileName = file.md5 + ext;
          const allowedType = [".png", ".jpg", ".jpeg"];
  
          if (!allowedType.includes(ext.toLowerCase()))
            return res.status(422).json({ msg: "Invalid Images" });
          if (fileSize > 5000000)
            return res.status(422).json({ msg: "Image must be less than 5 MB" });
  
          const filepath = `./public/images/${event.image}`;
          fs.unlinkSync(filepath);
  
          file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
          });
        }
          const name = req.body.title;
          const description = req.body.title3;
          const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
          try {
            await Event.update(
              { name: name, description: description, image: fileName,  url: url },
              {
                where: {
                  uuid: req.params.id,
                },
              }
            );
          } catch (error) {
            console.log(error.message);
          }
      } else {
        if (req.userId !== event.userId)
          return res.status(403).json({ msg: "Akses terlarang" });
          let fileName = "";
          if(!req.files){
              fileName = event.image
          } else{
              const file = req.files.file;
              const fileSize = file.data.length;
              const ext = path.extname(file.name);
              fileName = file.md5 + ext;
              const allowedType = ['.png','.jpg','.jpeg'];
      
              if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
              if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});
      
              const filepath = `./public/images/${event.image}`;
              fs.unlinkSync(filepath);
      
              file.mv(`./public/images/${fileName}`, (err)=>{
                  if(err) return res.status(500).json({msg: err.message});
              });
          }
            const name = req.body.title;
            const description = req.body.title3;
            const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
            try {
              await Event.update(
                { name: name, description: description, image: fileName,  url: url },
                {
                  where: {
                    [Op.and]: [{ uuid: req.params.id }, { userId: req.userId }],
                  },
                }
              );
            } catch (error) {
              console.log(error.message);
            }
      }
      res.status(200).json({ msg: "Event updated successfuly" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  export const deleteEvent = async (req, res) => {
    try {
      const event = await Event.findOne({
        where: {
          uuid: req.params.id,
        },
      });
      if (!event) return res.status(404).json({ msg: "Data tidak ditemukan!" });
      if (req.role === "admin") {
        const filepath = `./public/images/${event.image}`;
        fs.unlinkSync(filepath);
        await Event.destroy({
          where: {
            id: event.id,
          },
        });
      } else {
        if (req.userId !== event.userId)
          return res.status(403).json({ msg: "Akses terlarang" });
        const filepath = `./public/images/${event.image}`;
        fs.unlinkSync(filepath);
        await Event.destroy({
          where: {
            [Op.and]: [{ id: event.id }, { userId: req.userId }],
          },
        });
      }
      res.status(200).json({ msg: "Event berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  