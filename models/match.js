const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Match extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            models.Match.belongsTo(models.User, {
                foreignKey: "mc_player_one",
                timestamps: false,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                as: "player_one",
            });
            models.Match.belongsTo(models.User, {
                foreignKey: "mc_player_two",
                timestamps: false,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                as: "player_two",
            });
        }
    }
    Match.init(
        {
            mc_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            mc_player_one: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            mc_player_two: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            mc_player_one_value: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            mc_player_two_value: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            mc_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            mc_created_on: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            mc_created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            mc_updated_on: {
                allowNull: true,
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            mc_updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Match",
            tableName: "matches",
            timestamps: false,
        }
    );
    return Match;
};
