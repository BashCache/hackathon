const User = require("../models").user;
const Report = require("../models").report;
const Song = require("../models").song;
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
					.render('../views/homepage1', { title: 'success', message: "User Signed in", id: User.id, token: token })
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

exports.sentimentanalyis = (req, res, next) => {
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

	const review  = req.body.review;
	console.log('here', typeof(req.body))
	const review_keys = Object.keys(req.body);
	console.log(review_keys)
	let i = 0;
	let tot_score = 0;
	tot_score = parseInt(tot_score)
	if(review_keys[1] == 'great')	tot_score += parseInt(10);
	else if(review_keys[1] == 'mediocre') tot_score += parseInt(7);
	else if(review_keys[1] == 'bad')	tot_score += parseInt(3);

	if(review_keys[2] == 'friends')	tot_score += parseInt(5);
	else if(review_keys[2] == 'friendsno') tot_score += parseInt(2);

	if(review_keys[3] == 'sleep')	tot_score += parseInt(10);
	else if(review_keys[3] == 'sleepno') tot_score += parseInt(4);

	if(review_keys[4] == 'relax')	tot_score += parseInt(5);
	else if(review_keys[4] == 'relaxno') tot_score += parseInt(2);

	if(review_keys[5] == 'motivate')	tot_score += parseInt(10);
	else if(review_keys[5] == 'motivateno') tot_score += parseInt(5);

	if(review_keys[6] == 'notatall')	tot_score += parseInt(10);
	else if(review_keys[6] == 'slight') tot_score += parseInt(6);
	else if(review_keys[6] == 'verystressed') tot_score += parseInt(3);

	if(review_keys[7] == 'self')	tot_score += parseInt(3);
	else if(review_keys[7] == 'selfmay') tot_score += parseInt(7);
	else if(review_keys[7] == 'selfno') tot_score += parseInt(15);

	tot_score += parseInt(req.body.points);

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

	
	tot_score = tot_score + parseInt(thoughts_analysis)*3 + parseInt(talk_analysis*3)
	console.log(thoughts_analysis, talk_analysis, tot_score, typeof(tot_score), tot_score);

	User.findOne({ where: { id: decoded.id} })
		.then((User) => {
			if(User)	{
				Report.create({
					user_id: decoded.id,
                    name: 'HELLO',
					date:  datetime,
					score: tot_score,
				})
				.then((Report) => {
						console.log('success');
						req.body.id= decoded.id; req.body.mood= review_keys[1]; req.body.friends= review_keys[2];
						req.body.sleep= review_keys[3]; req.body.relax= review_keys[4]; req.body.motivate= review_keys[5];
						req.body.stress= review_keys[6]; req.body.selfharm= review_keys[7]; req.body.happiness= review_keys[8];
						req.body.thoughts= thoughts; req.body.talk= talks;
						req.body.thoughts_analysis= thoughts_analysis; req.body.talk_analysis= talk_analysis;
						req.body.score = tot_score; req.body.email = User.email; req.body.acq_email = User.acq_email;
						console.log('going to send mails')
						next(); //sending mail
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
	
};

exports.scrapeData = (req, res) => {
	const loc = req.body.location.toLowerCase();
	const url = 'https://www.practo.com/' + loc + '/psychiatrist?sort_by=patient_experience_score';
	console.log(url);
	rp(url)
      .then(function(html) {
		console.log('here');
		const doc_name = $('.info-section .doctor-name', html).first().text()
		const doc_qual = $('.info-section .u-d-inline', html).first().text()
		const doc_exp = $('.info-section .uv2-spacer--xs-top', html).first().text()
		const doc_fee = $('.info-section .uv2-spacer--sm-top .uv2-spacer--xs-top span', html).first().text()
		const doc_url = 'https://www.practo.com' + $('.info-section a', html).attr('href')
		console.log(doc_name, doc_qual, doc_exp, doc_fee, doc_url)
		// console.log(data1, typeof(data1));
		var docName = [];
		var docQual = [];
		var docExp = [];
		var docFee = [];
		var docURL = [];

	$('.info-section .doctor-name', html).each(function (i, elem) {
		// console.log($(this).text())
		docName.push($(this).text())
    });
	$('.info-section .u-d-inline', html).each(function (i, elem) {
		// console.log($(this).text())
		docQual.push($(this).text())
    });
	$('.info-section .uv2-spacer--xs-top', html).each(function (i, elem) {
		// console.log($(this).text())
		docExp.push($(this).text())
    });
	res.status(200).render('../views/scrape1.pug', {title: 'scrape data', DoctorName: doc_name, DoctorQual: doc_qual, Exp: doc_exp, Fee: doc_fee, url: doc_url })
  	})
  .catch(function(err) {
    //handle error
	throw err;
  });
	// res.status(200).send({ message: "hi"});
}

exports.recommendMusic = (req, res) => {
	if (typeof localStorage === "undefined" || localStorage === null) {
		// 		console.log('hi in local storage')
		localStorage = new LocalStorage('./scratch');
			 }
	token = localStorage.getItem('Key');
	const decoded = jwt_decode(token);
	console.log(decoded)
	const user_id = decoded.id;
	console.log(decoded.id);
	const SongLink = []

	Report.findOne({ where: { user_id: decoded.id },
		order: [ [ 'date', 'desc' ] ]
	  })
	  .then((Report) => {
		    if(Report.score < 45) {
				Song.findAll({ where: {genre: 'Happy'}
				})
				.then((Song) => {
					console.log('hi from songs')
					let i = 0;
					// for(i = 0; i < 3; i++) {
					// 	console.log(Song[i].dataValues.link);
					// 	SongLink.push(Song[i].dataValues.link);
					// }
					res.status(200).render('../views/musicrecommender.pug', { title: 'music' , song1: Song[0].dataValues.link, song2: Song[1].dataValues.link, song3: Song[2].dataValues.link});	
				})
				.catch((err) => {
					throw err;
				})
			}
			else if(Report.score < 60) {
				Song.findAll({ where: {genre: 'Pop'}
				})
				.then((Song) => {
					console.log('hi from songs')
					res.status(200).render('../views/musicrecommender.pug', { title: 'music' , song1: Song[0].dataValues.link, song2: Song[1].dataValues.link, song3: Song[2].dataValues.link});		
				})
				.catch((err) => {
					throw err;
				})
			}
			else {
				{
					Song.findAll({ where: {genre: 'HipHop'}
					})
					.then((Song) => {
						console.log('hi from songs')
						res.status(200).render('../views/musicrecommender.pug', { title: 'music' , song1: Song[0].dataValues.link, song2: Song[1].dataValues.link, song3: Song[2].dataValues.link});	
					})
					.catch((err) => {
						throw err;
					})
				}
			}
			console.log(Report.user_id, Report.score);
			// res.status(200).render('../views/musicrecommender.pug', { title: 'music' , song1: Song[0].dataValues.link, song2: Song[1].dataValues.link, song3: Song[2].dataValues.link});	
	  })
	  .catch((err) => {
		  throw err;
	  })
}