const User = require("../models").user;
const Report = require("../models").report;
const crypto = require("crypto");
const { uuid } = require("uuidv4");
const QuickEncrypt = require("quick-encrypt");
const fs = require("fs");
const natural = require('natural')
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');
const rp = require('request-promise');
const $ = require('cheerio');
const { WordTokenizer } = natural;
const { SentimentAnalyzer, PorterStemmer } = natural;
const jwt_decode = require('jwt-decode');
const LocalStorage = require('node-localstorage').LocalStorage

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();


// const publicKey = fs.readFileSync(
// 	__dirname + process.env.PUBLIC_KEY_DIR,
// 	"utf-8"
// );

// const privateKey = fs.readFileSync(
// 	__dirname + process.env.PRIVATE_KEY_DIR,
// 	"utf-8"
// );

exports.register = (req, res, next) => {
    console.log('here');
	User.findOne({ where: { email: req.body.email } })
		.then((current_user) => {
            console.log('hi');
			if (!current_user) {
				let salt = uuid();
				let hash = crypto
					.createHash(process.env.hash_algo, salt)
					.update(req.body.password)
					.digest("hex");
				User.create({
					name: req.body.name,
                    email: req.body.email,
					phone_no: req.body.phone_no,
					hashed_password: hash,
					salt: salt,
                    acq_name: req.body.acq_name,
                    acq_email: req.body.acq_email,
					acq_phone: req.body.acq_phone, 
				})
					.then((User) => {
						if (User) {
							const token = jwt.sign(
								{ id: User.id },
								process.env.JWT_ENCRYPTION
							);
							req.token = token;
                            // req.name = User.name;
							// req.id = User.id;
							next(); //sending mail
						} else {
							res.status(400).render('error.pug', { message: "Server error" });
						}
					})
					.catch((err) => {
						res.status(400).render('error.pug', { message: "Server error" });
					});
			} else {
				res.status(401).send({ message: "User already exists" });
			}
		})
		.catch((err) => {
			throw err;
            res.status(400).send({ message: "Server error" });
		});
};

exports.signin = (req, res) => {
	User.findOne({ where: { email: req.body.email } })
		.then((User) => {
			if (User) {
				let new_hashed_pwd = crypto
					.createHash(process.env.hash_algo, User.salt)
					.update(req.body.password)
					.digest("hex");
				if (new_hashed_pwd === User.hashed_password) {
					const token = jwt.sign({ id: User.id }, process.env.JWT_ENCRYPTION);
				// if (typeof localStorage === "undefined" || localStorage === null) {
				// 		console.log('hi in local storage')
				localStorage = new LocalStorage('./scratch');
					//  }
				localStorage.setItem('Key', token);
				res
					.status(200)
					.render('../views/homepage', { title: 'success', message: "User Signed in", id: User.id, token: token })
				} else {
					res.status(401).render('error.pug' , { title: 'error-login', message: "Wrong credentials" });
				}
			} else {
				res.status(401).render('error.pug', {title: 'error-login', message: 'User not found'} );
			}
		})
		.catch((err) => {
			throw err;
			res.status(401).render('error.pug', {title: 'error-login', message: 'Server error'} );
		});
};

