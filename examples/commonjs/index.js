/* eslint-disable no-undef */
const path = require('path');
const EnvFileWriter = require("env-file-rw").default;

const env = new EnvFileWriter(".env",true);

console.log(env.get("BLAH"));