import dts from "bun-plugin-dts";

await Bun.build({
  // root: "../",
  target: "node",
  external: ["unstorage"],
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  // plugins: [dts()],
});

// Generates `dist/index.d.ts` and `dist/other/foo.d.ts`
// "build": "bun build ./src/index.ts --outdir=dist  --target node --external unstorage",
//
