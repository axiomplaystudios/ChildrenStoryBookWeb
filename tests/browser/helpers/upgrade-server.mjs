import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, resolve, extname } from 'node:path';

const run = promisify(execFile);
export const upgradeBase = '/ChildrenStoryBookWeb/';

// All exports/builds stay in ignored scratch. Never checkout an old revision,
// write the shared dist/catalog, or reuse another test's preview server.
export async function createUpgradeServer() {
  const root = resolve('.');
  const scratchRoot = join(root, '.superpowers', 'scratch');
  await mkdir(scratchRoot, { recursive: true });
  const scratch = await mkdtemp(join(scratchRoot, 'legacy-upgrade-'));
  let server;
  try {
    await run('git', ['cat-file', '-e', 'a03e676^{commit}'], { cwd: root })
      .catch(() => { throw Error('Upgrade regression requires released commit a03e676; fetch the project history (for a shallow clone: git fetch --unshallow) before running it.'); });
    const legacy = join(scratch, 'legacy'), current = join(scratch, 'current');
    await mkdir(legacy); await mkdir(current);
    const { stdout: archive } = await run('git', ['archive', 'a03e676'], {
      cwd: root, encoding: 'buffer', maxBuffer: 100 * 1024 * 1024,
    });
    const archiveFile = join(scratch, 'legacy.tar');
    await writeFile(archiveFile, archive);
    await run('tar', ['-xf', archiveFile, '-C', legacy]);
    for (const file of ['package.json', 'package-lock.json', 'vite.config.js', 'index.html', 'src', 'public', 'scripts'])
      await cp(join(root, file), join(current, file), { recursive: true });
    for (const folder of [legacy, current]) {
      await symlink(join(root, 'node_modules'), join(folder, 'node_modules'), 'dir');
      await run('npm', ['run', 'build', '--', '--base', upgradeBase], {
        cwd: folder, maxBuffer: 4 * 1024 * 1024,
      });
    }
    let release = 'legacy';
    const failures = new Set(), requests = [];
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
    server = createServer(async (request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      requests.push(pathname);
      response.setHeader('Cache-Control', 'no-store');
      if (!pathname.startsWith(upgradeBase)) { response.writeHead(404).end(); return; }
      const relative = pathname.slice(upgradeBase.length) || 'index.html';
      if (relative.split('/').includes('..')) { response.writeHead(400).end(); return; }
      if (failures.has(relative)) { response.writeHead(503).end('Fixture network failure'); return; }
      try {
        let bytes = await readFile(join(release === 'legacy' ? legacy : current, 'dist', relative));
        // A real subsequent SW update, with unchanged content packages. This
        // tests current-client update deferral without changing production code.
        if (release === 'next' && relative === 'sw.js') bytes = Buffer.concat([bytes, Buffer.from('\n/* upgrade fixture: next shell */\n')]);
        response.setHeader('Content-Type', types[extname(relative)] || 'application/octet-stream');
        response.writeHead(200).end(bytes);
      } catch { response.writeHead(404).end(); }
    });
    await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
    return {
      url: `http://127.0.0.1:${server.address().port}${upgradeBase}`,
      release(value) { release = value; }, failures, requests,
      async close() {
        server.closeAllConnections();
        await new Promise(resolveClose => server.close(resolveClose));
        await rm(scratch, { recursive: true, force: true });
      },
    };
  } catch (error) {
    server?.closeAllConnections(); server?.close();
    await rm(scratch, { recursive: true, force: true });
    throw error;
  }
}
