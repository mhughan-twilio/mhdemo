// This is the main function that will be executed when the handler is triggered
exports.handler = function(context, event, callback) {
    // Create a new instance of Twilio's VoiceResponse. This will be used to generate TwiML, which is a set of instructions that tell Twilio what to do when you receive an incoming call or SMS.
    let twiml = new Twilio.twiml.VoiceResponse();

    // Initialize a variable to hold the conference name. In this case, the conference name is set to the CallSid from the event, which is the unique identifier of the call.
    let conferenceName;
    conferenceName = event.CallSid; 

    // Create a new Dial verb. This verb is used to connect the current call to another phone. The timeLimit attribute sets the maximum duration of the call in seconds.
    const dial = twiml.dial({
            timeLimit: 60,
        });

    // Add a Conference noun to the Dial verb. This is used to connect the current call to a conference call. The conference name is set to the CallSid from the event.
    dial.conference({
        // The URL that Twilio will send information to when the conference starts and when a participant joins the conference.
        statusCallback: 'https://mhdemo-2772-dev.twil.io/conferenceStatusCallback',
        // The events that Twilio will send information about to the statusCallback URL.
        statusCallbackEvent: 'start join',
        // The label of the participant. In this case, the participant is labeled as 'customer'.
        participantLabel: 'customer',
        // The conference call will be recorded from the start.
        record: 'record-from-start',
        // The conference will end when the participant who initiated the conference leaves.
        endConferenceOnExit: true
    }, conferenceName);

    // End the function and return the generated TwiML
    return callback(null, twiml);
};