// To avoid cache version after deployment, we change bundle file name everytime building bundle
// We change default webpack's config by override it with react-app-rewired library
// File name will be generated in format "name.hash.yyyy-mm-dd-hh-mm-ss" (old name is "name.hash")

const currentDateTime = new Date().toISOString().replace(/[T:]/g, '-').slice(0, 19);

module.exports = function override(config, env) {
  config.output.chunkFilename = `static/js/[name].[contenthash:8].${currentDateTime}.chunk.js`;
  config.output.filename = `static/js/[name].[contenthash:8].${currentDateTime}.js`;
  return config;
};
