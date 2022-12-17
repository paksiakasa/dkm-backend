import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const {DataTypes} = Sequelize;
 
const Merchs = db.define('merch', {
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    name:DataTypes.STRING,
    price:DataTypes.DECIMAL,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    url: DataTypes.STRING,
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            notEmpty: false 
        }
    }
}, {
    freezeTableName: true
});

Users.hasMany(Merchs);
Merchs.belongsTo(Users, {foreignKey: 'userId'});

export default Merchs;
