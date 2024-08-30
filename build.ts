import { BuildOptions, build, analyzeMetafile } from "esbuild";
import fs from "node:fs/promises";

const cjsBuildOptions: BuildOptions = {
  bundle: true,
  platform: "node",
  entryPoints: ["src/index.ts", "src/zod/index.ts"],
  format: "cjs",
  outdir: "./dist/cjs",
  external: ["ethers", "zod"],
  target: "node20",
  sourcemap: "linked",
  metafile: true,
  color: true,
  logLevel: "debug",
};

const { metafile: cjsMetafile } = await build(cjsBuildOptions);
if (cjsMetafile) {
  const [analyzeResult] = await Promise.all([
    analyzeMetafile(cjsMetafile, { color: true }),
    fs.writeFile("dist/cjs/package.json", JSON.stringify({ type: "commonjs" }, undefined, 2)),
  ]);
  console.log(analyzeResult);
}

// await fs.writeFile("dist/cjs/package.json", JSON.stringify({ type: "commonjs" }, undefined, 2));

// const tsFiles = fs.glob(["src/**/*.ts", "src/grammar/eip4361.js"], {
//   exclude: filename => filename.endsWith(".d.ts") || filename.endsWith("types.ts"),
// });
// const entryPoints: string[] = [];
// for await (const tsFile of tsFiles) {
//   entryPoints.push(tsFile);
// }

// const esmBuildOptions: BuildOptions = {
//   platform: "node",
//   entryPoints,
//   format: "esm",
//   outdir: "./dist/esm",
//   target: "node20",
//   sourcemap: "linked",
//   metafile: true,
//   color: true,
//   logLevel: "debug",
// };

// const { metafile: esmMetafile } = await build(esmBuildOptions);
// if (esmMetafile) {
//   const analyzeResult = await analyzeMetafile(esmMetafile, { color: true });
//   console.log(analyzeResult);
// }
