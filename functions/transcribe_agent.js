exports.handler = function(context, event, callback) {
    // Create a TwiML Voice Response object to build the response
    const twiml = new Twilio.twiml.VoiceResponse();

    // Access the agent from the query parameters
    const agent = JSON.parse(decodeURIComponent(event.Agent));
    //const agentname = agent.name;
    //const agentname = event.Agent;

    // If no previous conversation is present, or if the conversation is empty, start the conversation
    /*if (!event.request.cookies.convo) {
        // Greet the user with a message using AWS Polly Neural voice
        twiml.say({
                voice: 'Polly.Joanna-Neural',
            },
	    "Hey! I'm Joanna, a chatbot created using Twilio and ChatGPT. What would you like to talk about today?"
        );
    }*/

    // Stringify and encode the agent object
    const agentString = encodeURIComponent(JSON.stringify(agent)); //isnt this just event.Agent?

    // Pass the agentPersona to the /respond_agent Function
    const actionUrl = agent.name ? `/respond_agent?Agent=${agentString}` : '/respond_agent';

    // Listen to the user's speech and pass the input to the /respond Function
    twiml.gather({
        speechTimeout: 'auto', // Automatically determine the end of user speech
        speechModel: 'experimental_conversations', // Use the conversation-based speech recognition model
        input: 'speech', // Specify speech as the input type
        //action: `/respond_agent`, // Send the collected input to /respond 
        action: `/respond_agent?Agent=${agentString}`, // Send the collected input to /respond 
        timeout: 30,
    });

    // Redirect to the Function where the <Gather> is capturing the caller's speech
    twiml.redirect({
        method: "POST",
    },
    //`/transcribe_agent?Agent=${agentname}`
    `/transcribe_agent?Agent=${agentString}`
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
