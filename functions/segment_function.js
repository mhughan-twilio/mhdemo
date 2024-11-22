// Learn more about source functions API at
// https://segment.com/docs/connections/sources/source-functions

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */
async function onRequest(request, settings) {
	const body = request.json();
	if (
		!body.account_sid &&
		!body.transcript_sid &&
		body.event_type == 'lit_results_available'
	) {
		throw new Error('Not a lit_results_available event. Ignoring');
	}

	// extract the unredacted inferred traits considered PII
	const endpoint =
		'https://intelligence.twilio.com/v2/Transcripts/' +
		body.transcript_sid +
		'/OperatorResults?Redacted=false';
	let response;

	try {
		response = await fetch(endpoint, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${btoa(
					settings.apiKey + ':' + settings.apiSecret
				)}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		// Retry on connection error
		throw new RetryError('GET OperatorResults' + error.message);
	}

	if (response.status >= 500 || response.status === 429) {
		// Retry on 5xx (server errors) and 429s (rate limits)
		throw new RetryError(`GET OperatorResults Failed with ${response.status}`);
	}

	if (response.status !== 200) {
		throw new Error(
			'`GET OperatorResults status not 200, was ' + response.status
		);
	}

	const metaendpoint =
		'https://intelligence.twilio.com/v2/Transcripts/' + body.transcript_sid;
	let meta_response;

	try {
		meta_response = await fetch(metaendpoint, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${btoa(
					settings.apiKey + ':' + settings.apiSecret
				)}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		// Retry on connection error
		throw new RetryError('GET Transcript ' + error.message);
	}

	if (meta_response.status >= 500 || meta_response.status === 429) {
		// Retry on 5xx (server errors) and 429s (rate limits)
		throw new RetryError(`GET Transcript Failed with ${meta_response.status}`);
	}

	let meta = await meta_response.json();
	let opresults = await response.json();

	let customer_name;
	let customer_email;
	let customer_phone_number;
	let customer_user_id;
	for (index in meta.channel.participants) {
		if (
			meta.channel.participants[index].role != null &&
			meta.channel.participants[index].role.toLowerCase() == 'customer'
		) {
			customer_name = meta.channel.participants[index].full_name;
			customer_email = meta.channel.participants[index].email;
			customer_phone_number =
				meta.channel.participants[index].media_participant_id;
			customer_user_id = meta.channel.participants[index].user_id;

			// TODO: Use identity that can be mapped in segment for ex: phone number
			if (!customer_user_id) {
				customer_user_id =
					meta.channel.participants[index].media_participant_id;
				//throw new Error('Cannot track without customer_user_id');
			}
		}
	}

	let props = {};

	for (index in await opresults.operator_results) {
		let result = opresults.operator_results[index];
		// classification traits
		if (result.operator_type == 'conversation-classify') {
			props[result.name] = result.predicted_label;
		} else if (result.operator_type == 'extract') {
			trait_value = result.extract_results;
			if (!result.extract_match) {
				trait_value = 'NoMatch';
			}
			props[result.name] = trait_value;
		} else if (
			result.operator_type == 'pii-extract' &&
			result.extract_match == true
		) {
			for (var key in result.extract_results) {
				if (!(key in props)) {
					props[key] = result.extract_results[key][0];
				} else {
					// handle the case for multiple values per entity category
				}
			}
		}
	}

	for (var key in props) {
		if (key == 'PhoneNumber' || key == 'ZipCode' || key == 'City') {
			// trim white spaces in Phone Numbers, ZipCodes and City spell outs
			props[key] = props[key].replace(/\s/g, '');
		}
		// convert a spelled email to proper email
		else if (key == 'Email') {
			let email = '';
			let arr = props[key].split(' ');
			for (var i in arr) {
				if (arr[i].toLowerCase() == 'dot') {
					email = email + '.';
				} else if (arr[i].toLowerCase() == 'at') {
					email = email + '@';
				} else if (arr[i].toLowerCase() == 'underscore') {
					email = email + '_';
				} else {
					email = email + arr[i];
				}
			}
			props[key] = email;
		}
	}

	console.log(props);
	Segment.identify({
		userId: customer_user_id,
		traits: props
	});
}
