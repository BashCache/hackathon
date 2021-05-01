"use strict";
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("reports", {
      id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			user_id: {
				allowNull: false,
				// autoIncrement: true,
				// primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      score: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
  
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable("reports");
	}
};
