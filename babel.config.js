// moving /app direction to /src/app so we need to change the context path
// for expo-router to find the entry point to the app
process.env.EXPO_ROUTER_APP_ROOT = '../../src/app';

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [require.resolve('expo-router/babel')],
  };
};
