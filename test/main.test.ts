import assert from 'assert';
import envFileWriter from '../src/index';
import fs from 'fs';
import dotenv from 'dotenv';

describe('env file writer tests', function() {
    const testFilePath = './test/test.env';

    beforeEach("create env file",function(done) {
        fs.writeFileSync(testFilePath,'hello = 1\nmessage = "hello"\n#Comment!\nEmptyKey=\n ');
        done();
    });      
    
    it('Open file sync', function () {
        const fileWriter = new envFileWriter(testFilePath,false);
        assert.doesNotThrow(async () => await fileWriter.parse());
    });
    it('Open file async', async function () {
        const fileWriter = new envFileWriter(testFilePath,false);
        assert.doesNotThrow(() => fileWriter.parseSync());
    });
    
    describe('Write tests', function() {
        it('write existing value', function () {
            const fileWriter = new envFileWriter<{ a : number}>(testFilePath);
            fileWriter.set("hello", "2");
            fileWriter.saveSync();
            const content = dotenv.parse(fs.readFileSync(testFilePath, 'utf-8'));
            assert.strictEqual(content.hello, "2");
        });
        it('write unexisting value should create value', function () {
            const fileWriter = new envFileWriter(testFilePath);
            fileWriter.set("unexists", "unexists");
            fileWriter.saveSync();
            const content = dotenv.parse(fs.readFileSync(testFilePath, 'utf-8'));
            assert.strictEqual(content.unexists, "unexists");
        });
        it('Save should preserve comments', async function () {
            const fileWriter = new envFileWriter(testFilePath);
            fileWriter.set("nmessage", "2");
            await fileWriter.save();
            
            const fileContent = fs.readFileSync(testFilePath,"utf-8");
            assert.ok(fileContent.includes("#Comment!"));
        });
        it('SaveSync should preserve comments', function () {
            const fileWriter = new envFileWriter(testFilePath);
            fileWriter.set("nmessage", "2");
            fileWriter.saveSync();
            
            const fileContent = fs.readFileSync(testFilePath,"utf-8");
            assert.ok(fileContent.includes("#Comment!"));
        });
    });

    describe('Read tests', function() {
        it('read value on root', function () {
            const fileWriter = new envFileWriter(testFilePath);
            const val = fileWriter.get("hello");
            assert.strictEqual(val, "1");
        });

        it('check if value exists', function () {
            const fileWriter = new envFileWriter(testFilePath);
            const val = fileWriter.exists("hello");
            assert.ok(val);
        });

        it('check if value doest not exists', function () {
            const fileWriter = new envFileWriter(testFilePath);
            const val = fileWriter.exists("zfezffzefzefze");
            assert.ok(!val);
        });

        it('should return default value if not found', function () {
            const fileWriter = new envFileWriter(testFilePath);
            const val = fileWriter.get("notExists","default");
            assert.strictEqual(val, "default");
        });
    });

    afterEach(function(done) {
        fs.unlinkSync(testFilePath);
        done();
    });
});
