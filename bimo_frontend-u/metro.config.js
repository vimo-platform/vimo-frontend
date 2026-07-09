const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);
const appNodeModules = path.resolve(projectRoot, 'node_modules');
const runtimeModuleMap = {
  'expo-splash-screen': path.resolve(appNodeModules, 'expo-splash-screen'),
  'expo-status-bar': path.resolve(appNodeModules, 'expo-status-bar'),
  react: path.resolve(appNodeModules, 'react'),
  'react-native': path.resolve(appNodeModules, 'react-native'),
  'react-native-reanimated': path.resolve(appNodeModules, 'react-native-reanimated'),
  'react-native-safe-area-context': path.resolve(appNodeModules, 'react-native-safe-area-context'),
  'react-native-svg': path.resolve(appNodeModules, 'react-native-svg'),
  'react-native-worklets': path.resolve(appNodeModules, 'react-native-worklets'),
};

config.watchFolders = [path.resolve(workspaceRoot, 'shared')];
config.resolver.nodeModulesPaths = [appNodeModules];
config.resolver.extraNodeModules = runtimeModuleMap;
config.resolver.disableHierarchicalLookup = true;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mappedModule = runtimeModuleMap[moduleName];
  return context.resolveRequest(context, mappedModule ?? moduleName, platform);
};

module.exports = config;
