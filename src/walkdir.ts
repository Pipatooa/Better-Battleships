import fs from "fs";
import path from "path";

export function walkDir(dir: string): string[] {
    let files: string[] = [];

    fs.readdirSync(dir).forEach( f => {
        let filePath = path.join(dir, f);
        let isDirectory = fs.statSync(filePath).isDirectory();

        if (!isDirectory)
            files.push(filePath.replace(/\\/g, "/"));
        else
            files = files.concat(walkDir(filePath));
    });

    return files;
}