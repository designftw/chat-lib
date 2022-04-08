/**
	 * ```js
	 * // ⚠️ you probably do not need to import this directly it is an abstract base class implicity
	 * // used by other models
	 * import BaseModel from "https://designftw.github.io/chat-lib/src/models/BaseModel.js";
	 * ```
	 *
 * Base class for all models
 */
export default class BaseModel {

	/**
	 * Constructor for the base model.
	 *
	 * @param {object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 */
	constructor({ id, createdAt, updatedAt }) {
		if (new.target === BaseModel) {
			throw new Error("BaseModel is an abstract class and cannot be instantiated directly.");
		}

		/**
		 * The id of the model.
		 *
		 * Unique across all models of the same type.
		 * For example, the id of a [Message]{@link Message} is unique across all messages.
		 * The id of an [Identity]{@link Identity} is unique across all identities.
		 * However the id of a [Message]{@link Message} may coincidentally be the
		 * same as the id of an [Identity]{@link Identity}.
		 *
		 * @type {string}
		 */
		this.id = id;

		/**
		 * The date that the model was created.
		 * Handled by the server and does not need to be set by the client.
		 *
		 * *Practical Examples*
		 *
		 * Sort messages in ascending order by their createdAt date:
		 *
		 * ```js
		 * messages.sort((a, b) => a.createdAt - b.createdAt);
		 * ```
		 * @type {Date}
		 */
		this.createdAt = new Date(createdAt);

		/**
		 * The date that the model was last updated.
		 * Handled by the server and does not need to be set by the client.
		 *
		 * *Practical Examples*
		 *
		 * Sort messages in ascending order by when they were last edited:
		 *
		 * ```js
		 * messages.sort((a, b) => a.createdAt - b.createdAt);
		 * ```
		 * @type {Date}
		 */
		this.updatedAt = new Date(updatedAt);
	}
}
