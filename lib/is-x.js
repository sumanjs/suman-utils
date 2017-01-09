'use strict';


function isStream(stream) {
    return basic(stream) && (isStream.writable(stream) || isStream.readable(stream));
}

function basic(stream) {
    return stream !== null && typeof stream === 'object' && typeof stream.pipe === 'function';
}

isStream.writable = function (stream) {
    return basic(stream) && stream.writable !== false && typeof stream._write === 'function' && typeof stream._writableState === 'object';
};

isStream.readable = function (stream) {
    return basic(stream) && stream.readable !== false && typeof stream._read === 'function' && typeof stream._readableState === 'object';
};

isStream.duplex = function (stream) {
    return isStream.writable(stream) && isStream.readable(stream);
};

isStream.transform = function (stream) {
    return isStream.duplex(stream) && typeof stream._transform === 'function' && typeof stream._transformState === 'object';
};

/////////////

function isObservable(val) {

    return (val && typeof val.subscribe === 'function'
    && val.constructor && /Observable/.test(val.constructor.name));

}

////////////////////////////

function isSubscriber(val) {

    return (val && typeof val.subscribe !== 'function' && typeof val.usubscribe !== 'function'
    && typeof val._next === 'function' && typeof val._error === 'function' && typeof val._complete === 'function');

}


module.exports = {
    isObservable: isObservable,
    isSubscriber: isSubscriber,
    isStream: isStream

};
