/**
 * Create the default RequestInit used in post requests.
 * @param {Object?} body an object containing key values encoded in the body of the post request
 * @returns {RequestInit} the default request init object
 */
export function createRequestInitForPostRequest(body = undefined) {
  return {
    method: "POST",
    headers: createDefaultHeadersForPostRequest(),
    body: body ? urlEncodeObject(body) : null,
    redirect: "follow",
    credentials: "include",
  };
}

/**
 * Create the default RequestInit used in put requests.
 * @param {Object?} body an object containing key values encoded in the body of the put request
 * @returns {RequestInit} the default request init object
 */
export function createRequestInitForPutRequest(body = undefined) {
  return { ...createRequestInitForPostRequest(body), method: "PUT" };
}

/**
 * Create the default RequestInit used in get requests.
 * @returns {RequestInit} the default request init object
 */
export function createRequestInitForGetRequest() {
  return {
    method: "GET",
    redirect: "follow",
    credentials: "include",
  };
}

/**
 * Create the default RequestInit used in delete requests.
 * @returns {RequestInit} the default request init object
 */
export function createRequestInitForDeleteRequest() {
  return {
    method: "DELETE",
    redirect: "follow",
    credentials: "include",
  };
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
  defaultPostHeaders.append(
    "Content-Type",
    "application/x-www-form-urlencoded"
  );
  return defaultPostHeaders;
}

/**
 * If the response is ok (status code in range 200-299) returns the response.
 * Otherwise the method attempts to parse the response and get an error message
 * from the server.
 * @param {Response} response a response from the ChatServer
 * @returns {Promise<Response>} the untransformed response
 */
export function getErrorFromResponse(response) {
  return new Promise((resolve, reject) => {
    if (response.ok) {
      resolve(response);
    } else {
      reject(response);
    }
  }).catch((responseOrError) => {
    if (responseOrError instanceof Response) {
      return responseOrError.json().then((errorJSON) => {
        throw new Error(errorJSON.message);
      });
    }
    throw responseOrError;
  });
}
