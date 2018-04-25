var express = require("express");
var app = express();
const fs = require('fs');
const nodemailer = require('nodemailer');
var request = require('request');
var FB = require('fb');
app.set("view engine","ejs");
app.set("vỉews","./views");
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 6969;
const Controller = require('./controller');
const multer = require('multer');
app.use(bodyParser.json({ extend: true }));
app.use(bodyParser.urlencoded({ extend: true }));
const mongoose = require('mongoose');
const connectionString = "mongodb://Trinhngockhang1503:khangkhang123@ds213759.mlab.com:13759/fbgmailapi" || "mongodb://localhost/fbgmailapi";

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");
    next();
});

app.get('/',(req,res) =>{
	res.render("trangchu.ejs");
})

app.post('/getdata',(req,res) =>{
	var info = {};
	token = req.body.token;
	FB.setAccessToken(token);
	FB.api(
		'/me',
		'GET',
		{"fields":"name,picture"},
		function(response) {
			info.name = response.name;
			info.ava = response.picture;
			res.send(info);
		}
	  );
})

app.post('/sendmail',multer(Controller.multerConf).single('img'),(req,res) => {
	console.log("requested to send email");
	var accountSender = {
		user:req.body.user,
		pass:req.body.pass
	}
	var subject = req.body.subject;
	var receivers = req.body.receivers;
	var content = req.body.content;
	var transporter = nodemailer.createTransport({
		host:'smtp.gmail.com',
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
		text:content
	  };   
	  if(req.file){
		console.log("co file");
		var fileContent = req.file.buffer;
		var filepath = "./public/uploads/" + req.file.originalname;
		fs.writeFile(filepath, new Buffer(fileContent, "base64"), (err) => {
			if (err){
				res.send(err);
				console.log("lỗi create file");
				console.log(err);
			}
			console.log("create file sc");
			mailOptions.attachments = [
				{
				  filename: req.file.originalname,
				  content: fs.createReadStream(filepath),
				  contentType : req.file.mimetype
				}
			  ]
			  transporter.sendMail(mailOptions, function (err, info) {
				if(err){
					res.send("Wrong pass");
					console.log(err);
				}
				else{
					res.send('done');
					console.log(info);
				}
			 });
		});   	
	  }else{
		  console.log("ko file");
		transporter.sendMail(mailOptions, function (err, info) {
			if(err){
				res.send("Wrong pass");
				console.log(err);
			}
			else{
				res.send('done');
				console.log(info);
			}
		 });
	  }	 
})

app.post('/timestamp',(req,res) =>{
	var token = req.body.token;
	Controller.getTimeStamp(req,res,token);
})

app.post("/postfb",multer(Controller.multerConf).single('img'),(req,res)=>{
	var token;
	var status = req.body.title +"\n" +req.body.caption;
	var data = {
		title: req.body.title,
		content: req.body.caption
	}
	token = req.body.token;
	FB.setAccessToken(token);
	
	if(req.file){
		console.log("co ton tai file");
		console.log("file" + req.file);
		var fileContent = req.file.buffer;
		var content = {};
		var filepath = "./public/uploads/" + req.file.originalname;
		fs.writeFile(filepath, new Buffer(fileContent, "base64"), (err) => {
			if (err) throw err;
			content = {
				img: fs.createReadStream(filepath),
				caption : req.body.title +"\n" +req.body.caption
			}
			Controller.postImgFb(content);	
			console.log("The file was succesfully saved!");
		}); 
		res.send("da up anh");
	}else{
		console.log("ko ton tai file");
		Controller.postSttFb(status);
		res.send("da up stt");
	}
	Controller.getId((err,doc) => {
		data.id = doc;
		Controller.saveStamp(data,(err,doc)=>{
			if(err) console.log(err);
			else console.log("da luu tc");
		})
	});
})

app.post('/deletedata',(req,res) =>{
	Controller.deleteStamp(req,res,req.body.token);
})

app.listen(PORT, err => {
	if (err) throw err;
	console.log(`Server listening on ${PORT}`);
});

mongoose.connect(connectionString, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connect DB success !');
    }
});

