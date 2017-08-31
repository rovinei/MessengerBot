var config = require('../config');
var request = require('request');
var fs = require('fs');
var Weather = require('./WeatherController');
var _ = require('lodash');
var _array = require('lodash/array');
var _object = require('lodash/fp/object');



/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

   *************************************************************
   ***                                                       ***
   *** @POST request
   ***
   ***
   ***
   ***
   ***                                                       ***
   *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
var incomingMessageReceived = function(req, res, next){
   var data = req.body;
   console.log("message received : "+data);
   // Make sure this is a page subscription
   if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
         var pageID = entry.id;
         var timeOfEvent = entry.time;

         // Iterate over each messaging event
         entry.messaging.forEach(function(event) {
            if (event.message) {
               receivedMessage(event);
            } else if(event.postback){
               receivedResponseBack(event);
            } else {
               console.log("Webhook received unknown event: ", event);
            }
         });
      });

      // Assume all went well.
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.

      res.sendStatus(200);
   }

   console.log("page not subscribe");
}




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

   *************************************************************
   ***                                                       ***
   *** @POST request
   ***
   ***
   ***
   ***
   ***                                                       ***
   *************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
var receivedMessage = function (event) {
   var senderID = event.sender.id;
   var recipientID = event.recipient.id;
   var timeOfMessage = event.timestamp;
   var message = event.message;

   console.log("Received message for user %d and page %d at %d with message:",
               senderID, recipientID, timeOfMessage);
   console.log(JSON.stringify(message));

   var messageId = message.mid;

   var messageText = _.toLower(value);
   var messageWords = _.words(messageText);
   var messageAttachments = message.attachments;

   if (messageText !== "") {

      // If we receive a text message, check to see if it matches a keyword
      // and response appropiately back
      if(_.includes(messageWords, "weather")){
         weatherResponse(senderID, messageWords);
      }

   } else if (messageAttachments) {
      console.log("MESSAGE ATTACHMENT : "+messageAttachments);
      sendTextMessage(senderID, "Message with attachment received");
   }
}


var weatherResponse = function (recipientId, messageWords){

   // Identified data type of message
   if(typeof messageWords == "object" && messageWords instanceof Array){
      if(messageWords.length > 1){
         var location = messageWords.pop();
         var weather = new Weather(location);
         weather.current(function(err, data){
            var result = JSON.parse(data);
            var message = presentationText(result);
            sendTextMessage(recipientId, message);
         });
      }else{
         sendTextMessage(recipientId, "Which city you want to know the weather?");
      }

   }

   function presentationText(data){
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      var today = new Date();
      var message = `
         Weather Of ${data.name || ''} today ${today.getDate()} ${today.getMonth()}, ${today.getFullYear()}

         Temperature : ${data.main.temp || ''}
         Min Temperature : ${data.main.temp_min || ''}
         Max Temperature : ${data.main.temp_max || ''}
         Condition : ${data.weather.description || ''}
      `;
      return message;
   }

   // Handle weather json file from disk
   function handleFile(err, data){
      if(err){
         console.log(err);
      }

      obj = JSON.parse(data);
      console.log("JSON FILE: "+ obj.main.temp);
   }
}

var sendTextMessage = function (recipientId, messageText) {
   var messageData = {
      recipient: {
         id: recipientId
      },
      message: {
         text: messageText
      }
   };

   callSendAPI(messageData);
}




var callSendAPI = function (messageData) {
   request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: config.page_access_token },
      method: 'POST',
      json: messageData

   }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
         var recipientId = body.recipient_id;
         var messageId = body.message_id;

         console.log("Successfully sent generic message with id %s to recipient %s",
                     messageId, recipientId);
      } else {
         console.error("Unable to send message.");
         console.error(response);
         console.error(error);
      }
   });
}




var sendGenericMessage = function (recipientId) {
   var messageData = {
      recipient: {
         id: recipientId
      },
      message: {
         attachment: {
            type: "template",
            payload: {
               template_type: "generic",
               elements: [{
                  title: "rift",
                  subtitle: "Next-generation virtual reality",
                  item_url: "https://www.oculus.com/en-us/rift/",
                  image_url: "http://messengerdemo.parseapp.com/img/rift.png",
                  buttons: [{
                     type: "web_url",
                     url: "https://www.oculus.com/en-us/rift/",
                     title: "Open Web URL"
                  }, {
                     type: "postback",
                     title: "Call Postback",
                     payload: "Payload for first bubble",
                  }],
               }, {
                  title: "touch",
                  subtitle: "Your Hands, Now in VR",
                  item_url: "https://www.oculus.com/en-us/touch/",
                  image_url: "http://messengerdemo.parseapp.com/img/touch.png",
                  buttons: [{
                     type: "web_url",
                     url: "https://www.oculus.com/en-us/touch/",
                     title: "Open Web URL"
                  }, {
                     type: "postback",
                     title: "Call Postback",
                     payload: "Payload for second bubble",
                  }]
               }]
            }
         }
      }
   };

  callSendAPI(messageData);
}


var receivedResponseBack = function (event) {
   var senderID = event.sender.id;
   var recipientID = event.recipient.id;
   var timeOfPostback = event.timestamp;

   // The 'payload' param is a developer-defined field which is set in a postback
   // button for Structured Messages.
   var payload = event.postback.payload;

   console.log("Received postback for user %d and page %d with payload '%s' " +
               "at %d", senderID, recipientID, payload, timeOfPostback);

   // When a postback is called, we'll send a message back to the sender to
   // let them know it was successful
   sendTextMessage(senderID, "Postback called");
}


var checkServer = function(req, res, next){
   console.log("check server loading");
   res.render('index', { title: 'Express', page_token: config.page_access_token, verify_token: config.fb_verify_token });
}

module.exports = {
   incomingMessageReceived : incomingMessageReceived,
   receivedMessage: receivedMessage,
   sendTextMessage: sendTextMessage,
   callSendAPI: callSendAPI,
   sendGenericMessage: sendGenericMessage,
   receivedResponseBack: receivedResponseBack,
   checkServer: checkServer
}
