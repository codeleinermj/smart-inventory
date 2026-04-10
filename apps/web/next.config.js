/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@smart-inv/shared-types"],
  reactStrictMode: true,
  // `@smart-inv/shared-types` is compiled under `module: NodeNext`, which
  // requires explicit `.js` extensions in re-exports (e.g. `./auth.js`).
  // The source files are `.ts`, so we need to tell webpack to try `.ts`
  // when it sees a `.js` import that doesn't resolve. This is the standard
  // ESM NodeNext ↔ bundler interop shim.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

module.exports = nextConfig;
