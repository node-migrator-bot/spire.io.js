/**
 * @fileOverview Member Resource class definition
 */
var Resource = require('./resource');

/**
 * Represents a member in the spire api.
 *
 * @class Member Resource
 *
 * @constructor
 * @extends Resource
 * @param {object} spire Spire object
 * @param {object} data  Member data from the spire api
 */
function Member(spire, data) {
  /**
   * Reference to spire object.
   */
  this.spire = spire;

  /**
   * Actual data from the spire.io api.
   */
  this.data = data;

  this.resourceName = 'member';
}

Member.prototype = new Resource();

module.exports = Member;

/**
 * Returns the member login.
 *
 * @returns {string} Member login
 */
Member.prototype.login = function () {
  return this.data.login;
};

/**
 * Returns the members profile.
 *
 * @returns {string} Member profile
 */
Member.prototype.profile = function () {
  return this.data.profile;
};
