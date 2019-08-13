const fs = require('fs');
const dotenv = require('dotenv');
const utils = require('util');
const writeFile = utils.promisify(fs.writeFile);

module.exports = class EnvFileWriter {
    /**
     *
     * @param fileName
     */
    constructor(fileName) {
        this.fileName = fileName;
        try {
            fs.accessSync(fileName,fs.F_OK);
            const content = fs.readFileSync(fileName);
            this.dotenvContent = dotenv.parse(content);
        }catch(err) {
            this.dotenvContent = {};
        }
    }

    /**
     *
     * @param node
     * @return {boolean}
     */
    nodeExists(node) {
        return this.dotenvContent[node] !== undefined;
    }

    /**
     *
     * @param node
     * @param defaultValue
     * @return {undefined|*}
     */
    getNodeValue(node,defaultValue = undefined) {
        if (!this.nodeExists(node) && defaultValue !== undefined)
            return defaultValue;
        return this.dotenvContent[node];
    }

    /**
     *
     * @return {*}
     */
    getFileName() {
        return this.fileName;
    }

    /**
     *
     * @param node
     * @param value
     */
    setNodeValue(node,value) {
        this.dotenvContent[node] = value;
    }

    /**
     *
     * @param data
     */
    write(data) {
        return writeFile(this.fileName,data);
    }

    /**
     *
     * @param data
     */
    writeSync(data) {
        fs.writeFileSync(this.fileName,data);
    }

    /**
     *
     * @param line_separator
     */
    save(line_separator = '\n') {
        let finalContent = '';

        for (let key in this.dotenvContent)
            finalContent += `${key} = ${this.dotenvContent[key]}${line_separator}`;

        return writeFile(this.fileName,finalContent);
    }

    /**
     *
     * @param line_separator
     */
    saveSync(line_separator = '\n') {
        let finalContent = '';

        for (let key in this.dotenvContent)
            finalContent += `${key} = ${this.dotenvContent[key]}${line_separator}`;

        fs.writeFileSync(this.fileName,finalContent);
    }
};