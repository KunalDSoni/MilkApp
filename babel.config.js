module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // babel-preset-expo auto-adds the reanimated plugin when the package is
    // installed, so it must not be listed manually.
  };
};
