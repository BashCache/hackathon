"use strict";
module.exports = (sequelize, DataTypes) => {
	const report = sequelize.define(
		"report",
		{
			user_id:{
                type: DataTypes.INTEGER,
                // primaryKey: true
            },
            name: DataTypes.STRING,
            date: DataTypes.DATE,
            score: DataTypes.INTEGER
		},
		{
			tableName: 'reports',
			timestamps: true
		}
	);
	report.associate = function (models) {
		// associations can be defined here
	};
	return report;
};
