const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Adiciona suporte a resolver módulos que podem estar sendo pedidos mas não existem no web
config.resolver.extraNodeModules = {
  url: require.resolve("url/"),
  path: require.resolve("path-browserify"),
  stream: require.resolve("stream-browserify"),
  buffer: require.resolve("buffer/"),
};

module.exports = withNativeWind(config, { input: "./styles/global.css" });
