import { execSync } from 'child_process';
import rcedit from 'rcedit';
import path from 'path';

const exeName = 'phantom-chat.exe';
const distPath = 'dist';
const exePath = path.join(distPath, exeName);
const iconPath = path.resolve(process.cwd(), 'Logo.ico');

try {
    console.log('Bundling with esbuild...');
    execSync(`esbuild index.js --bundle --platform=node --outfile=dist/bundle.cjs`, { stdio: 'inherit' });
    console.log('Packaging with pkg...');
    execSync(`pkg dist/bundle.cjs --targets node18-win-x64 -o ${exePath}`, { stdio: 'inherit' });
    console.log(`Setting icon for ${exeName}...`);
    await rcedit(exePath, { icon: iconPath });

    console.log('Build successful!');

} catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
} 