const express = require('express');

const combineMiddlewares = (...middlewareList) => {
  return middlewareList.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return [...acc, ...item];
    }
    return [...acc, item];
  }, []);
};

const createRoutes = (config) => {
  const router = express.Router();
  const { path, middlewares = [], routes = [] } = config;

  const getSchema = (moduleName, schemaName) => {
    const schemaModule = require(`../modules/${moduleName}/${schemaName}`);
    return schemaModule[schemaName];
  };

  const getController = (moduleName, methodName) => {
    const controllerModule = require(`../modules/${moduleName}/${methodName}.controller`);
    return controllerModule[methodName];
  };

  const applyValidations = (moduleName, validations) => {
    return (validations || []).map((schemaName) => {
      const schema = getSchema(moduleName, schemaName);
      return require('../middleware/validate')(schema);
    });
  };

  const getMiddlewareFns = (middlewareNames) => {
    const middlewareMap = {
      auth: require('../middleware/auth'),
      auditLog: require('../middleware/auditLog'),
      validate: require('../middleware/validate'),
      rbac: require('../middleware/rbac'),
      authLimiter: null,
      apiLimiter: null,
    };
    return middlewareNames.map((name) => middlewareMap[name] || null).filter(Boolean);
  };

  routes.forEach((route) => {
    const { method, path: routePath, handler, moduleName, validations = [] } = route;
    const controllerFn = getController(moduleName, handler);
    const routeMiddlewares = combineMiddlewares(
      getMiddlewareFns(middlewares),
      applyValidations(moduleName, validations)
    );

    const handlerFn = routeMiddlewares.length > 0
      ? [...routeMiddlewares, controllerFn]
      : controllerFn;

    router[method](routePath, handlerFn);
  });

  return router;
};

module.exports = { createRoutes };
