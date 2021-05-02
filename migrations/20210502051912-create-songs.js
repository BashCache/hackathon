"use strict";
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("songs", {
      id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			genre: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
      }
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable("songs");
	}
};
