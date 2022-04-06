/**
 * Base class for all models
 */
export default class BaseModel {
	/**
	 * Constructor for the base model.
	 * @param {string} id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 */
	constructor(id, createdAt, updatedAt) {
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
