/* eslint camelcase: "off" */
import { addOptOutCheckGreenfinchPeople } from './gdpr-utils';
import {
    SET_ACTION,
    SET_ONCE_ACTION,
    UNSET_ACTION,
    ADD_ACTION,
    APPEND_ACTION,
    REMOVE_ACTION,
    UNION_ACTION,
    apiActions
} from './api-actions';
import { _, console } from './utils';

/**
 * Greenfinch People Object
 * @constructor
 */
var GreenfinchPeople = function() {};

_.extend(GreenfinchPeople.prototype, apiActions);

GreenfinchPeople.prototype._init = function(greenfinch_instance) {
    this._greenfinch = greenfinch_instance;
};

/*
* Set properties on a user record.
*
* ### Usage:
*
*     greenfinch.people.set('gender', 'm');
*
*     // or set multiple properties at once
*     greenfinch.people.set({
*         'Company': 'Acme',
*         'Plan': 'Premium',
*         'Upgrade date': new Date()
*     });
*     // properties can be strings, integers, dates, or lists
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [to] A value to set on the given property name
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.set = addOptOutCheckGreenfinchPeople(function(prop, to, callback) {
    var data = this.set_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    // make sure that the referrer info has been updated and saved
    if (this._get_config('save_referrer')) {
        this._greenfinch['persistence'].update_referrer_info(document.referrer);
    }

    // update $set object with default people properties
    data[SET_ACTION] = _.extend(
        {},
        _.info.people_properties(),
        this._greenfinch['persistence'].get_referrer_info(),
        data[SET_ACTION]
    );
    return this._send_request(data, callback);
});

/*
* Set properties on a user record, only if they do not yet exist.
* This will not overwrite previous people property values, unlike
* people.set().
*
* ### Usage:
*
*     greenfinch.people.set_once('First Login Date', new Date());
*
*     // or set multiple properties at once
*     greenfinch.people.set_once({
*         'First Login Date': new Date(),
*         'Starting Plan': 'Premium'
*     });
*
*     // properties can be strings, integers or dates
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [to] A value to set on the given property name
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.set_once = addOptOutCheckGreenfinchPeople(function(prop, to, callback) {
    var data = this.set_once_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    return this._send_request(data, callback);
});

/*
* Unset properties on a user record (permanently removes the properties and their values from a profile).
*
* ### Usage:
*
*     greenfinch.people.unset('gender');
*
*     // or unset multiple properties at once
*     greenfinch.people.unset(['gender', 'Company']);
*
* @param {Array|String} prop If a string, this is the name of the property. If an array, this is a list of property names.
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.unset = addOptOutCheckGreenfinchPeople(function(prop, callback) {
    var data = this.unset_action(prop);
    return this._send_request(data, callback);
});

/*
* Increment/decrement numeric people analytics properties.
*
* ### Usage:
*
*     greenfinch.people.increment('page_views', 1);
*
*     // or, for convenience, if you're just incrementing a counter by
*     // 1, you can simply do
*     greenfinch.people.increment('page_views');
*
*     // to decrement a counter, pass a negative number
*     greenfinch.people.increment('credits_left', -1);
*
*     // like greenfinch.people.set(), you can increment multiple
*     // properties at once:
*     greenfinch.people.increment({
*         counter1: 1,
*         counter2: 6
*     });
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and numeric values.
* @param {Number} [by] An amount to increment the given property
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.increment = addOptOutCheckGreenfinchPeople(function(prop, by, callback) {
    var data = {};
    var $add = {};
    if (_.isObject(prop)) {
        _.each(prop, function(v, k) {
            if (!this._is_reserved_property(k)) {
                if (isNaN(parseFloat(v))) {
                    console.error('Invalid increment value passed to greenfinch.people.increment - must be a number');
                    return;
                } else {
                    $add[k] = v;
                }
            }
        }, this);
        callback = by;
    } else {
        // convenience: greenfinch.people.increment('property'); will
        // increment 'property' by 1
        if (_.isUndefined(by)) {
            by = 1;
        }
        $add[prop] = by;
    }
    data[ADD_ACTION] = $add;

    return this._send_request(data, callback);
});

/*
* Append a value to a list-valued people analytics property.
*
* ### Usage:
*
*     // append a value to a list, creating it if needed
*     greenfinch.people.append('pages_visited', 'homepage');
*
*     // like greenfinch.people.set(), you can append multiple
*     // properties at once:
*     greenfinch.people.append({
*         list1: 'bob',
*         list2: 123
*     });
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] value An item to append to the list
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.append = addOptOutCheckGreenfinchPeople(function(list_name, value, callback) {
    if (_.isObject(list_name)) {
        callback = value;
    }
    var data = this.append_action(list_name, value);
    return this._send_request(data, callback);
});

/*
* Remove a value from a list-valued people analytics property.
*
* ### Usage:
*
*     greenfinch.people.remove('School', 'UCB');
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] value Item to remove from the list
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.remove = addOptOutCheckGreenfinchPeople(function(list_name, value, callback) {
    if (_.isObject(list_name)) {
        callback = value;
    }
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
});

/*
* Merge a given list with a list-valued people analytics property,
* excluding duplicate values.
*
* ### Usage:
*
*     // merge a value to a list, creating it if needed
*     greenfinch.people.union('pages_visited', 'homepage');
*
*     // like greenfinch.people.set(), you can append multiple
*     // properties at once:
*     greenfinch.people.union({
*         list1: 'bob',
*         list2: 123
*     });
*
*     // like greenfinch.people.append(), you can append multiple
*     // values to the same list:
*     greenfinch.people.union({
*         list1: ['bob', 'billy']
*     });
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] Value / values to merge with the given property
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.union = addOptOutCheckGreenfinchPeople(function(list_name, values, callback) {
    if (_.isObject(list_name)) {
        callback = values;
    }
    var data = this.union_action(list_name, values);
    return this._send_request(data, callback);
});

/*
* Record that you have charged the current user a certain amount
* of money. Charges recorded with track_charge() will appear in the
* Greenfinch revenue report.
*
* ### Usage:
*
*     // charge a user $50
*     greenfinch.people.track_charge(50);
*
*     // charge a user $30.50 on the 2nd of january
*     greenfinch.people.track_charge(30.50, {
*         '$time': new Date('jan 1 2012')
*     });
*
* @param {Number} amount The amount of money charged to the current user
* @param {Object} [properties] An associative array of properties associated with the charge
* @param {Function} [callback] If provided, the callback will be called when the server responds
*/
GreenfinchPeople.prototype.track_charge = addOptOutCheckGreenfinchPeople(function(amount, properties, callback) {
    if (!_.isNumber(amount)) {
        amount = parseFloat(amount);
        if (isNaN(amount)) {
            console.error('Invalid value passed to greenfinch.people.track_charge - must be a number');
            return;
        }
    }

    return this.append('$transactions', _.extend({
        '$amount': amount
    }, properties), callback);
});

