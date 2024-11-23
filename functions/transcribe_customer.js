exports.handler = function(context, event, callback) {
    // Create a TwiML Voice Response object to build the response
    const twiml = new Twilio.twiml.VoiceResponse();

    // Listen to the user's speech and pass the input to the /respond Function
    twiml.gather({
        speechTimeout: 'auto', // Automatically determine the end of user speech
        speechModel: 'experimental_conversations', // Use the conversation-based speech recognition model
        input: 'speech', // Specify speech as the input type
        action: '/respond_customer', // Send the collected input to /respond 
        timeout: 30, //sets the timeout if no speech is received
    });

    // Redirect to the Function where the <Gather> is capturing the caller's speech
    twiml.redirect({
        method: "POST",
    },
    `/transcribe_customer`
    );

    // Create a Twilio Response object
    const response = new Twilio.Response();

    // Set the response content type to XML (TwiML)
    response.appendHeader('Content-Type', 'application/xml');

    // Set the response body to the generated TwiML
    response.setBody(twiml.toString());

    // If no conversation cookie is present, set an empty conversation cookie
    if (!event.request.cookies.convo) {
        response.setCookie('convo', '', ['Path=/']); 
    }

    // Return the response to Twilio
    return callback(null, response);
};
