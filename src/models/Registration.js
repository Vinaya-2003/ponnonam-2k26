/**
 * models/Registration.js — Registration data model with MongoDB
 */

'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { sanitise } = require('../utils/validators');

// MongoDB Registration Schema
const registrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    participationCategory: {
      type: String,
      required: true,
    },
    culturalProgram: {
      type: String,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    sadhya: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Create compound index for duplicate detection
registrationSchema.index({ email: 1, culturalProgram: 1 }, { unique: true });

const RegistrationModel = mongoose.model('Registration', registrationSchema);

class Registration {
  /**
   * Create a new registration entry.
   * @param {object} data - Registration data from request body
   * @returns {Promise<object>} The created entry
   */
  async create(data) {
    const entry = {
      fullName: sanitise(data.fullName),
      email: sanitise(data.email).toLowerCase(),
      company: sanitise(data.company),
      department: sanitise(data.department),
      participationCategory: sanitise(data.participationCategory),
      culturalProgram: sanitise(data.culturalProgram),
      phone: sanitise(data.phone),
      sadhya: sanitise(data.sadhya),
    };
    return new RegistrationModel(entry);
  }

  /**
   * Find a registration by MongoDB ID.
   * @param {string} id - MongoDB ObjectId
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    try {
      return await RegistrationModel.findById(id).lean();
    } catch (err) {
      logger.error('DB', `findById error: ${err.message}`);
      return null;
    }
  }

  /**
   * Find a registration by email and cultural program (duplicate check).
   * @param {string} email - Email address
   * @param {string} event - Cultural program name
   * @returns {Promise<object|null>}
   */
  async findDuplicate(email, event) {
    try {
      return await RegistrationModel.findOne({
        email: email.toLowerCase(),
        culturalProgram: event,
      }).lean();
    } catch (err) {
      logger.error('DB', `findDuplicate error: ${err.message}`);
      return null;
    }
  }

  /**
   * Add (save) a registration to database.
   * @param {object} entry - Registration entry (with create() method result)
   * @returns {Promise<object>}
   */
  async add(entry) {
    try {
      const saved = await entry.save();
      return saved.toObject();
    } catch (err) {
      logger.error('DB', `add error: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get all registrations.
   * @returns {Promise<Array<object>>}
   */
  async readAll() {
    try {
      return await RegistrationModel.find({}).lean();
    } catch (err) {
      logger.error('DB', `readAll error: ${err.message}`);
      return [];
    }
  }

  /**
   * Remove a registration by ID.
   * @param {string} id - MongoDB ObjectId
   * @returns {Promise<object|null>}
   */
  async removeById(id) {
    try {
      return await RegistrationModel.findByIdAndDelete(id).lean();
    } catch (err) {
      logger.error('DB', `removeById error: ${err.message}`);
      return null;
    }
  }

  /**
   * Get registrations with optional filters.
   * @param {object} filters - Optional filters { company, category, event, sadhya }
   * @returns {Promise<Array<object>>}
   */
  async getFiltered(filters = {}) {
    try {
      const query = {};

      if (filters.company) {
        query.company = filters.company;
      }
      if (filters.category) {
        query.participationCategory = filters.category;
      }
      if (filters.event) {
        query.culturalProgram = filters.event;
      }
      if (filters.sadhya) {
        query.sadhya = filters.sadhya;
      }

      return await RegistrationModel.find(query).lean();
    } catch (err) {
      logger.error('DB', `getFiltered error: ${err.message}`);
      return [];
    }
  }

  /**
   * Get summary statistics.
   * @returns {Promise<object>}
   */
  async getStats() {
    try {
      const all = await RegistrationModel.find({}).lean();

      const byCompany = {};
      const byEvent = {};
      const byCategory = {};
      const bySadhya = {};

      all.forEach((r) => {
        byCompany[r.company] = (byCompany[r.company] || 0) + 1;
        byEvent[r.culturalProgram] = (byEvent[r.culturalProgram] || 0) + 1;
        byCategory[r.participationCategory] =
          (byCategory[r.participationCategory] || 0) + 1;
        bySadhya[r.sadhya] = (bySadhya[r.sadhya] || 0) + 1;
      });

      return {
        total: all.length,
        byCompany,
        byParticipationCategory: byCategory,
        byEvent,
        bySadhya,
        lastRegisteredAt: all.length ? all[all.length - 1].timestamp : null,
      };
    } catch (err) {
      logger.error('DB', `getStats error: ${err.message}`);
      return {
        total: 0,
        byCompany: {},
        byParticipationCategory: {},
        byEvent: {},
        bySadhya: {},
        lastRegisteredAt: null,
      };
    }
  }
}

module.exports = new Registration();
