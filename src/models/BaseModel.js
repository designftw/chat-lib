/**
 * Base class for all models
 */
export default class BaseModel {
	/**
	 * Constructor for the base model.
	 * @param {object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 */
	constructor({ id, createdAt, updatedAt } = {}) {
		if (new.target === BaseModel) {
			throw new Error("BaseModel is an abstract class and cannot be instantiated directly.");
		}

		/**
		 * The id of the model.
		 *
		 * Unique across all models of the same type.
		 * @type {string}
		 */
		this.id = id;

		/**
		 * The date that the model was created.
		 * @type {Date}
		 */
		this.createdAt = new Date(createdAt);

		/**
		 * The date that the model was last updated.
		 * @type {Date}
		 */
		this.updatedAt = new Date(updatedAt);
	}
}
