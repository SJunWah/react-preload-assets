import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["src/index.ts", "src/scripts/extractPreloadAssets.ts"],
  splitting: true,
  // dts: "./src/index.ts",
  shims: true,
  skipNodeModulesBundle: true,
  // clean: true,

  dts: true,
  clean: true,
  external: ['react'],
  sourcemap: true,
  target: 'es2015',
  minify: false,
  treeshake: true,
  outDir: 'dist',
  platform: 'browser',
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  }
});
