/* eslint camelcase: "off" */
import { addOptOutCheckGreenfinchGroup } from './gdpr-utils';
import { apiActions } from './api-actions';
import { _ } from './utils';

/**
 * Greenfinch Group Object
 * @constructor
 */
var GreenfinchGroup = function() {};

_.extend(GreenfinchGroup.prototype, apiActions);

GreenfinchGroup.prototype._init = function(greenfinch_instance, group_key, group_id) {
    this._greenfinch = greenfinch_instance;
    this._group_key = group_key;
    this._group_id = group_id;
};

/**
 * Set properties on a group.
 *
 * ### Usage:
 *
 *     greenfinch.get_group('company', 'greenfinch').set('Location', '405 Howard');
 *
 *     // or set multiple properties at once
 *     greenfinch.get_group('company', 'greenfinch').set({
 *          'Location': '405 Howard',
 *          'Founded' : 2009,
 *     });
 *     // properties can be strings, integers, dates, or lists
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
GreenfinchGroup.prototype.set = addOptOutCheckGreenfinchGroup(function(prop, to, callback) {
    var data = this.set_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    return this._send_request(data, callback);
});

/**
 * Set properties on a group, only if they do not yet exist.
 * This will not overwrite previous group property values, unlike
 * group.set().
 *
 * ### Usage:
 *
 *     greenfinch.get_group('company', 'greenfinch').set_once('Location', '405 Howard');
 *
 *     // or set multiple properties at once
 *     greenfinch.get_group('company', 'greenfinch').set_once({
 *          'Location': '405 Howard',
 *          'Founded' : 2009,
 *     });
 *     // properties can be strings, integers, lists or dates
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
GreenfinchGroup.prototype.set_once = addOptOutCheckGreenfinchGroup(function(prop, to, callback) {
    var data = this.set_once_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    return this._send_request(data, callback);
});

/**
 * Unset properties on a group permanently.
 *
 * ### Usage:
 *
 *     greenfinch.get_group('company', 'greenfinch').unset('Founded');
 *
 * @param {String} prop The name of the property.
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
GreenfinchGroup.prototype.unset = addOptOutCheckGreenfinchGroup(function(prop, callback) {
    var data = this.unset_action(prop);
    return this._send_request(data, callback);
});

/**
 * Merge a given list with a list-valued group property, excluding duplicate values.
 *
 * ### Usage:
 *
 *     // merge a value to a list, creating it if needed
 *     greenfinch.get_group('company', 'greenfinch').union('Location', ['San Francisco', 'London']);
 *
 * @param {String} list_name Name of the property.
 * @param {Array} values Values to merge with the given property
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
GreenfinchGroup.prototype.union = addOptOutCheckGreenfinchGroup(function(list_name, values, callback) {
    if (_.isObject(list_name)) {
        callback = values;
    }
    var data = this.union_action(list_name, values);
    return this._send_request(data, callback);
});

/**
 * Permanently delete a group.
 *
 * ### Usage:
 *     greenfinch.get_group('company', 'greenfinch').delete();
 */
GreenfinchGroup.prototype['delete'] = addOptOutCheckGreenfinchGroup(function(callback) {
    var data = this.delete_action();
    return this._send_request(data, callback);
});

/**
 * Remove a property from a group. The value will be ignored if doesn't exist.
 *
 * ### Usage:
 *
 *     greenfinch.get_group('company', 'greenfinch').remove('Location', 'London');
 *
 * @param {String} list_name Name of the property.
 * @param {Object} value Value to remove from the given group property
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
GreenfinchGroup.prototype.remove = addOptOutCheckGreenfinchGroup(function(list_name, value, callback) {
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
});

GreenfinchGroup.prototype._send_request = function(data, callback) {
    data['$group_key'] = this._group_key;
    data['$group_id'] = this._group_id;
    data['$token'] = this._get_config('token');

    var date_encoded_data = _.encodeDates(data);
    return this._greenfinch._track_or_batch({
        truncated_data: _.truncate(date_encoded_data, 255),
        endpoint: this._get_config('api_host') + '/groups/',
        batcher: this._greenfinch.request_batchers.groups
    }, callback);
};

GreenfinchGroup.prototype._is_reserved_property = function(prop) {
    return prop === '$group_key' || prop === '$group_id';
};

GreenfinchGroup.prototype._get_config = function(conf) {
    return this._greenfinch.get_config(conf);
};

GreenfinchGroup.prototype.toString = function() {
    return this._greenfinch.toString() + '.group.' + this._group_key + '.' + this._group_id;
};

// GreenfinchGroup Exports
GreenfinchGroup.prototype['remove']   = GreenfinchGroup.prototype.remove;
GreenfinchGroup.prototype['set']      = GreenfinchGroup.prototype.set;
GreenfinchGroup.prototype['set_once'] = GreenfinchGroup.prototype.set_once;
GreenfinchGroup.prototype['union']    = GreenfinchGroup.prototype.union;
GreenfinchGroup.prototype['unset']    = GreenfinchGroup.prototype.unset;
GreenfinchGroup.prototype['toString'] = GreenfinchGroup.prototype.toString;

export {GreenfinchGroup};
