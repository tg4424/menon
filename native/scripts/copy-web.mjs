// Copy the web game from the repo root into native/www so Capacitor can bundle it.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const www = join(here, "..", "www");

const items = ["index.html", "manifest.webmanifest", "privacy.html", "delete-account.html", "icons", "img", "music"];

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const item of items) {
  const src = join(root, item);
  if (existsSync(src)) cpSync(src, join(www, item), { recursive: true });
}
console.log("Copied web game into native/www");
