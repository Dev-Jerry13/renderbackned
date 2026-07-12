"use strict";

const env = require('../config/env');

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
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      message,
    });
  }
  return message;
}

function logInDevelopment(...args) {
  const message = args.map(a => {
    if (a instanceof Error) return a.stack;
    return typeof a === 'object' ? JSON.stringify(a) : String(a);
  }).join(' ');
  return `[${message.toUpperCase()}] ${message}`;
}

module.exports = {
  isProduction,
  isDevelopment,
  isTest,
  logInProduction,
  logInDevelopment,
};
