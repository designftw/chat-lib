import BaseModel from "./BaseModel.js";

/**
 * Represents private data attached to an entity in the database.
 */
export default class PrivateData extends BaseModel {
	/**
	 * ```js
	 * import PrivateData from "https://designftw.github.io/chat-lib/src/models/PrivateData.js";
	 * ```
	 *
	 * PrivatePayload model constructor.
	 *
	 * @param {Object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {string} options.entityId see [PrivatePayload's entityId property]{@link PrivateData#entityId}
	 * @param {Object} options.data see [PrivatePayload's data property]{@link PrivateData#data}
	 */
	constructor(options) {
		if (options instanceof PrivateData) {
			return options;
		}
		const { id, createdAt, updatedAt, entityId, data } = options;
		super({ id, createdAt, updatedAt });

		/**
		 * The id of the object this data is attached to.
		 * @type {string}
		 */
		this.entityId = entityId;

		/**
		 * The data associated with the private data.
		 * @type {Object}
		 */
		this.data = typeof(data) === "string" ? JSON.parse(data) : data;
	}

	/**
	 * Convert this entity to a JSON object that could be fed to its constructor to create another object with the same data
	 * @returns {Object}
	 */
	 toJSON() {
		return {
			...super.toJSON(),
			entityId: this.entityId,
			data: this.data
		}
	}
}