exports.sentimentanalyis = (req, res) => {
	if (typeof localStorage === "undefined" || localStorage === null) {
				// 		console.log('hi in local storage')
				localStorage = new LocalStorage('./scratch');
					 }
	token = localStorage.getItem('Key');
	const decoded = jwt_decode(token);
	console.log(decoded)
	const user_id = decoded.id;
	console.log(decoded.id);
	var datetime = new Date();
    console.log(datetime);

	User.findOne({ where: { id: decoded.id} })
		.then((User) => {
			if(User)	{
				Report.create({
					user_id: decoded.id,
                    name: 'HELLO',
					date:  datetime,
					score: 0
				})
				.then((Report) => {
						console.log('success');
						const review  = req.body.review;
						console.log('here', typeof(req.body))
						const review_keys = Object.keys(req.body);
						console.log(review_keys)
						let i = 0;
						let score = 0;
						if(review_keys[1] == 'great')	score += 5;
						else if(review_keys[1] == 'mediocre') score += 0;
						else if(review_keys[1] == 'bad')	score -=5;

						if(review_keys[2] == 'friends')	score += 5;
						else if(review_keys[2] == 'friendsno') score -= 5;

						if(review_keys[3] == 'sleep')	score += 10;
						else if(review_keys[3] == 'sleepno') score -= 10;

						if(review_keys[4] == 'relax')	score += 5;
						else if(review_keys[4] == 'relaxno') score -= 5;

						if(review_keys[5] == 'motivate')	score += 15;
						else if(review_keys[5] == 'motivateno') score -= 5;

						if(review_keys[6] == 'notatall')	score += 15;
						else if(review_keys[6] == 'slight') score -= 5;
						else if(review_keys[6] == 'verystressed') score -= 15;

						if(review_keys[7] == 'self')	score -= 25;
						else if(review_keys[7] == 'selfmay') score -= 10;
						else if(review_keys[7] == 'selfno') score += 15;

						score += 5*req.body.points;
						const thoughts = req.body.thoughts;
						const talks = req.body.talk;

						const lexedthoughts = aposToLexForm(thoughts);
						const lexedtalks = aposToLexForm(talks);

						const casedthoughts = lexedthoughts.toLowerCase();
						const casedtalks = lexedtalks.toLowerCase();

						const alphaOnlyThoughts = casedthoughts.replace(/[^a-zA-Z\s]+/g, '');
						const alphaOnlyTalks = casedtalks.replace(/[^a-zA-Z\s]+/g, '');

						const tokenizer = new WordTokenizer();
						const tokenizedThoughts= tokenizer.tokenize(alphaOnlyThoughts);
						const tokenizedTalks= tokenizer.tokenize(alphaOnlyTalks);

						tokenizedThoughts.forEach((word, index) => {
							tokenizedThoughts[index] = spellCorrector.correct(word);
						});
						tokenizedTalks.forEach((word, index) => {
							tokenizedTalks[index] = spellCorrector.correct(word);
						});

						const filteredthoughts = SW.removeStopwords(tokenizedThoughts);
						const filteredtalks = SW.removeStopwords(tokenizedTalks);

						const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
						const thoughts_analysis = analyzer.getSentiment(filteredthoughts);
						const talk_analysis = analyzer.getSentiment(filteredtalks);

						console.log(thoughts_analysis, talk_analysis, score);
						res.status(200).send({ thoughts_analysis: thoughts_analysis, talk_analysis: talk_analysis})
							// next(); //sending mail
						})
				.catch((err) => {
					throw err;
					res.status(400).render('error.pug', { message: "Server error" });
					});
			}
			else {
				res.status(401).send({ message: 'User not found' });
			}
		})
		.catch((err) => {
			throw err;
		});
	
// 	const review  = req.body.review;
// 	console.log('here', typeof(req.body))
// 	const review_keys = Object.keys(req.body);
// 	console.log(review_keys)
// 	let i = 0;
// 	let score = 0;
// 	if(review_keys[1] == 'great')	score += 5;
// 	else if(review_keys[1] == 'mediocre') score += 0;
// 	else if(review_keys[1] == 'bad')	score -=5;

// 	if(review_keys[2] == 'friends')	score += 5;
// 	else if(review_keys[2] == 'friendsno') score -= 5;

// 	if(review_keys[3] == 'sleep')	score += 10;
// 	else if(review_keys[3] == 'sleepno') score -= 10;

// 	if(review_keys[4] == 'relax')	score += 5;
// 	else if(review_keys[4] == 'relaxno') score -= 5;

// 	if(review_keys[5] == 'motivate')	score += 15;
// 	else if(review_keys[5] == 'motivateno') score -= 5;

// 	if(review_keys[6] == 'notatall')	score += 15;
// 	else if(review_keys[6] == 'slight') score -= 5;
// 	else if(review_keys[6] == 'verystressed') score -= 15;

// 	if(review_keys[7] == 'self')	score -= 25;
// 	else if(review_keys[7] == 'selfmay') score -= 10;
// 	else if(review_keys[7] == 'selfno') score += 15;

// 	score += 5*req.body.points;
// 	const thoughts = req.body.thoughts;
// 	const talks = req.body.talk;

// 	const lexedthoughts = aposToLexForm(thoughts);
// 	const lexedtalks = aposToLexForm(talks);

// 	const casedthoughts = lexedthoughts.toLowerCase();
// 	const casedtalks = lexedtalks.toLowerCase();

// 	const alphaOnlyThoughts = casedthoughts.replace(/[^a-zA-Z\s]+/g, '');
// 	const alphaOnlyTalks = casedtalks.replace(/[^a-zA-Z\s]+/g, '');

//   	const tokenizer = new WordTokenizer();
//   	const tokenizedThoughts= tokenizer.tokenize(alphaOnlyThoughts);
// 	const tokenizedTalks= tokenizer.tokenize(alphaOnlyTalks);

// 	tokenizedThoughts.forEach((word, index) => {
// 		tokenizedThoughts[index] = spellCorrector.correct(word);
// 	});
// 	tokenizedTalks.forEach((word, index) => {
// 		tokenizedTalks[index] = spellCorrector.correct(word);
// 	});

// 	const filteredthoughts = SW.removeStopwords(tokenizedThoughts);
// 	const filteredtalks = SW.removeStopwords(tokenizedTalks);

// 	const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
//   	const thoughts_analysis = analyzer.getSentiment(filteredthoughts);
// 	const talk_analysis = analyzer.getSentiment(filteredtalks);

// 	console.log(thoughts_analysis, talk_analysis, score);

//   res.status(200).json({ thoughts_analysis, talk_analysis });
};

