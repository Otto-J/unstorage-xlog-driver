await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  external: ["unstorage"],
  target: "node",
  format: "esm",
});
console.log("Build complete!");