/*
* Permanently clear all revenue report transactions from the
* current user's people analytics profile.
*
* ### Usage:
*
*     greenfinch.people.clear_charges();
*
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
GreenfinchPeople.prototype.clear_charges = function(callback) {
    return this.set('$transactions', [], callback);
};

/*
* Permanently deletes the current people analytics profile from
* Greenfinch (using the current distinct_id).
*
* ### Usage:
*
*     // remove the all data you have stored about the current user
*     greenfinch.people.delete_user();
*
*/
GreenfinchPeople.prototype.delete_user = function() {
    if (!this._identify_called()) {
        console.error('greenfinch.people.delete_user() requires you to call identify() first');
        return;
    }
    var data = {'$delete': this._greenfinch.get_distinct_id()};
    return this._send_request(data);
};

GreenfinchPeople.prototype.toString = function() {
    return this._greenfinch.toString() + '.people';
};

GreenfinchPeople.prototype._send_request = function(data, callback) {
    data['$token'] = this._get_config('token');
    data['$distinct_id'] = this._greenfinch.get_distinct_id();
    var device_id = this._greenfinch.get_property('$device_id');
    var user_id = this._greenfinch.get_property('$user_id');
    var had_persisted_distinct_id = this._greenfinch.get_property('$had_persisted_distinct_id');
    if (device_id) {
        data['$device_id'] = device_id;
    }
    if (user_id) {
        data['$user_id'] = user_id;
    }
    if (had_persisted_distinct_id) {
        data['$had_persisted_distinct_id'] = had_persisted_distinct_id;
    }

    var date_encoded_data = _.encodeDates(data);
    var truncated_data = _.truncate(date_encoded_data, 255);

    if (!this._identify_called()) {
        this._enqueue(data);
        if (!_.isUndefined(callback)) {
            if (this._get_config('verbose')) {
                callback({status: -1, error: null});
            } else {
                callback(-1);
            }
        }
        return truncated_data;
    }

    return this._greenfinch._track_or_batch({
        truncated_data: truncated_data,
        endpoint: this._get_config('api_host') + '/engage/',
        batcher: this._greenfinch.request_batchers.people
    }, callback);
};

GreenfinchPeople.prototype._get_config = function(conf_var) {
    return this._greenfinch.get_config(conf_var);
};

GreenfinchPeople.prototype._identify_called = function() {
    return this._greenfinch._flags.identify_called === true;
};

// Queue up engage operations if identify hasn't been called yet.
GreenfinchPeople.prototype._enqueue = function(data) {
    if (SET_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(SET_ACTION, data);
    } else if (SET_ONCE_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(SET_ONCE_ACTION, data);
    } else if (UNSET_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(UNSET_ACTION, data);
    } else if (ADD_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(ADD_ACTION, data);
    } else if (APPEND_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(APPEND_ACTION, data);
    } else if (REMOVE_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(REMOVE_ACTION, data);
    } else if (UNION_ACTION in data) {
        this._greenfinch['persistence']._add_to_people_queue(UNION_ACTION, data);
    } else {
        console.error('Invalid call to _enqueue():', data);
    }
};

