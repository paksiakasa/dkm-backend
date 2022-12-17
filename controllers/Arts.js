import Art from "../models/ArtModel.js";
import path from "path";
import fs from "fs";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getArts = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Art.findAll({
        attributes: ["uuid", "name", "description", "price", "image", "url"],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Art.findAll({
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

export const getArtById = async (req, res) => {
  try {
    const art = await Art.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!art) return res.status(404).json({ msg: "Data tidak ditemukan!" });
    let response;
    if (req.role === "admin") {
      response = await Art.findOne({
        attributes: ["uuid", "name", "description", "price", "image", "url"],
        where: {
          id: art.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Art.findOne({
        attributes: ["uuid", "name", "description",  "price", "image", "url"],
        where: {
          [Op.and]: [{ id: art.id }, { userId: req.userId }],
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

export const createArt = (req, res) => {
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
      await Art.create({
        name: name,
        image: fileName,
        description: description,
        price: price,
        url: url,
        userId: req.userId,
      });
      res.status(201).json({ msg: "Art berhasil dibuat" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateArt = async (req, res) => {
  try {
    const art = await Art.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!art) return res.status(404).json({ msg: "Data tidak ditemukan" });
    if (req.role === "admin") {
      let fileName = "";
      if (!req.files) {
        fileName = art.image;
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

        const filepath = `./public/images/${art.image}`;
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
          await Art.update(
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
      if (req.userId !== art.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
        let fileName = "";
        if(!req.files){
            fileName = art.image
        } else{
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            fileName = file.md5 + ext;
            const allowedType = ['.png','.jpg','.jpeg'];
    
            if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
            if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});
    
            const filepath = `./public/images/${art.image}`;
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
            await Art.update(
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

export const deleteArt = async (req, res) => {
  try {
    const art = await Art.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!art) return res.status(404).json({ msg: "Data tidak ditemukan!" });
    if (req.role === "admin") {
      const filepath = `./public/images/${art.image}`;
      fs.unlinkSync(filepath);
      await Art.destroy({
        where: {
          id: art.id,
        },
      });
    } else {
      if (req.userId !== art.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
      const filepath = `./public/images/${art.image}`;
      fs.unlinkSync(filepath);
      await Art.destroy({
        where: {
          [Op.and]: [{ id: art.id }, { userId: req.userId }],
        },
      });
    }
    res.status(200).json({ msg: "Art berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
