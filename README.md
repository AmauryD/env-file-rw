# env-file-rw
Edit and read from .env files

# Features

- Read key from .env file
- Write key/value to .env file
- Preserve comments
- Typescript

# Sync example
```js
const EnvFileWriter = require("env-file-rw");
const envFileWriter = new EnvFileWriter("test.env");

envFileWriter.get("HELLO","NOT WORLD");// NOT WORLD BY DEFAULT

envFileWriter.set("HELLO","WORLD");

// note : unsaved changes are not readable with .get()

// persists the changes
envFileWriter.saveSync();
```

# Async example
```js
const EnvFileWriter = require("env-file-rw");
const envFileWriter = new EnvFileWriter("test.env",false); // false prevents direct sync parsing

// open the file and parse it
await envFileWriter.parse();

envFileWriter.get("HELLO","NOT WORLD");// NOT WORLD BY DEFAULT

envFileWriter.set("HELLO","WORLD");

// note : unsaved changes are not readable with .get()

// persists the changes
await envFileWriter.save();
```

# Typescript example
```ts
import EnvFileWriter from "env-file-rw";
const envFileWriter = new EnvFileWriter< { HELLO : any} >("test.env",false); // you can specify the structure of the env file for the get()

// open the file and parse it
await envFileWriter.parse();

envFileWriter.get("HELLO","NOT WORLD");// NOT WORLD BY DEFAULT

envFileWriter.set("HELLO","WORLD");

// note : unsaved changes are not readable with .get()

// persists the changes
await envFileWriter.save();
```