GreenfinchPeople.prototype._flush_one_queue = function(action, action_method, callback, queue_to_params_fn) {
    var _this = this;
    var queued_data = _.extend({}, this._greenfinch['persistence']._get_queue(action));
    var action_params = queued_data;

    if (!_.isUndefined(queued_data) && _.isObject(queued_data) && !_.isEmptyObject(queued_data)) {
        _this._greenfinch['persistence']._pop_from_people_queue(action, queued_data);
        if (queue_to_params_fn) {
            action_params = queue_to_params_fn(queued_data);
        }
        action_method.call(_this, action_params, function(response, data) {
            // on bad response, we want to add it back to the queue
            if (response === 0) {
                _this._greenfinch['persistence']._add_to_people_queue(action, queued_data);
            }
            if (!_.isUndefined(callback)) {
                callback(response, data);
            }
        });
    }
};

// Flush queued engage operations - order does not matter,
// and there are network level race conditions anyway
GreenfinchPeople.prototype._flush = function(
    _set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback
) {
    var _this = this;
    var $append_queue = this._greenfinch['persistence']._get_queue(APPEND_ACTION);
    var $remove_queue = this._greenfinch['persistence']._get_queue(REMOVE_ACTION);

    this._flush_one_queue(SET_ACTION, this.set, _set_callback);
    this._flush_one_queue(SET_ONCE_ACTION, this.set_once, _set_once_callback);
    this._flush_one_queue(UNSET_ACTION, this.unset, _unset_callback, function(queue) { return _.keys(queue); });
    this._flush_one_queue(ADD_ACTION, this.increment, _add_callback);
    this._flush_one_queue(UNION_ACTION, this.union, _union_callback);

    // we have to fire off each $append individually since there is
    // no concat method server side
    if (!_.isUndefined($append_queue) && _.isArray($append_queue) && $append_queue.length) {
        var $append_item;
        var append_callback = function(response, data) {
            if (response === 0) {
                _this._greenfinch['persistence']._add_to_people_queue(APPEND_ACTION, $append_item);
            }
            if (!_.isUndefined(_append_callback)) {
                _append_callback(response, data);
            }
        };
        for (var i = $append_queue.length - 1; i >= 0; i--) {
            $append_item = $append_queue.pop();
            if (!_.isEmptyObject($append_item)) {
                _this.append($append_item, append_callback);
            }
        }
        // Save the shortened append queue
        _this._greenfinch['persistence'].save();
    }

    // same for $remove
    if (!_.isUndefined($remove_queue) && _.isArray($remove_queue) && $remove_queue.length) {
        var $remove_item;
        var remove_callback = function(response, data) {
            if (response === 0) {
                _this._greenfinch['persistence']._add_to_people_queue(REMOVE_ACTION, $remove_item);
            }
            if (!_.isUndefined(_remove_callback)) {
                _remove_callback(response, data);
            }
        };
        for (var j = $remove_queue.length - 1; j >= 0; j--) {
            $remove_item = $remove_queue.pop();
            if (!_.isEmptyObject($remove_item)) {
                _this.remove($remove_item, remove_callback);
            }
        }
        _this._greenfinch['persistence'].save();
    }
};

GreenfinchPeople.prototype._is_reserved_property = function(prop) {
    return prop === '$distinct_id' || prop === '$token' || prop === '$device_id' || prop === '$user_id' || prop === '$had_persisted_distinct_id';
};

// GreenfinchPeople Exports
GreenfinchPeople.prototype['set']           = GreenfinchPeople.prototype.set;
GreenfinchPeople.prototype['set_once']      = GreenfinchPeople.prototype.set_once;
GreenfinchPeople.prototype['unset']         = GreenfinchPeople.prototype.unset;
GreenfinchPeople.prototype['increment']     = GreenfinchPeople.prototype.increment;
GreenfinchPeople.prototype['append']        = GreenfinchPeople.prototype.append;
GreenfinchPeople.prototype['remove']        = GreenfinchPeople.prototype.remove;
GreenfinchPeople.prototype['union']         = GreenfinchPeople.prototype.union;
GreenfinchPeople.prototype['track_charge']  = GreenfinchPeople.prototype.track_charge;
GreenfinchPeople.prototype['clear_charges'] = GreenfinchPeople.prototype.clear_charges;
GreenfinchPeople.prototype['delete_user']   = GreenfinchPeople.prototype.delete_user;
GreenfinchPeople.prototype['toString']      = GreenfinchPeople.prototype.toString;

export { GreenfinchPeople };
