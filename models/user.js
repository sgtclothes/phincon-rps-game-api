const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            models.User.hasOne(models.Profile, {
                foreignKey: "pr_us_id",
                as: "profile",
                timestamps: false,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            models.User.belongsToMany(models.Role, {
                through: models.UserRole,
                foreignKey: "ur_us_id",
                as: "roles",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                timestamps: false,
            });
            models.User.hasOne(models.Match, {
                foreignKey: "mc_player_one",
                as: "match",
                timestamps: false,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            models.User.hasOne(models.Match, {
                foreignKey: "mc_player_two",
                as: "match",
                timestamps: false,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }
    User.init(
        {
            us_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            us_fullname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            us_username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            us_email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            us_phone_number: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            us_password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            us_created_on: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            us_created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            us_updated_on: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            us_updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            us_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: false,
        }
    );
    return User;
};
