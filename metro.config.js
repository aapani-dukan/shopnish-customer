const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase v9/v10 support ke liye mjs extension zaroori hai
config.resolver.sourceExts.push('mjs');

module.exports = config;