import Merch from "../models/MerchModel.js";
import path from "path";
import fs from "fs";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getMerchs = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Merch.findAll({
        attributes: ["uuid", "name", "description", "price", "image", "url"],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Merch.findAll({
        attributes: ["uuid", "name", "description", "price", "image", "url"],
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

export const getMerchById = async (req, res) => {
  try {
    const merch = await Merch.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!merch) return res.status(404).json({ msg: "Data tidak ditemukan!"});
    let response;
    if (req.role === "admin") {
      response = await Merch.findOne({
        attributes: ["uuid", "name", "description", "price", "image", "url"],
        where: {
          id: merch.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Merch.findOne({
        attributes: ["uuid", "name", "description",  "price", "image", "url"],
        where: {
          [Op.and]: [{ id: merch.id }, { userId: req.userId }],
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

export const createMerch = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).json({ msg: "No file is uploaded!" });
  const name = req.body.title;
  const price = req.body.title2;
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
      await Merch.create({
        name: name,
        image: fileName,
        description: description,
        price: price,
        url: url,
        userId: req.userId,
      });
      res.status(201).json({ msg: "Merch berhasil dibuat" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateMerch = async (req, res) => {
  try {
    const merch = await Merch.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!merch) return res.status(404).json({ msg: "Data tidak ditemukan" });
    if (req.role === "admin") {
      let fileName = "";
      if (!req.files) {
        fileName = merch.image;
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

        const filepath = `./public/images/${merch.image}`;
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err) => {
          if (err) return res.status(500).json({ msg: err.message });
        });
      }
        const name = req.body.title;
        const description = req.body.title3;
        const price = req.body.title2;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        try {
          await Merch.update(
            { name: name, description: description, price: price, image: fileName,  url: url },
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
      if (req.userId !== merch.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
        let fileName = "";
        if(!req.files){
            fileName = merch.image
        } else{
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            fileName = file.md5 + ext;
            const allowedType = ['.png','.jpg','.jpeg'];
    
            if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
            if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});
    
            const filepath = `./public/images/${merch.image}`;
            fs.unlinkSync(filepath);
    
            file.mv(`./public/images/${fileName}`, (err)=>{
                if(err) return res.status(500).json({msg: err.message});
            });
        }
          const name = req.body.title;
          const description = req.body.title3;
          const price = req.body.title2;
          const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
          try {
            await Merch.update(
              { name: name, description: description, price: price, image: fileName,  url: url },
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
    res.status(200).json({ msg: "Product updated successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteMerch = async (req, res) => {
  try {
    const merch = await Merch.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!merch) return res.status(404).json({ msg: "Data tidak ditemukan!" });
    if (req.role === "admin" || req.role === "craftsman") {
      const filepath = `./public/images/${merch.image}`;
      fs.unlinkSync(filepath);
      await Merch.destroy({
        where: {
          id: merch.id,
        },
      });
    } else {
      if (req.userId !== merch.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
      const filepath = `./public/images/${merch.image}`;
      fs.unlinkSync(filepath);
      await Merch.destroy({
        where: {
          [Op.and]: [{ id: merch.id }, { userId: req.userId }],
        },
      });
    }
    res.status(200).json({ msg: "Merch berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
