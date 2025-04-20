await Bun.build({
  entrypoints: ["./index-parse-content.ts"],
  outdir: "./dist",
  external: ["unstorage"],
  target: "node",
  format: "esm",
});
console.log("Build complete!");
