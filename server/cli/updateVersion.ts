
import fs from 'fs';
import path from 'path';

// Handle __dirname for both CJS and ESM environments if needed, 
// though typically with ts-node/tsx and no "type": "module", __dirname exists.
// If this fails in an ESM environment, we might need the fileURLToPath shim.
// For now, assuming __dirname works or will be handled by the runner.

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
    console.error('Usage: npx tsx server/cli/updateVersion.ts <new-version> [target]');
    console.error('Example: npx tsx server/cli/updateVersion.ts 1.0.1');
    console.error('Example: npx tsx server/cli/updateVersion.ts 1.0.1 ui');
    console.error('Example: npx tsx server/cli/updateVersion.ts 1.0.1 admin');
    process.exit(1);
}

const newVersion = args[0];
const target = args[1]; // Optional: 'ui' or 'server'

// Validate version format (simple x.y.z regex)
const versionRegex = /^\d+\.\d+\.\d+(-[\w\d\.]+)?$/;
if (!versionRegex.test(newVersion)) {
    console.error(`Invalid version format: ${newVersion}. Expected x.y.z or x.y.z-beta etc.`);
    process.exit(1);
}

if (target && !['ui', 'server', 'admin'].includes(target)) {
    console.error(`Invalid target: ${target}. Expected 'ui', 'server', or 'admin'.`);
    process.exit(1);
}

let filesToUpdate = [
    { key: 'server', path: path.resolve(__dirname, '../package.json') },      // server
    { key: 'shared', path: path.resolve(__dirname, '../../shared/package.json') }, // shared
    { key: 'ui', path: path.resolve(__dirname, '../../ui/package.json') },      // ui
    { key: 'admin', path: path.resolve(__dirname, '../../admin/package.json') }    // admin
];

if (target) {
    filesToUpdate = filesToUpdate.filter(f => f.key === target);
}

console.log(`Updating versions to ${newVersion} for ${target ? target : 'all packages'}...`);

filesToUpdate.forEach(fileObj => {
    const filePath = fileObj.path;
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);
            const oldVersion = json.version;

            if (oldVersion === newVersion) {
                console.log(`Skipping ${fileObj.key}: already at ${newVersion}`);
            } else {
                json.version = newVersion;
                // Preserve trailing newline and formatting
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
                console.log(`Updated ${fileObj.key} package.json: ${oldVersion} -> ${newVersion}`);
            }
        } else {
            console.error(`Warning: File not found: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
});
