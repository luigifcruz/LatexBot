var express = require('express'),
app = express(),
fs = require('fs'),
http = require('http'),
request = require('request'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser');

var server = http.createServer(app).listen(16000);

var BOT_AUTH = "";

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/LatexBot', function(req, res){
  res.send("Thanks!");
  if (req.body.message.text != undefined) {
    var TelegramChatID = req.body.message.chat.id;
    var message = req.body.message.text.split(" ");
    var command = message[0];
    var sentence = req.body.message.text.replace("/convert ", "").replace("/convert@LatexBot ", "").replace("/help ", "").replace("/help@LatexBot ", "").replace("/start ", "").replace("/convertDoc ", "").replace("/convertDoc@LatexBot ", "");

    if (command == "/help" || command == "/help@LatexBot" || command == "/start") {
      reply(TelegramChatID, "NEW: Now you can generate LaTeX Documents with _/convertDoc LaTeX_!");
      reply(TelegramChatID, "Send me the LaTeX and receive the image!\nIn groups send: _/convert LaTeX_");
      reply(TelegramChatID, "The LatexBot Source Code is available at [GitHub](https://github.com/luigifreitas/LatexBot). Created by @luigifreitas :D");
    } else {
      if (sentence) {
        if (sentence.match(/\input{(.*?)\}/g)){
            // Blacklist Commands
            reply(TelegramChatID, "Command not available.");
            return;
        }
        if (command == "/convert" || command == "/convert@LatexBot") {
          renderImage(TelegramChatID, sentence);
        } else if (command == "/convertDoc" || command == "/convertDoc@LatexBot") {
          renderDoc(TelegramChatID, sentence);
        } else if (req.body.message.chat.title == undefined) {
          renderImage(TelegramChatID, sentence);
        }
      } else {
        reply(TelegramChatID, "Cannot find any sentence.");
      }
    }
  }
});

app.get('/', function(req, res){
  res.send("LatexBot Up!")
});

function renderImage(TelegramChatID, Sentence) {
  var path = __dirname + '/latex/' + tokenGenerator(10) + '.png';
  var dest = fs.createWriteStream(path);

  var render = require("mathmode")(Sentence).pipe(dest);
  render.on('finish', function () {
    replyImage(TelegramChatID, path);
  });
}

function renderDoc(TelegramChatID, Sentence) {
  var path = __dirname + '/latex/' + tokenGenerator(10) + '.pdf';
  var dest = fs.createWriteStream(path);

  var render = require("latex")(Sentence).pipe(dest)
  render.on('finish', function () {
    replyFile(TelegramChatID, path);
  });
}

function replyImage(TelegramChatID, Path) {
  var formData = {
    chat_id: TelegramChatID,
    photo: fs.createReadStream(Path)
  };
  request.post({url:'https://api.telegram.org/' + BOT_AUTH + '/sendPhoto', formData: formData}, function(err,httpResponse,body){
    var response = JSON.parse(body);
    if (!response.ok) {
      replyFile(TelegramChatID, Path);
    }
  });
}

function replyFile(TelegramChatID, Path) {
  var formData = {
    chat_id: TelegramChatID,
    document: fs.createReadStream(Path)
  };
  request.post({url:'https://api.telegram.org/' + BOT_AUTH + '/sendDocument', formData: formData}, function(err,httpResponse,body){
    var response = JSON.parse(body);
    if (!response.ok) {
      reply(TelegramChatID, "Sorry, something happend with the image. Check the LaTeX syntax.");
    }
  });
}

function reply(TelegramChatID, Sentence) {
  var formData = {
    chat_id: TelegramChatID,
    parse_mode: "Markdown",
    text: Sentence
  };
  request.post({url:'https://api.telegram.org/' + BOT_AUTH + '/sendMessage', formData: formData});
}

function tokenGenerator(num){
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for( var i=0; i < num; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
