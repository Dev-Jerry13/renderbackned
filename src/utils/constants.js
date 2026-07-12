"use strict";

const env = require('./env');

function isProduction() {
  return env.NODE_ENV === 'production';
}

function isDevelopment() {
  return env.NODE_ENV === 'development';
}

function isTest() {
  return env.NODE_ENV === 'test';
}

function logInProduction(message) {
  if (isProduction()) {
    return JSON.stringify({\n      timestamp: new Date().toISOString(),\n\n      message,\n    });\n  }\n  return message;\n}

function logInDevelopment(...args) {\n  const message = args.map(a => {\n    if (a instanceof Error) return a.stack;\n    return typeof a === 'object' ? JSON.stringify(a) : String(a);\n  }).join(' ');\n  return `[${message.toUpperCase()}] ${message}`;\n}

module.exports = {\n  isProduction,\n  isDevelopment,\n  isTest,\n  logInProduction,\n  logInDevelopment,\n};