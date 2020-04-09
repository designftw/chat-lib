/**
 * Create the default RequestInit used in post requests.
 * @param {Object?} body an object containing key values encoded in the post request
 * @returns {RequestInit} the default request init object
 */
export function createRequestInitForPostRequest(body = undefined) {
	return {
		method: 'POST',
		headers: createDefaultHeadersForPostRequest(),
		body: body ? urlEncodeObject(body) : null,
		redirect: 'follow',
		credentials: 'include'
	}
}

/**
 * Create the default RequestInit used in get requests.
 * @returns {RequestInit} the default request init object
 */
export function createRequestInitForGetRequest() {
	return {
		method: 'GET',
		redirect: 'follow',
		credentials: 'include'
	}
}

/**
 * Convert an object's keys and values into URLEncoded string suitable for a post request.
 * @param {Object} body the object to be url encoded
 */
function urlEncodeObject(body) {
	let urlEncodedBody = new URLSearchParams();
	for (let key of Object.keys(body)) {
		urlEncodedBody.append(key, body[key]);
	}
	return urlEncodedBody;
}

/**
 * Create the default headers used in post requests.
 * @returns {Headers}
 */
function createDefaultHeadersForPostRequest() {
	let defaultPostHeaders = new Headers();
	defaultPostHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	return defaultPostHeaders;
}