// Import the OpenAI module
const { OpenAI } = require("openai");

const customers = {
    '+12315974034': { name: 'Sarah', personality: 'polite and friendly', gender: 'woman' },
    '+16073043496': { name: 'Mark', personality: 'rude and impatient', gender: 'man' },
    '+14057085685': { name: 'Lisa', personality: 'kind and understanding', gender: 'woman' },
    '+14159309737': { name: 'John', personality: 'short-tempered and grumpy', gender: 'man' },
    '+17637036293': { name: 'Sophie', personality: 'happy and enthusiastic', gender: 'woman' },
    '+18039939947': { name: 'David', personality: 'calm and patient', gender: 'man' },
    '+14782177111': { name: 'Angela', personality: 'rude and demanding', gender: 'woman' },
    '+14436162865': { name: 'Rob', personality: 'grumpy and moody', gender: 'man' },
    '+12402563976': { name: 'Evan', personality: 'happy and cheerful', gender: 'man' },
    '+15712527286': { name: 'Amy', personality: 'polite and respectful', gender: 'woman' }
};

// Define the main function for handling requests
exports.handler = async function(context, event, callback) {

    const fromNumber = event.From;
    const customer = customers[fromNumber];

    if (!customer) {
        console.log(`No customer found for number ${fromNumber}`);
        return;
    }


  // Set up the OpenAI API with the API key from your environment variables
   const openai = new OpenAI({
    apiKey: context.OPENAI_API_KEY, 
  });

      // Create a TwiML Voice Response object to build the response
      const twiml = new Twilio.twiml.VoiceResponse();

  // Initiate the Twilio Response object to handle updating the cookie with the chat history
  const response = new Twilio.Response();

  // Parse the cookie value if it exists
  const cookieValue = event.request.cookies.convo;
  const cookieData = cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : null;

  // Get the user's voice input from the event
  let voiceInput = event.SpeechResult;

  // Create a conversation object to store the dialog and the user's input to the conversation history
  const conversation = cookieData?.conversation || [];
  conversation.push({role: 'user', content: voiceInput});

  // Get the AI's response based on the conversation history
  const aiResponse = await createChatCompletion(conversation);


  // Add the AI's response to the conversation history
  conversation.push({role: 'assistant', content: aiResponse});

  // Limit the conversation history to the last 20 messages; you can increase this if you want but keeping things short for this demonstration improves performance
  while (conversation.length > 20) {
      conversation.shift();
  }

    // Select the Polly neural voice based on the customer's gender
    const voice = customer.gender === 'woman' ? 'Polly.Joanna-Neural' : 'Polly.Matthew-Neural';

  // Generate some <Say> TwiML using the cleaned up AI response
  twiml.say({ voice }, aiResponse);

  // Redirect to the Function where the <Gather> is capturing the caller's speech
  twiml.redirect({
          method: "POST",
      },
      `/transcribe_customer`
  );

  // Since we're using the response object to handle cookies we can't just pass the TwiML straight back to the callback, we need to set the appropriate header and return the TwiML in the body of the response
  response.appendHeader("Content-Type", "application/xml");
  response.setBody(twiml.toString());

  // Update the conversation history cookie with the response from the OpenAI API
  const newCookieValue = encodeURIComponent(JSON.stringify({
      conversation
  }));
  response.setCookie('convo', newCookieValue, ['Path=/']);

  // Return the response to the handler
  return callback(null, response);

  // Function to generate the AI response based on the conversation history
  async function generateAIResponse(conversation) {
      const messages = formatConversation(conversation);
      return await createChatCompletion(messages);
  }

  // Function to create a chat completion using the OpenAI API
  async function createChatCompletion(messages) {
      try {
        // Define system messages to model the AI
        const systemMessages = [{
                role: "system",
                content: `You are ${customer.name}. You are ${customer.personality}. Introduce yourself and ask very concise questions, less than 10 words. You are a customer, not an assistant. If the agent is rude, ask for a manager.`
            },
            {
                role: "user",
                content: 'We are having a casual conversation over the telephone so please provide engaging but concise responses.'
            },
        ];
        messages = systemMessages.concat(messages);

        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-4',
            temperature: 0.8, // Controls the randomness of the generated responses. Higher values (e.g., 1.0) make the output more random and creative, while lower values (e.g., 0.2) make it more focused and deterministic. You can adjust the temperature based on your desired level of creativity and exploration.
              max_tokens: 100, // You can adjust this number to control the length of the generated responses. Keep in mind that setting max_tokens too low might result in responses that are cut off and don't make sense.
              top_p: 0.9, // Set the top_p value to around 0.9 to keep the generated responses focused on the most probable tokens without completely eliminating creativity. Adjust the value based on the desired level of exploration.
              n: 1, // Specifies the number of completions you want the model to generate. Generating multiple completions will increase the time it takes to receive the responses.
        });

          return chatCompletion.choices[0].message.content;

      } catch (error) {
          console.error("Error during OpenAI API request:", error);
          throw error;
      }
  }
}
