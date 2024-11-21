exports.handler = function(context, event, callback) {

    // Create a TwiML Voice Response object to build the response
    const twiml = new Twilio.twiml.VoiceResponse();

    // Randomly select an agent name from a list of 10 names
    const agentNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivy', 'Jack'];
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];
    console.log(`Selected Agent Persona: ${agentName}`);

    // Listen to the user's speech and pass the input to the /respond Function
    twiml.gather({
        speechTimeout: 'auto', // Automatically determine the end of user speech
        speechModel: 'experimental_conversations', // Use the conversation-based speech recognition model
        input: 'speech', // Specify speech as the input type
        action: '/respond_agent', // Send the collected input to /respond --/respond_agent&agentname
    }).say(`Thank you for calling Ace Hardware. This is ${agentName}. How can I assist you today?`);

    // Create a Twilio Response object
    const response = new Twilio.Response();

// Set the response content type to XML (TwiML)
response.appendHeader('Content-Type', 'application/xml');

// Set the response body to the generated TwiML
response.setBody(twiml.toString());

//append a query parameter to the URL to indicate the agent name
response.appendHeader('Location', '/respond_agent&agentname=Bob');

// If no conversation cookie is present, set an empty conversation cookie
if (!event.request.cookies.convo) {
    response.setCookie('convo', '', ['Path=/']); 
}

// Return the response to Twilio
return callback(null, response);
}








/*

    let agentPersona;

    // Check if there is an agent present in the event
    if (!event.Agent) {
        // Pick a random agent 
        const agents = [
            'Sarah',
            'Mark',
            'Lisa',
            'John',
            'Sophie',
            'David',
            'Angela',
            'Rob',
            'Emily',
            'Tim'
        ];

        // Choose a random agent from the list
        agentPersona = agents[Math.floor(Math.random() * agents.length)];
        console.log(`Selected Agent Persona: ${agentPersona}`);

        const twiml = new Twilio.twiml.VoiceResponse();

        twiml.say({
            voice: 'Polly.Joanna-Neural',
        },
        `Thank you for calling Howard's Duct Tape Warehouse. This is ${agentPersona}. We've got all the tape you need for your ducts.`
        );
    }


    // Pass the agentPersona to the /respond Function
    const actionUrl = agentPersona ? `/respondAgent?Agent=${agentPersona}` : '/respondAgent';

    // Pass the agentPersona to the /respond Function
    const actionUrl = agentPersona ? `/respondAgent?Agent=${agentPersona}` : '/respondAgent';

    // Create a TwiML Voice Response object to build the response
    const twiml = new Twilio.twiml.VoiceResponse();

    // Randomly select an agent name from a list of 10 names
    const agentNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivy', 'Jack'];
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];
*/

