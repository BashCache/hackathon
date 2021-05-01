"use strict";
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING
			},
			email: {
				type: Sequelize.STRING
			},
			phone_no: {
				type: Sequelize.STRING
			},
			hashed_password: {
				type: Sequelize.STRING
			},
			salt: {
				type: Sequelize.STRING
			},
			forgotPasswordSalt: {
				type: Sequelize.STRING
			},
            acq_name: {
				type: Sequelize.STRING
			},
			acq_email: {
				type: Sequelize.STRING
			},
			acq_phone: {
				type: Sequelize.STRING
			}
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable("users");
	}
};
