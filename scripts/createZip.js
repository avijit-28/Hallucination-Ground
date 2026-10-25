import fs from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const outputPath = path.join(rootDir, 'netlify-ready-game.zip');

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const output = fs.createWriteStream(outputPath);
const archive = new ZipArchive({
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`✓ netlify-ready-game.zip created successfully! Total size: ${archive.pointer()} bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// 1. Add directories with POSIX forward slashes
archive.directory(path.join(rootDir, 'public'), 'public');
archive.directory(path.join(rootDir, 'netlify'), 'netlify');
archive.directory(path.join(rootDir, 'lib'), 'lib');
archive.directory(path.join(rootDir, 'dist'), 'dist');

// 2. Add root-level files
archive.file(path.join(rootDir, 'netlify.toml'), { name: 'netlify.toml' });
archive.file(path.join(rootDir, 'package.json'), { name: 'package.json' });
archive.file(path.join(rootDir, 'package-lock.json'), { name: 'package-lock.json' });
archive.file(path.join(rootDir, 'tsconfig.json'), { name: 'tsconfig.json' });

archive.finalize();
