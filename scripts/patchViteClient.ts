import fs from 'fs';
import path from 'path';

export function patchViteClient() {
  try {
    const clientPath = path.resolve('node_modules/vite/dist/client/client.mjs');
    if (fs.existsSync(clientPath)) {
      let content = fs.readFileSync(clientPath, 'utf-8');
      
      // Fix any broken debug arrow function
      content = content.replace(/debug:\s*\(\.\.\.msg\)\s*=>\s*\/\*.*?\*\//g, 'debug: () => {}');
      content = content.replace(/debug:\s*\(\.\.\.msg\)\s*=>\s*console\.debug\(\s*["']\[vite\]["'],\s*\.\.\.msg\)/g, 'debug: () => {}');
      
      // Mute standalone console.debug("[vite] connecting...")
      content = content.replace(/console\.debug\(\s*["']\[vite\] connecting\.\.\.["']\s*\);?/g, '/* [vite log muted] */');
      content = content.replace(/console\.debug\(\s*`\[vite\] connected\.`\s*\);?/g, '/* [vite log muted] */');

      fs.writeFileSync(clientPath, content, 'utf-8');
      console.log('✅ Vite client debug logs neutralized cleanly with valid syntax.');
    }
  } catch (err) {
    console.warn('Vite client patch warning:', err);
  }
}

if (process.argv[1]?.endsWith('patchViteClient.ts')) {
  patchViteClient();
}
