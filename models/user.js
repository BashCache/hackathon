"use strict";
module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define(
		"user",
		{
			name: DataTypes.STRING,
			email: DataTypes.STRING,
			phone_no: DataTypes.STRING,
			hashed_password: DataTypes.STRING,
			salt: DataTypes.STRING,
			forgotPasswordSalt: DataTypes.STRING,
            acq_name: DataTypes.STRING,
			acq_email: DataTypes.STRING,
			acq_phone: DataTypes.STRING
		},
		{
			tableName: 'users',
			timestamps: false
		}
	);
	user.associate = function (models) {
		// associations can be defined here
	};
	return user;
};
