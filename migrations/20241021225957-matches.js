"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("matches", {
            mc_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            mc_player_one: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "us_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            mc_player_two: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "us_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            mc_player_one_value: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            mc_player_two_value: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            mc_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            mc_created_on: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            mc_created_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            mc_updated_on: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            mc_updated_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("matches");
    },
};
