import Merch from "../models/MerchModel.js";


export const getMerchMain = async (req, res) => {
  try {
    const response = await Merch.findAll({
      attributes: ["uuid", "name", "description", "price", "image", "url"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getMerchMainById = async (req, res) => {
  try {
    const response = await Merch.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
