const mailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transport = mailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.gmail_username,
		pass: process.env.gmail_password
	}
});

exports.sendMailForRegistration = (req, res, next) => {
	const message = {
		to: req.body.email,
		subject: "Registration Successful for the mental helath app",
		html:
			"<p> Greetings. Registration is successful. Use the app to calm down your nerves </p>" 
			// req.kid
	};

	transport.sendMail(message, (err, info) => {
		if (err) {
			// Add logic to resend mails
            throw err;
			console.log("Mail not sent");
		} else {
			// res.status(200).send({
			// 	message: "User registered and mail sent",
			// 	id: req.id,
			// 	token: req.token
			// });
            next();
		}
	});
};

exports.sendMailAcquaintanceForRegistration = (req, res, next) => {
	console.log(req.body.acq_email)
	const message = {
		to: req.body.acq_email,
		subject: "Registration Successful for the mental helath app",
		html:
			"<p> Greetings. Your friend " + req.body.name + " has registered for mental health app. In case of any serious issues, you will be notified </p>" 
			// req.kid
	};

	transport.sendMail(message, (err, info) => {
		if (err) {
			// Add logic to resend mails
            throw err;
			console.log("Mail not sent");
		} else {
			// res.status(200, {message: "hi"}).send({
			// 	message: "User registered and mail sent to acquaintance",
			// 	id: req.id,
			// 	token: req.token
			// });
			res.render('../views/homepage', {message: "hi"});
			// return res.redirect('http://localhost:8080/homepage.html')
			// res.status(200).render('success-reg.pug', {message: 'User registered and mail sent to acquaintance', id: req.body.id, token: req.token});
		}
	});
};

exports.sendMailReport = (req, res) => {
	mailList = []
	mailList.push(req.body.email) 
	if(req.body.score < 40)	mailList.push(req.body.acq_email) 
	console.log('here', mailList)
	const message = {
		to: mailList,
		// cc: "*******" ,
		subject: "Report generated for the survey",
		html:
			"<p> Greetings. Here is the score for the survey that you took is " + req.body.score + "</p>" +
			"<p> You decided to take the survey because: " + req.body.thoughts + "</p>" + 
			"<p> Your feelings right now is: " + req.body.talk + "</p>"
			// req.kid
	};

	transport.sendMail(message, (err, info) => {
		if (err) {
			// Add logic to resend mails
            throw err;
			console.log("Mail not sent");
		} else {
			console.log('here');
			res.status(200).render('../views/score.pug', { score: req.body.score });
            // next();
		}
	});
};
