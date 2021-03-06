/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();
const APP_ID = 'amzn1.ask.skill.991f824f-d920-4b98-a684-da9fc0541850';  // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            FACTS: [
                'A year on Mercury is just 88 days long.',
                'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
                'Venus rotates anti-clockwise, possibly because of a collision in the past with an asteroid.',
                'On Mars, the Sun appears about half the size as it does on Earth.',
                'Earth is the only planet not named after a god.',
                'Jupiter has the shortest day of all the planets.',
                'The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.',
                'The Sun contains 99.86% of the mass in the Solar System.',
                'The Sun is an almost perfect sphere.',
                'A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.',
                'Saturn radiates two and a half times more energy into space than it receives from the sun.',
                'The temperature inside the Sun can reach 15 million degrees Celsius.',
                'The Moon is moving approximately 3.8 cm away from our planet every year.',
            ],
            SKILL_NAME: 'Space Facts',
            GET_FACT_MESSAGE: "Here's your fact: ",
            HELP_MESSAGE: 'You can say tell me a space fact, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};

const handlers = {
    'PolitelyAsk': function() {

        // let roommate = ;
        // let message = 
        // this.emit(':tell', 'I will tell ' + roommate + ' to ' + message);
        console.log("inserting into table");
        
        var tableName = "Messages";
        
        var item = {
             "roommate": this.event.request.intent.slots.Roommate.value,
             "message":  this.event.request.intent.slots.Message.value,
             "date": Date.now().toString()
        };
        
        var params = {
             TableName:tableName, 
             Item: item
        };
        console.log(JSON.stringify(params))
        //  docClient.put(params,function(err,data){
        //      if (err) console.log(err);
        //      else console.log(data);
        //  });
         docClient.put(params).promise().then((result) => {
             console.log("success " + JSON.stringify(result));
             this.emit(':tell', 'I will tell ' + item.roommate + ' to ' + item.message);
         },
           (error) => {
                console.log("error " + JSON.stringify(error));
                this.emit(':tell', 'error');
         });
    },
    
    'GetMessagesIntent': function() {
        let roommate = this.event.request.intent.slots.Roommate.value;
        //this.emit(':tell', 'I will read messages to ' + roommate);

        var params = {
                TableName: "Messages",
                KeyConditionExpression: "#roommate = :roommate",
                IndexName: "roommate-index",
                ExpressionAttributeNames:{
                    "#roommate": "roommate"
                },
                ExpressionAttributeValues: {
                    ":roommate":roommate
                }
            };
        console.log("getting messages")
         docClient.query(params).promise().then((result) => {
             console.log("success " + JSON.stringify(result));
            //  this.emit(':tell', 'I will tell ' + item.roommate + ' to ' + item.message);
         },
           (error) => {
                console.log("error " + JSON.stringify(error));
                // this.emit(':tell', 'error');
         });

    },
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {
        // Get a random space fact from the space facts list
        // Use this.t() to get corresponding language data
        const factArr = this.t('FACTS');
        const factIndex = Math.floor(Math.random() * factArr.length);
        const randomFact = factArr[factIndex];

        // Create speech output
        const speechOutput = this.t('GET_FACT_MESSAGE') + randomFact;
        this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), randomFact);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
