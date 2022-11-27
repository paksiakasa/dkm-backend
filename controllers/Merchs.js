import Merch from "../models/MerchModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

export const getMerchs = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Merch.findAll({
        attributes: ["uuid", "name", "image", "url", "price"],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Merch.findAll({
        attributes: ["uuid", "name", "image", "url", "price"],
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
    if (!merch) return res.status(404).json({ msg: "Data tidak ditemukan!" });
    let response;
    if (req.role === "admin") {
      response = await Merch.findOne({
        attributes: ["uuid", "name", "image", "url", "price"],
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
        attributes: ["uuid", "name", "image", "price"],
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

export const createMerch = async (req, res) => {
  if (!req.files)
    return res.status(400).json({ msg: "No file uploaded!" });
  const name = req.body.title;
  const price = req.body.price;
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
        price: price,
        url: url,
        userId: req.userId
      });
      res.status(201).json({ msg: "Merch berhasil dibuat" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateMerch = async (req, res) => {
  const merch = await Merch.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!merch) return res.status(404).json({ msg: "Data tidak ditemukan!" });
  let fileName = "";
  if (req.files === null) {
    fileName = Merch.image;
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
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const price = req.body.price;
  try {
    if (req.role === "admin") {
      await Merch.update(
        { name: name, image: fileName, price: price, url: url },
        {
          where: {
            id: req.params.id,
          },
        }
      );
    } else {
      if (req.userId !== merch.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
      await Merch.update(
        { name: name, image: fileName, price: price, url: url },
        {
          where: {
            [Op.and]: [{ id: merch.id }, { userId: req.userId }],
          },
        }
      );
    }
    res.status(200).json({ msg: "Merch berhasil diupdate" });
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
    if (req.role === "admin") {
      const filepath = `./public/images/${merch.image}`;
      fs.unlinkSync(filepath);
      await Merch.destroy({
        where: {
          id: req.params.id,
        },
      });
    } else {
      if (req.userId !== merch.userId)
        return res.status(403).json({ msg: "Akses terlarang" });
      const filepath = `./public/images/${merch.image}`;
      fs.unlinkSync(filepath);
      await Merch.destroy({
        where: {
          [Op.and]: [{ id:req.params.id }, { userId: req.userId }],
        },
      });
    }
    res.status(200).json({ msg: "Merch berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
