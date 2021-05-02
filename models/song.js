"use strict";
module.exports = (sequelize, DataTypes) => {
	const song = sequelize.define(
		"song",
		{
            genre: DataTypes.STRING,
            link: DataTypes.STRING,
		},
		{
			tableName: 'songs',
			timestamps: false
		}
	);
	song.associate = function (models) {
		// associations can be defined here
	};
	return song;
};
