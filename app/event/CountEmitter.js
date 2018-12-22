'use strict';

const EventEmitter = require('events');

class CountEmitter extends EventEmitter{}

const SingleCountEmitter = new CountEmitter();
export default SingleCountEmitter;
