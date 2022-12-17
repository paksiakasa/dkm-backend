import Event from "../models/EventModel.js";


export const getEventMain = async (req, res) => {
  try {
    const response = await Event.findAll({
      attributes: ["uuid", "name", "description","image", "url"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getEventMainById  = async (req, res) => {
  try {
    const response = await Event.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
