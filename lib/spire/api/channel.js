/**
 * @fileOverview Channel Resource class definition
 */
var Resource = require('./resource')
  , Message = require('./message')
  , Subscription = require('./subscription')
  ;

/**
 * Represents a channel in the spire api.
 *
 * @class Channel Resource
 *
 * @constructor
 * @extends Resource
 * @param {object} spire Spire object
 * @param {object} data  Channel data from the spire api
 */
function Channel(spire, data) {
  /**
   * Reference to spire object.
   */
  this.spire = spire;

  /**
   * Actual data from the spire.io api.
   */
  this.data = data;

  this.resourceName = 'channel';
}

Channel.prototype = new Resource();

module.exports = Channel;

/**
 * Returns the channel name.
 *
 * @returns {string} Channel name
 */
Channel.prototype.name = function () {
  return this.data.name;
};

/**
 * Publishes a message to the channel.
 *
 * The messages can be a string, or any json'able object.
 *
 * @example
 * spire.channel('myChannel', function (err, channel) {
 *   channel.publish('hello world', function (err, message) {
 *     if (!err) {
 *       // Message has been published.
 *     }
 *   });
 * });
 *
 * @param {string|object} message Message to publish
 * @param {function (err, message)} cb Callback
 */
Channel.prototype.publish = function (message, cb) {
  cb = cb || function (err) { if (err) { throw err; } };
  var spire = this.spire;
  this.request('publish', { content: message }, function (err, messageData) {
    if (err) return cb(err);
    cb(null, new Message(spire, messageData));
  });
};

/**
 * Gets a subscription to a channel, creating it if necessary.
 *
 * @example
 * spire.channel('myChannel', function (err, channel) {
 *   channel.subscription('mySubscription', function (err, subscription) {
 *     if (!err) {
 *       // `subscription` is the new subscription.
 *     }
 *   });
 * });
 *
 * @param {string} subName Subscription name
 * @param {function (err, subscription)} cb Callback
 */
Channel.prototype.subscription = function (subName, cb) {
  if (!cb) {
    cb = subName;
    subName = null;
  }
  var spire = this.spire;
  this.request('create_subscription', subName, function (err, subData) {
    if (err) return cb(err);
    cb(null, new Subscription(spire, subData));
  });
};

/**
 * Gets all named subscriptions to a channel, using cached data if available.
 *
 * @example
 * channel.subscriptions(function (err, subscriptions) {
*   if (!err) {
*     // `subscriptions` is a hash of subscriptions
*   }
 * });
 *
 * @param {function (err, subscriptions)} cb Callback
 */
Channel.prototype.subscriptions = function (cb) {
  if (this._subscriptions) {
    return cb(null, this._subscriptions);
  }
  this.subscriptions$(cb);
};

/**
 * Gets all named subscriptions to a channel, ignoring any cached data.
 *
 * @example
 * channel.subscriptions(function (err, subscriptions) {
*   if (!err) {
*     // `subscriptions` is a hash of subscriptions
*   }
 * });
 *
 * @param {function (err, subscriptions)} cb Callback
 */
Channel.prototype.subscriptions = function (cb) {
  var channel = this;
  this.request('subscriptions', function (err, subscriptions) {
    if (err) return cb(err);
    channel._subscriptions = subscriptions;
    cb(null, subscriptions);
  });
};

/**
 * Requests
 *
 * These define API calls and have no side effects.  They can be run by calling
 *     this.request(<request name>);
 */

/**
 * @name publish
 * @ignore
 * Publishes a message to the channel.
 */
Resource.defineRequest(Channel.prototype, 'publish', function (message) {
  return {
    method: 'post',
    url: this.url(),
    headers: {
      'Authorization': this.authorization('publish'),
      'Accept': this.mediaType('message'),
      'Content-Type': this.mediaType('message')
    },
    content: message
  };
});

/**
 * @name subscriptions
 * @ignore
 * Gets all subscriptions for a channel.
 */
Resource.defineRequest(Channel.prototype, 'subscriptions', function (message) {
  var collection = this.data.resources.subscriptions;
  return {
    method: 'get',
    url: collection.url,
    headers: {
      'Authorization': this.authorization('get_subscriptions', collection),
      'Accept': this.mediaType('subscriptions'),
    }
  };
});

/**
 * @name create_subscription
 * @ignore
 * Create a subscription for the channel.
 */
Resource.defineRequest(Channel.prototype, 'create_subscription', function (name) {
  var collection = this.data.resources.subscriptions;
  return {
    method: 'post',
    url: collection.url,
    headers: {
      'Authorization': this.authorization('create', collection),
      'Accept': this.mediaType('subscription'),
      'Content-Type': this.mediaType('subscription')
    },
    content: {name: name}
  };
});
