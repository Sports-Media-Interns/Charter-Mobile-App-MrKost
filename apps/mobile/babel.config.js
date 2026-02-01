module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Transform import.meta for web compatibility
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              path.replaceWithSourceString("{}");
            },
          },
        };
      },
    ],
  };
};
