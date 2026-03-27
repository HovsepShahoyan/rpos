const { EventEmitter } = require('events');
const ee = new EventEmitter();

// debug: confirm module load
console.log('[rtspEvents] module loaded, emitter id =', ee);

module.exports = ee;