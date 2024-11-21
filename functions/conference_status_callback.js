exports.handler = async function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    console.log('twiml:', twiml);

    const client = context.getTwilioClient();
    console.log('client:', client);

    const conferenceSid = event.ConferenceSid;
    console.log('conferenceSid:', conferenceSid);

    try {
        if (event.ParticipantLabel === 'customer') {
            console.log('ParticipantLabel is customer');
            
            const callSid = event.CallSid;
            console.log('callSid:', callSid);

            const callDetails = await client.calls(callSid).fetch();
            const customerPhoneNumber = callDetails.from;
            console.log('customerPhoneNumber:', customerPhoneNumber);

            const agent = await client.conferences(conferenceSid).participants.create({
                from: customerPhoneNumber,
                to: '+17622254814',
                label: 'agent',
                statusCallback: 'https://mhdemo-2772-dev.twil.io/conferenceStatusCallback',
            });
            console.log('agent created:', agent);
        } else if (event.ParticipantLabel === 'agent') {
            console.log('ParticipantLabel is agent');

            const agentCallSid = event.CallSid;
            console.log('agentCallSid:', agentCallSid);

        return callback(null, twiml);
    } catch (error) {
        console.error('Error occurred:', error);
        return callback(error);
    }
};