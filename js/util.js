import { Alias, Account, Message, PrivatePayload } from "./models.js";

/**
 * Options for creating the request init
 * @typedef {Object} CreateDefaultRequestInitOptions
 * @property {"POST" | "PUT" | "GET" | "DELETE"} method The HTTP method. One of POST, PUT, GET, DELETE.
 * @property {Object.<string, string> | undefined} [headers] an optional object containing key values encoded in the headers of the request. The object should have string keys and string values.
 * @property {Object.<string, any> | undefined} [body] an optional object containing key values encoded in the body of the request. The object should have string keys and string values.
 */

/**
 *
 * @param {CreateDefaultRequestInitOptions} options Options used to created the request
 * @returns {RequestInit} a request init for passing into fetch.
 */
export function createDefaultRequestInit(options) {
  return {
    method: options.method,
    headers: createJSONEncodedHeaders(options.headers),
    body: options.body ? createJSONEncodedBody(options.body) : null,
    redirect: "follow",
    credentials: "include",
  };
}

/**
 * Create Headers from an object.
 * @param {Object.<string, string> | undefined} headers an object containing key values encoded in the headers.
 */
function createHeadersFromObject(headers = undefined) {
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
function createJSONEncodedHeaders(headers = undefined) {
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

/**
 * Create an account account from parsed json of an account returned from the ChatServer.
 * @param {any} accountDTO parsed json account returned from the ChatServer
 * @returns {Account} an alias model
 */
export function createAccountFromAccountDTO(accountDTO) {
  return new Account(
    accountDTO.id,
    new Date(accountDTO.createdAt),
    new Date(accountDTO.updatedAt),
    accountDTO.email
  );
}

/**
 * Create an alias model from parsed json of an alias returned from the ChatServer.
 * @param {any} aliasDTO parsed json alias returned from the ChatServer
 * @returns {Alias} an alias model
 */
export function createAliasFromAliasDTO(aliasDTO) {
  return new Alias(
    aliasDTO.id,
    aliasDTO.createdAt,
    aliasDTO.updatedAt,
    aliasDTO.name,
    aliasDTO.payload
  );
}

/**
 * Create a message model from parsed json of a message returned from the ChatServer.
 * @param {any} messageDTO parsed json message returned from the ChatServer.
 * @returns {Message} a message model
 */
export function createMessageFromMessageDTO(messageDTO) {
  return new Message(
    messageDTO.id,
    new Date(messageDTO.createdAt),
    new Date(messageDTO.updatedAt),
    createAliasFromAliasDTO(messageDTO.sender),
    messageDTO.recipients.map(createAliasFromAliasDTO),
    messageDTO.payload
  );
}

/**
 * Create a privatePayload model from parsed json of a privatePayload returned from the ChatServer.
 * @param {any} privatePayloadDTO parsed json privatePayload returned from the ChatServer.
 * @returns {PrivatePayload} a privatePayload model.
 */
export function createPrivatePayloadFromPayloadDTO(privatePayloadDTO) {
  return new PrivatePayload(
    privatePayloadDTO.id,
    new Date(privatePayloadDTO.createdAt),
    new Date(privatePayloadDTO.updatedAt),
    privatePayloadDTO.entityId,
    privatePayloadDTO.payload
  );
}
