const assert = require('assert');
const envFileWriter = require('../index');
const fs = require('fs');
const dotenv = require('dotenv');

describe('env file writer tests', function() {
    const testFilePath = './test/test.env';
    
    describe('Writing tests', function() {
        fs.writeFileSync(testFilePath,'hello = 1\nmessage = "hello"');
        const fileWriter = new envFileWriter(testFilePath);

        it('write value', function () {
            fileWriter.setNodeValue("hello", "2");
            fileWriter.saveSync();
            const content = dotenv.parse(fs.readFileSync(testFilePath, 'utf-8'));
            assert.strictEqual(content.hello, "2");
        });
    });

    describe('Read tests', function() {
        fs.writeFileSync(testFilePath,'hello = 1\nmessage = "hello"');

        const fileWriter = new envFileWriter(testFilePath);

        it('read value on root', function () {
            const val = fileWriter.getNodeValue("hello");
            assert.strictEqual(val, "1");
        });

        it('should return default value if not found', function () {
            const val = fileWriter.getNodeValue("notExists","default");
            assert.strictEqual(val, "default");
        });
    });

    after(function() {
        fs.unlinkSync(testFilePath);
    });
});
