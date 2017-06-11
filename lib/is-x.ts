'use strict';
import {Stream} from "stream";

export function isStream(stream: any): boolean {
    return isBasic(stream) && (isWritable(stream) || IsReadable(stream));
}

function isBasic(stream: Stream) : boolean {
    return stream !== null && typeof stream === 'object' && typeof stream.pipe === 'function';
}

function isWritable(stream: any) : boolean {
    return isBasic(stream) && stream.writable !== false && typeof stream._write === 'function' &&
        typeof stream._writableState === 'object';
}

function IsReadable(stream: any) : boolean {
    return isBasic(stream) && stream.readable !== false && typeof stream._read === 'function' &&
        typeof stream._readableState === 'object';
}

function isDuplex(stream: Stream) : boolean {
    return isWritable(stream) && IsReadable(stream);
}

function isTransform(stream: any) : boolean {
    return isDuplex(stream) && typeof stream._transform === 'function' &&
        typeof stream._transformState === 'object';
}

/////////////

export function isObservable(val: any) {
    return (val && typeof val.subscribe === 'function'
    && val.constructor && (/Observable/.test(val.constructor.name) || /Subject/.test(val.constructor.name)));
}

////////////////////////////

export function isSubscriber(val: any) {

    return (val && typeof val.subscribe !== 'function' && typeof val.usubscribe !== 'function'
    && typeof val._next === 'function' && typeof val._error === 'function' && typeof val._complete === 'function');

}

