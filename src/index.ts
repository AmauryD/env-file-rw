import {writeFileSync,readFileSync} from "fs";
import { readFile as asyncReadFile, writeFile as asyncWriteFile } from "fs/promises";

enum NodeType {
    VARIABLE,
    COMMENT,
    UNKNOWN
}

interface TreeNode {
    key : string, // the key of the DOTENV like "PORT"
    value : string, // the value of the key like "3306"
    type : NodeType, // the types, see enum NodeType
    line : number |undefined // the line number, can be undefined if a line still not exists
}

interface DotenvFileTree {
    [key: string] : TreeNode
}

const RE_NEWLINES = /\\n/g;
const NEWLINE = '\n';
const NEWLINES_MATCH = /\r\n|\n|\r/;

export default class EnvFileWriter<Structure = never> {
    private tree : DotenvFileTree = {};
    private treePendingChanges : DotenvFileTree = {};
 
    private fileName: string;

    private parseSingleValue(value : string) {
        const end = value.length - 1;
        const isDoubleQuoted = value[0] === '"' && value[end] === '"';
        const isSingleQuoted = value[0] === "'" && value[end] === "'";

        if (isSingleQuoted || isDoubleQuoted) {
            value = value.substring(1, end)
  
          if (isDoubleQuoted) {
            value = value.replace(RE_NEWLINES, NEWLINE)
          }
        } else {
            value = value.trim()
        }

        return value;
    }

    /**
     * Categorize each line and it's type
     */
    private constructTreeFromString(fileContent: string) {
        const allLines = fileContent.split(NEWLINES_MATCH);
        const tree : DotenvFileTree = {};
        
        // use of foreach to have the index
        allLines.forEach((line,index) => {
            // higly inspired from the parse function of dotenv, because reasons
            const keyValue = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (keyValue) {
                const key = keyValue[1];
                const value = (keyValue[2] ?? '')

                tree[key] = {
                    type : NodeType.VARIABLE,
                    key,
                    value : this.parseSingleValue(value),
                    line: index
                }
            }else if(line.trimStart().startsWith("#")) {
                tree[index] = {
                    type : NodeType.COMMENT,
                    key : index.toString(),
                    value : line,
                    line : index
                }
            }else{
                tree[index] = {
                    type : NodeType.UNKNOWN,
                    key : index.toString(),
                    value : line,
                    line: index
                }
            }
        });

        return tree;
    }
    

    private applyPendingChangesOnString(fileContent: string) {
        const eachLines: string[] = fileContent.split(NEWLINES_MATCH);
        for (const key in this.treePendingChanges) {
            const element = this.treePendingChanges[key];
            if (element.line === undefined) {
                eachLines.push(`${element.key}=${element.value}`);
            }else{
                eachLines[element.line] = `${element.key}=${element.value}`;
            }
        }
        return eachLines.join("\n");
    }

    /**
     *  read the file and parse the content, synchronously
     */
    public parseSync(): DotenvFileTree {
        const fileContent = readFileSync(this.fileName,"utf8");
        return this.tree = this.constructTreeFromString(fileContent);
    }

    /**
     * read the file and parse the content
     */
    public async parse(): Promise<DotenvFileTree> {
        const fileContent = await asyncReadFile(this.fileName,"utf8");
        return this.tree = this.constructTreeFromString(fileContent);
    }


    /**
     *  if immediateParse, content is parsed synchronously
     */
    public constructor(fileName: string, immediateParse  = true) {
        this.fileName = fileName;
        if (immediateParse) {
            this.parseSync();
        }
    }

    public exists(key : keyof Structure | string): boolean {
        return this.tree[key as string] !== undefined;
    }

    /**
     * Get the value of a key
     */
    public get(key : keyof Structure, defaultValue? : unknown): string | undefined {
        return this.tree[key as string]?.value ?? defaultValue;
    }

    /**
     * Set the value of a key
     * call .save() to persist changes
     */
    public set(key : string,value : string): void {
        if (!this.exists(key)) {
            this.treePendingChanges[key as string] = {
                key: key as string,
                value: this.parseSingleValue(value),
                type : NodeType.VARIABLE,
                line : undefined,
            }
        }else{
            this.treePendingChanges[key as string] = {
                key : key as string,
                value: this.parseSingleValue(value),
                type : this.tree[key as string].type,
                line : this.tree[key as string].line,
            }
        }
    }


    /**
     * Persists the pending changes, synchronously
     */
    public saveSync(): void {
        const fileContent = readFileSync(this.fileName,"utf8");
        writeFileSync(this.fileName,this.applyPendingChangesOnString(fileContent));
        this.tree = {...this.tree, ...this.treePendingChanges};
        this.treePendingChanges = {};
    }

    /**
     * Persists the pending changes
     */
    public async save() : Promise<void> {
        const fileContent = (await asyncReadFile(this.fileName,"utf8"));
        await asyncWriteFile(this.fileName,this.applyPendingChangesOnString(fileContent));
        this.tree = {...this.tree, ...this.treePendingChanges};
        this.treePendingChanges = {};
    }
}