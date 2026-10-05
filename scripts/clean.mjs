import { rmSync, globSync } from "node:fs";

const targets = [".turbo", "apps/*/.next", "packages/*/.next"];

let removed = 0;
for (const pattern of targets) {
  for (const path of globSync(pattern, { withFileTypes: false })) {
    rmSync(path, { recursive: true, force: true });
    console.log(`removed ${path}`);
    removed++;
  }
}

if (removed === 0) {
  console.log("nothing to clean");
}
