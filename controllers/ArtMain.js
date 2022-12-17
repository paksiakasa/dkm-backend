import Arts from "../models/ArtModel.js";

export const getArtMain = async (req, res) => {
    try {
      const response = await Arts.findAll({
        attributes: ["uuid", "name", "description", "price", "image", "url"],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  export const getArtMainById = async (req, res) => {
    try {
      const response = await Arts.findOne({
        where: {
          uuid: req.params.id,
        },
      });
      res.json(response);
    } catch (error) {
      console.log(error.message);
    }
  };
  