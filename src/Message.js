import Alias from "./Alias.js";
import BaseModel from "./BaseModel.js";

/**
 * Represents a Message
 */
export default class Message extends BaseModel {
	/**
	 * Message model constructor.
	 *
	 * @param {Object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {Alias} options.sender see [Message's sender property]{@link Message#sender}
	 * @param {Alias[]} options.recipients see [Message's recipients property]{@link Message#recipients}
	 * @param {string} options.payload see [Message's payload property]{@link Message#payload}
	 */
	constructor(options = {}) {
		if (options instanceof Message) {
			return options;
		}
		const { id, createdAt, updatedAt, sender, recipients, payload } = options;
		super(id, createdAt, updatedAt);

		/**
		 * The id of the Alias which sent the message. See [Alias's id Property]{@link Alias#id}
		 * @type {Alias}
		 */
		this.sender = new Alias(sender);

		/**
		 * The ids of the Aliases which received the message. See [Alias's id Property]{@link Alias#id}
		 * @type {Alias[]}
		 */
		this.recipients = recipients.map((recipient) => new Alias(recipient));

		/**
		 * The data associated with the message.
		 *
		 * This could be just message text but could also be arbitrary JSON.
		 * @type {string}
		 */
		this.payload = payload;
	}
}
