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
	constructor(options = {}) {
		if (options instanceof BaseModel) {
			return options;
		}

		const { id, createdAt, updatedAt } = options;

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
		this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);

		/**
		 * The date that the model was last updated.
		 * @type {Date}
		 */
		this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
	}
}
