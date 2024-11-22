Call flow for the demo

start_call.js
- select a random number (of 10 options) to use as a from number
- place outbound call to the support line (+14123019770) from the selected number
- url to execute once call connects is /transcribe_customer

+14123019770
- inbound config is /customerDialConference

/customerDialConference
- starts a conference
- statusCallback for the conference is /conferenceStatusCallback

/conferenceStatusCallback
- executed when a participants joins the conference
- if agent, log agent
- if customer, log info and add agent participant (+14242034681)

+14242034681
- inbound config is /agent_intro

----agent
/agent_intro
- create array of agents and their respective personalities and genders //add nonbinary?
- choose an agent
- select voice based on gender
- say intro
- gather input and send to /transcribe_agent with the agent details
- if no input redirect to /transcribe_agent with the agent details

/transcribe_agent
- parse out the agent info received in the event
- gather input and send to /respond_agent with the agent details
- if no input redirect back to /transcribe_agent with the agent details

/respond_agent
- parse out the agent info received in the event
- select voice based on gender
- say response based on agent personality and name
- redirect to /transcribe_agent with the agent details
(back and forth between /transcribe_agent and /respond_agent)


---customer
/transcribe_customer
- gather input and send to /respond_customer
- if no input redirect back to /transcribe_customer

/respond_customer
- create array of customers and their respective personalities and genders //add nonbinary?
- select customer based on From number from the event
- select voice based on gender
- say response based on customer personality and name
- redirect to /transcribe_customer
(back and forth between /transcribe_customer and /respond_customer)

escalation request example:
https://console.twilio.com/us1/develop/voice-intelligence/transcripts/GA5e0568682d6ef96d11a4fed880fda20f/transcript-viewer/GT9122cd4e54a2fbd435bbfb076e70cbf7?sensitive=false

TO DO:

- fix participant labels
- use unified profiles
- how can I tell what is in the "cookies"?


- test
- One AI is X with this data
- One AI is a customer
A/B test AI agents
simulated customers against a AI sales bot
