// This is the main function that will be executed when the handler is triggered
exports.handler = async function(context, event, callback) {
    // Create a new instance of Twilio's VoiceResponse. This will be used to generate TwiML, which is a set of instructions that tell Twilio what to do when you receive an incoming call or SMS.
    let twiml = new Twilio.twiml.VoiceResponse();
    console.log('twiml:', twiml);

    // Get the Twilio client from the context. This client allows you to interact with the Twilio API.
    const client = context.getTwilioClient();
    console.log('client:', client);

    // Get the ConferenceSid from the event. This is the unique identifier of the conference call.
    const conferenceSid = event.ConferenceSid;
    console.log('conferenceSid:', conferenceSid);

    // Start of try block. If any error occurs within this block, it will be caught and handled by the catch block.
    try {
        // Check if the participant label is 'customer'
        if (event.ParticipantLabel === 'customer') {
            console.log('ParticipantLabel is customer');
            
            // Get the CallSid from the event. This is the unique identifier of the call.
            const callSid = event.CallSid;
            console.log('callSid:', callSid);

            // Fetch the details of the call using the callSid
            const callDetails = await client.calls(callSid).fetch();
            // Get the customer's phone number from the call details
            const customerPhoneNumber = callDetails.from;
            console.log('customerPhoneNumber:', customerPhoneNumber);

            /*
            // List of 10 agent phone numbers
            const agentNumbers = [
                '+18302641596', // Alice
                '+15737192194', // Bob
                '+15804981301', // Charlie
                '+15732504154', // Daisy
                '+12093539416', // Ethan
                '+15755183842', // Fiona
                '+19286123559', // Grace
                '+15705340914', // Henry
                '+15705414518', // Ivy
                '+12604086524' // Jack
            ];

            // Choose a random from number
            const randomIndex = Math.floor(Math.random() * agentNumbers.length);
            const agentNumber = agentNumbers[randomIndex];*/

            // Create a new participant in the conference call. This participant is labeled as 'agent'.
            const agent = await client.conferences(conferenceSid).participants.create({
                from: customerPhoneNumber,
                to: '+14242034681', //agent
                //to: agentNumber, //agent
                label: 'agent',
                statusCallback: 'https://mhdemo-2772-dev.twil.io/conferenceStatusCallback',
            });
            console.log('agent created:', agent);
        } 
        // Check if the participant label is 'agent'
        else if (event.ParticipantLabel === 'agent') {
            console.log('ParticipantLabel is agent');

            // Get the CallSid of the agent from the event
            const agentCallSid = event.CallSid;
            console.log('agentCallSid:', agentCallSid);
        }

        // End the function and return the generated TwiML
        return callback(null, twiml);
    // If any error occurred in the try block, it will be caught here
    } catch (error) {
        // Log the error and end the function
        console.error('Error occurred:', error);
        return callback(error);
    }
}