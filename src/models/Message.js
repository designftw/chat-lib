import Identity from "./Identity.js";
import BaseModel from "./BaseModel.js";

/**
 * Represents a Message
 */
export default class Message extends BaseModel {
	/**
	 * ```js
	 * import Message from "https://designftw.github.io/chat-lib/src/models/Message.js";
	 * ```
	 *
	 * Message model constructor.
	 *
	 *
	 * @param {Object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {Identity} options.sender see [Message's sender property]{@link Message#sender}
	 * @param {Identity[]} options.recipients see [Message's recipients property]{@link Message#recipients}
	 * @param {Object} options.data see [Message's data property]{@link Message#data}
	 */
	constructor(options) {
		if (options instanceof Message) {
			return options;
		}

		const { id, createdAt, updatedAt, sender, recipients, data } = options;
		super({ id, createdAt, updatedAt });

		/**
		 * The id of the Alias which sent the message. See [Alias's id Property]{@link Alias#id}
		 * @type {Identity}
		 */
		this.sender = new Identity(sender);

		/**
		 * The ids of the Aliases which received the message. See [Alias's id Property]{@link Alias#id}
		 * @type {Identity[]}
		 */
		this.recipients = recipients.map((recipient) => new Identity(recipient));

		/**
		 * The data associated with the message.
		 *
		 * This could be just message text but could also be arbitrary JSON.
		 * @type {Object}
		 */
		this.data = typeof(data) === "string" ? JSON.parse(data) : data;
	}

	/**
	 * Convert this message to a JSON object that could be fed to its constructor to create another object with the same data
	 * @returns {Object}
	 */
	 toJSON() {
		return {
			...super.toJSON(),
			sender: this.sender.toJSON(),
			recipients: this.recipients.map((recipient) => recipient.toJSON()),
			data: this.data
		}
	}
}
