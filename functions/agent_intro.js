exports.handler = function(context, event, callback) {

    // Create a TwiML Voice Response object to build the response
    const twiml = new Twilio.twiml.VoiceResponse();

    const agents = {
        '1': { name: 'Alice', personality: 'impolite and unprofessional', gender: 'woman' },
        '2': { name: 'Bob', personality: 'impatient and unsympathetic', gender: 'man' },
        '3': { name: 'Charlie', personality: 'arrogant and condescending', gender: 'man' },
        '4': { name: 'David', personality: 'cold and indifferent', gender: 'man' },
        '5': { name: 'Eve', personality: 'apathetic and disinterested', gender: 'woman' },
        '6': { name: 'Frank', personality: 'sarcastic and mocking', gender: 'man' },
        '7': { name: 'Grace', personality: 'rude and unsympathetic', gender: 'woman' },
        '8': { name: 'Heidi', personality: 'impatient and unsympathetic', gender: 'woman' },
        '9': { name: 'Ivy', personality: 'impolite and unprofessional', gender: 'woman' },
        '10': { name: 'Jack', personality: 'unfriendly and introverted', gender: 'man' }
    };

    //const randomIndex = '1';
    const randomIndex = Math.floor(Math.random() * agents.length);
    const agent = agents[randomIndex];
    console.log(`Selected Agent: ${agent.name}`);

    // Select the Polly neural voice based on the customer's gender
    const voice = agent.gender === 'woman' ? 'Polly.Danielle-Neural' : 'Polly.Gregory-Neural';

    // Generate some <Say> TwiML using the cleaned up AI response
    twiml.say({ 
        voice 
    }, 
        `Thank you for calling Ace Hardware. This is ${agent.name}. How can I assist you today?`
    );

    // Create a Twilio Response object
    const response = new Twilio.Response();

    // Stringify and encode the agent object
    const agentString = encodeURIComponent(JSON.stringify(agent));

    // Pass the agentPersona to the /transcribe_agent Function
    const actionUrl = agent.name ? `/respond_agent?Agent=${agentString}` : '/respond_agent';
    const actionUrl2 = agent.name ? `/transcribe_agent?Agent=${agentString}` : '/transcribe_agent';
    //const actionUrl = agent.name ? `/transcribe_agent?Agent=${agent.name}` : '/transcribe_agent';

   
    // Gather user input and then redirect to the actionUrl
    twiml.gather({
        speechTimeout: 'auto', // Automatically determine the end of user speech
        speechModel: 'experimental_conversations', // Use the conversation-based speech recognition model
        input: 'speech', // Specify speech as the input type
        action: actionUrl, // Send the collected input to /respond 
        timeout: 30, //sets the timeout if no speech is received
    });

    // If no input was received, redirect to the actionUrl
    twiml.redirect({
        method: 'POST'
    }, actionUrl2);

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
}






/*

    // Listen to the user's speech and pass the input to the /respond Function
    twiml.gather({
        speechTimeout: 'auto', // Automatically determine the end of user speech
        speechModel: 'experimental_conversations', // Use the conversation-based speech recognition model
        input: 'speech', // Specify speech as the input type
        action: '/respond_agent', // Send the collected input to /respond --/respond_agent&agentname
    }).say(`Thank you for calling Ace Hardware. This is ${agentName}. How can I assist you today?`);

    // Create a Twilio Response object
    const response = new Twilio.Response();

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

