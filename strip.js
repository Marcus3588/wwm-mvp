const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const foldersToProcess = ['frontend/src', 'backend/src'];

foldersToProcess.forEach(folder => {
    const fullPath = path.join(__dirname, folder);
    if (fs.existsSync(fullPath)) {
        walkDir(fullPath, (filePath) => {
            if (filePath.match(/\.(js|jsx|ts|tsx)$/)) {
                try {
                    let content = fs.readFileSync(filePath, 'utf8');
                    // Don't strip if there are no comments to save time
                    if (content.includes('//') || content.includes('/*')) {
                        // Remove block comments
                        let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '');
                        // Remove line comments, avoiding URLs and strings with //
                        cleaned = cleaned.replace(/(?<![:'"])\/\/.*$/gm, '');

                        if (content !== cleaned) {
                            fs.writeFileSync(filePath, cleaned, 'utf8');
                            console.log(`Stripped comments from: ${filePath}`);
                        }
                    }
                } catch (e) {
                    console.error(`Error processing ${filePath}: ${e}`);
                }
            }
        });
    }
});
console.log('Done!');
