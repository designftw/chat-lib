import {
	createMessageFromMessageDTO,
	getErrorFromResponse,
	createDefaultRequestInit,
  } from "./util.js";

/**
 * The messages endpoint of the chat server.
 */
export default class MessagesEndpoint {
	/**
	 * AliasesEndpoint constructor.
	 *
	 * @param {ClientStore} store see [Client's store property]{@link Client#store}
	 */
	constructor(store) {
		/**
		 * See [Client's store property]{@link Client#store}
		 * @type {ClientStore}
		 */
		this.store = store;
	}

  /**
   * Get all the messages sent or received by the alias and the passed in interlocutors.
   *
   * If no interlocutors are passed in, returns all the messages sent or received by the alias.
   *
   * If for example the passed in interlocutors contains the id for the alias Sally, and the passed
   * in alias is Jack, then this method returns all messages sent by Jack to Sally, or by Sally to Jack.
   * If there are multiple interlocutors this method returns all messages sent by Jack to any of the
   * interlocutors, or by any of the interlocutors to Jack. Note this does not mean that the message
   * has to be sent to all of the interlocutors to be here. Any pair suffices.
   * @param {string} ownAlias an alias associated with the currently logged in account
   * @param {string[] | undefined} interlocutors An optional list of aliases which are either the sender or receiver of the returned messages..
   * @param {Date | undefined} sinceTime An optional date which filters messages to those which were sent after this time.
   * @returns {Promise<Message[]>} The messages which pass the filters.
   */
  getMessagesForAlias(
	ownAlias,
	interlocutors = undefined,
	sinceTime = undefined
  ) {
	let route = `messages`;
	// create the headers for the message get request
	let headers = {
	  "user-alias-name": ownAlias,
	};

	if (interlocutors !== undefined) {
		headers[interlocutors] = JSON.stringify(interlocutors);
	}

	if (sinceTime !== undefined) {
		headers["since-time"] = sinceTime.getTime();
	}

	return fetch(
	  `${this.store.host}/${route}`,
	  createDefaultRequestInit({ method: "GET", headers })
	)
	  .then(getErrorFromResponse)
	  .then((response) => response.json())
	  .then((messagesDTO) => {
		return messagesDTO.map((messageDTO) =>
		  createMessageFromMessageDTO(messageDTO)
		);
	  });
  }

	/**
	 * Send a new message from ownAlias to recipients. The payload is a potentially jsonified string.
	 * @param {string} ownAlias an alias associated with the currently logged in account.
	 * @param {string[]} recipientNames the recipients of the message
	 * @param {string} messagePayload the payload of the message
	 * @returns {Promise<Message>} The sent message.
	 */
	sendMessage(ownAlias, recipientNames, messagePayload) {
		let route = `messages`;
		let headers = {
		"user-alias-name": ownAlias,
		};
		const body = {
		payload: messagePayload,
		recipients: recipientNames,
		};
		return fetch(
		`${this.store.host}/${route}`,
		createDefaultRequestInit({
			method: "POST",
			body,
			headers,
		})
		)
		.then(getErrorFromResponse)
		.then((response) => response.json())
		.then((responseDTO) => {
			const messageDTO = responseDTO.data;
			return this.getMessage(ownAlias, messageDTO.id);
		});
	}

	/**
	 * Get a single message by it's id.
	 * @param {string} ownAlias the alias associated with the message id, either the sender or recipient.
	 * @param {string} messageId The Message Id. see [Message's id property]{@link Message#id}
	 * @returns {Promise<Message>} The message associated with the passed in id.
	 */
	getMessage(ownAlias, messageId) {
		let route = `messages/${messageId}`;
		// create the headers for the message get request
		let headers = {
			"user-alias-name": ownAlias,
		};
		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({ method: "GET", headers })
		)
			.then(getErrorFromResponse)
			.then((response) => response.json())
			.then((messageDTO) => createMessageFromMessageDTO(messageDTO));
	}

	/**
	 * Update a single message by it's id.
	 * @param {string} ownAlias the alias associated with the message id. Must be the sender of the message.
	 * @param {string} messageId The Message Id. see [Message's id property]{@link Message#id}
	 * @param {string} payload The new payload to be associated with the message. See [Message's payload property]{@link Message#payload}
	 * @returns {Promise<Message>} The updated message
	 */
	updateMessage(ownAlias, messageId, payload) {
		let route = `messages/${messageId}`;

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({
				method: "PUT",
				body: { payload },
				headers: {
					"user-alias-name": ownAlias,
				},
			})
		)
			.then(getErrorFromResponse)
			.then((response) => response.json())
			.then((resultDTO) => {
				const messageDTO = resultDTO.data;
				return this.getMessage(ownAlias, messageDTO.id);
			});
	}

	/**
	 * Delete a single message by its id.
	 * @param {string} ownAlias the alias associated with the message id, either the sender or recipient.
	 * @param {string} messageId The Message Id. see [Message's id property]{@link Message#id}
	 * @returns {Promise<any>} A validation message.
	 */
	deleteMessage(ownAlias, messageId) {
		let route = `messages/${messageId}`;

		return fetch(
			`${this.store.host}/${route}`,
			createDefaultRequestInit({
				method: "DELETE",
				headers: {
					"user-alias-name": ownAlias,
				},
			})
		)
		.then(getErrorFromResponse)
		.then((response) => response.json());
	}
}