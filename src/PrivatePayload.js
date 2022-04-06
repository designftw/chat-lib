import BaseModel from "./BaseModel.js";

/**
 * Represents a private payload attached to an entity in the database.
 */
export default class PrivatePayload extends BaseModel {
	/**
	 * PrivatePayload model constructor.
	 *
	 * @param {Object} options
	 * @param {string} options.id see [BaseModel's id property]{@link BaseModel#id}
	 * @param {Date} options.createdAt see [BaseModel's createdAt property]{@link BaseModel#createdAt}
	 * @param {Date} options.updatedAt see [BaseModel's updatedAt property]{@link BaseModel#updatedAt}
	 * @param {string} options.entityId see [PrivatePayload's entityId property]{@link PrivatePayload#entityId}
	 * @param {string} options.payload see [PrivatePayload's payload property]{@link PrivatePayload#payload}
	 */
	constructor(options = {}) {
		if (options instanceof PrivatePayload) {
			return options;
		}
		const { id, createdAt, updatedAt, entityId, payload } = options;
    super({ id, createdAt, updatedAt });

		/**
		 * The id of the object this payload is attached to.
		 * @type {string}
		 */
		this.entityId = entityId;

		/**
		 * The data associated with the private payload.
		 * @type {string}
		 */
		this.payload = payload;
	}
}