exports.scrapeData = (req, res) => {
	const url = 'https://www.practo.com/' + req.body.location + '/psychiatrist?sort_by=patient_experience_score';
	console.log(url);
	rp(url)
      .then(function(html) {
		console.log('here');
		// console.log($('.info-section .a'))
		console.log($('.info-section .doctor-name', html).text());

  	})
  .catch(function(err) {
    //handle error
  });
	res.status(200).send({ message: "hi"});
}
// exports.forgotPasswordGenerateLink = (req, res, next) => {
// 	User.findOne({ where: { email: req.body.email } })
// 		.then((current_user) => {
// 			if (current_user) {
// 				if (current_user.password === null) {
// 					//google signed in user - reset password is not possible
// 					res
// 						.status(401)
// 						.send({ message: "Incorrect Email Id or Email Id doesnot exists" });
// 				} else {
// 					//generating link to send a mail.
// 					new_salt = uuid();
// 					const link =
// 						environment[process.env.NODE_ENV].url +
// 						"/user/forgotPasswordGetLink?u=" +
// 						QuickEncrypt.encrypt(current_user.email, publicKey) +
// 						"&id=" +
// 						QuickEncrypt.encrypt(new_salt, publicKey);

// 					current_user
// 						.update({
// 							forgotPasswordSalt: new_salt // to check during password reset
// 						})
// 						.then(() => {
// 							req.link = link;
// 							setTimeout(() => {
// 								current_user.update({ forgotPasswordSalt: null }).then(() => {
// 									console.log("Link expired");
// 								});
// 							}, 2 * 60 * 1000); //Time in milli-seconds

// 							next(); //Sending Mail
// 						});
// 				}
// 			} else {
// 				res
// 					.status(401)
// 					.send({ message: "Incorrect Email Id/Email Id doesnot exists" });
// 			}
// 		})
// 		.catch((err) => {
// 			res.status(400).send({ message: "Server error" });
// 		});
// };

// exports.forgotPasswordGetLink = (req, res, next) => {
// 	try {
// 		const email = QuickEncrypt.decrypt(req.query.u, privateKey);
// 		User.findOne({
// 			where: { email: email }
// 		})
// 			.then((User) => {
// 				if (User) {
// 					if (
// 						QuickEncrypt.decrypt(req.query.id, privateKey) ===
// 						User.forgotPasswordSalt
// 					) {
// 						const link =
// 							environment[process.env.NODE_ENV].url + "/user/resetPassword";

// 						//This response only for dev purpose..
// 						res.send(
// 							"<html><body><form action =" +
// 								link +
// 								" method=\"POST\"><input type='text' name = 'password'/><input type='hidden' name = 'id' value = " +
// 								req.query.id +
// 								"></input><input type='hidden' name = 'email' value = " +
// 								req.query.u +
// 								"></input><input type = 'submit'/></form></body></html>"
// 						);
// 					} else {
// 						res.status(401).send({ message: "Bad request" });
// 					}
// 				} else {
// 					res.status(401).send({ message: "User not found" });
// 				}
// 			})
// 			.catch((err) => {
// 				res.status(400).send({ message: "Link expired" });
// 			});
// 	} catch {
// 		res.status(401).send({ message: "Invalid Link" });
// 	}
// };

// exports.resetPassword = (req, res, next) => {
// 	try {
// 		const email = QuickEncrypt.decrypt(req.body.email, privateKey);
// 		const forgotPasswordSalt = QuickEncrypt.decrypt(req.body.id, privateKey);
// 		User.findOne({ where: { email: email } })
// 			.then((User) => {
// 				if (User) {
// 					if (forgotPasswordSalt === User.forgotPasswordSalt) {
// 						new_salt = uuid();
// 						new_hashed_password = crypto
// 							.createHash(process.env.hash_algo, new_salt)
// 							.update(req.body.password)
// 							.digest("hex");
// 						User.update({
// 							forgotPasswordSalt: null, //link is active for one time updation only
// 							hashed_password: new_hashed_password,
// 							salt: new_salt
// 						}).then(() => {
// 							res.status(200).send({ message: "Password updated" });
// 						});
// 					} else {
// 						res.status(401).send({ message: "Bad Request" });
// 					}
// 				} else {
// 					res.status(401).send({ message: "User not found" });
// 				}
// 			})
// 			.catch((err) => {
// 				res.status(400).send({ message: "Server error" });
// 			});
// 	} catch {
// 		res.status(401).send({ message: "Restricted Access" });
// 	}
// };
