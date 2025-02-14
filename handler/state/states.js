const stateManagerDualLiqPool = require("../liq_pool/dual/stateManagerDualLiqPool");

const stateHandlers = [
  { range: [40, 43], handler: stateManagerDualLiqPool },
];

module.exports = stateHandlers;