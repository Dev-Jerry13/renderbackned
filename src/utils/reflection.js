const fs = require('fs');
const path = require('path');

function getAllControllerFiles() {
  const controllersDir = path.join(__dirname, '..', 'modules');
  const modules = fs.readdirSync(controllersDir);

  const modulesInfo = {};

  modules.forEach(module => {
    const modulePath = path.join(controllersDir, module);
    if (fs.statSync(modulePath).isDirectory()) {
      const files = fs.readdirSync(modulePath);
      const controllerFiles = files.filter(file => file.endsWith('.controller.js'));
      if (controllerFiles.length > 0) {
        const controllers = {};
        controllerFiles.forEach(file => {
          const controllerName = file.replace('.controller.js', '');
          const moduleExports = require(path.join(modulePath, file));
          Object.assign(controllers, moduleExports);
        });
        modulesInfo[module] = controllers;
      }
    }
  });

  return modulesInfo;
}

function getRouteConfig(moduleName, fileName) {
  const router = require(path.join(__dirname, '..', 'modules', moduleName, fileName));
  return router;
}

module.exports = { getAllControllerFiles, getRouteConfig };