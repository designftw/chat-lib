/**
 * Options for creating the request init
 * @typedef {Object} CreateDefaultRequestInitOptions
 * @property {"POST" | "PUT" | "GET" | "DELETE"} [method="GET"] The HTTP method. One of POST, PUT, GET, DELETE.
 * @property {Object.<string, string> | undefined} [headers] an optional object containing key values encoded in the headers of the request. The object should have string keys and string values.
 * @property {Object.<string, any> | undefined} [body] an optional object containing key values encoded in the body of the request. The object should have string keys and string values.
 * @property {"json" | "text"} [responseType="json"] the type of response expected. Defaults to json.
 */

/**
 * Send a request to an API endpoint
 * @param {string} url
 * @param {CreateDefaultRequestInitOptions} options
 * @returns {Promise<any>}
 */
export function request (url, {
    responseType = "json",
    method = "GET",
    ...options
  } = {}) {
  let fetchOptions = {
    method,
    headers: createJSONEncodedHeaders(options.headers),
    body: options.body ? createJSONEncodedBody(options.body) : null,
    redirect: "follow",
    credentials: "include",
  };

  return fetch(url, fetchOptions)
    .then(getErrorFromResponse)
    .then(response => response[responseType]());
}

/**
 * Create Headers from an object.
 * @param {Object.<string, string> | undefined} headers an object containing key values encoded in the headers.
 */
function createHeadersFromObject(headers) {
  let headersToAdd = new Headers();
  if (headers !== undefined) {
    for (let key of Object.keys(headers)) {
      headersToAdd.append(key, headers[key]);
    }
  }
  return headersToAdd;
}

/**
 * Convert an object's keys and values into a json string for a json request
 * @param {Object} body the object to be url encoded
 */
function createJSONEncodedBody(body) {
  return JSON.stringify(body);
}

/**
 * Create the default headers used in GET and DELETE requests.
 * @param {Object.<string, string> | undefined} headers an object containing key values encoded in the headers.
 * @returns {Headers}
 */
function createJSONEncodedHeaders(headers) {
  let defaultHeaders = createHeadersFromObject(headers);
  defaultHeaders.append("Content-Type", "application/json");
  return defaultHeaders;
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
    }
    else {
      reject(response);
    }
  }).catch((responseOrError) => {
    if (responseOrError instanceof Response) {
      return responseOrError.json().then((errorJSON) => {
        console.warn("api error", errorJSON.message);
        throw new Error(errorJSON.message);
      });
    }
    throw responseOrError;
  });
}

/**
 * Normalize an object to an array.
 * If the object is an array, it will be returned, otherwise it will be wrapped with an array.
 * @param {*} obj
 * @returns Array
 */
export function toArray(obj) {
  return Array.isArray(obj)? obj : [obj];
}

/**
 * Compute the intersection of two iterables and return it as a set.
 * @param {Iterable.<*>} arr1
 * @param {Iterable.<*>} arr2
 */
export function intersection(arr1, arr2) {
  arr1 = new Set(arr1);
  arr2 = new Set(arr2);

  return new Set([...arr1].filter(x => arr2.has(x)));
}