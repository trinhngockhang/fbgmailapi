

var express = require("express");
var app = express();
const nodemailer = require('nodemailer');
var request = require('request');
var FB = require('fb');
app.set("view engine","ejs");
app.set("vỉews","./views");
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 6969;

app.use(bodyParser.json({ extend: true }));
app.use(bodyParser.urlencoded({ extend: true }));

app.get('/',(req,res) =>{
	res.render("trangchu.ejs");
})

app.get('/mail',(req,res) => { 
	res.render('mail.ejs');
})

app.post('/sendmail',(req,res) => {
	var accountSender = {
		user:req.body.user,
		pass:req.body.pass
	}
	var subject = req.body.subject;
	var receivers = req.body.receivers;
	var content = req.body.content;
	var transporter = nodemailer.createTransport({
		host:'https://facebookgmailapi.herokuapp.com',
		service: 'gmail',
		auth: {
			   user: accountSender.user,
			   pass: accountSender.pass
		   }
	   });
	const mailOptions = {
		from: accountSender.user, // sender address
		to: receivers, // list of receivers
		subject: subject, // Subject line
		html:content// plain text body
	  };   
	  transporter.sendMail(mailOptions, function (err, info) {
		if(err){
			res.send(err);
			console.log(err);
		}
		else{
			res.send('done');
			console.log(info);
		}
		  
	 });
})

app.post("/postfb",(req,res) =>{
	var token;
	var content;
	content = req.body.content;
	token = req.body.token;
	FB.setAccessToken(token);
	postFb(content);
	res.send("done");
})


function postFb(content){
	FB.api(
		'/me/feed',
		'POST',
		{"message":content},
		function(response) {
		
		}
	  );
}

app.listen(PORT, err => {
	if (err) throw err;
	console.log(`Server listening on ${PORT}`);
});
