import BaseModel from "./BaseModel.js";

/**
 * Represents a Message
 */
export default class Message extends BaseModel {
	/**
	 * Message model constructor.
	 *
	 * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {Alias} sender see [Message's sender property]{@link Message#sender}
	 * @param {Alias[]} recipients see [Message's recipients property]{@link Message#recipients}
	 * @param {string} payload see [Message's payload property]{@link Message#payload}
	 */
	constructor(id, createdAt, updatedAt, sender, recipients, payload) {
		super(id, createdAt, updatedAt);
		/**
		 * The id of the Alias which sent the message. See [Alias's id Property]{@link Alias#id}
		 * @type {Alias}
		 */
		this.sender = sender;

		/**
		 * The ids of the Aliases which received the message. See [Alias's id Property]{@link Alias#id}
		 * @type {Alias[]}
		 */
		this.recipients = recipients;

		/**
		 * The data associated with the message.
		 *
		 * This could be just message text but could also be arbitrary JSON.
		 * @type {string}
		 */
		this.payload = payload;
	}
}