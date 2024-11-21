const twilio = require("twilio");

// List of 10 phone numbers
const fromNumbers = [
    '+12315974034', // Sarah
    '+16073043496', // Mark
    '+14057085685', // Lisa
    '+14159309737', // John
    '+17637036293', // Sophie
    '+18039939947', // David
    '+14782177111', // Angela
    '+14436162865', // Rob
    '+12402563976', // Evan
    '+15712527286' // Amy
];

// Choose a random from number
const randomIndex = Math.floor(Math.random() * fromNumbers.length);
const fromNumber = fromNumbers[randomIndex];

// Your Twilio account SID and auth token
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

// Create a Twilio client
const client = twilio(accountSid, authToken);

exports.handler = async (event) => {
    const call = await client.calls.create({
        url: 'https://mhdemo-2772-dev.twil.io/transcribe_customer',
        to: '+14123019770', // Support line
        from: fromNumber,
    });
  
    console.log(call.sid);
};