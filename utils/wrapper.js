const logger = require('./logger');

/**
 * Controller Wrapper for entry/exit logging and error handling
 * @param {string} scope Logger scope
 * @param {string} fnName Function name for logging
 * @param {function} handler The actual controller function
 */
const withLogging = (scope, fnName, handler) => {
    const log = logger(scope);
    return async (req, res, next) => {
        try {
            log.info(`Entering ${fnName}`, { 
                requestId: req.requestId,
                params: req.params, 
                query: req.query,
                body: req.body 
            });
            
            await handler(req, res, next);
            
            log.info(`Exiting ${fnName}`, { 
                requestId: req.requestId,
                statusCode: res.statusCode 
            });
        } catch (error) {
            log.error(`Error in ${fnName}`, { 
                requestId: req.requestId,
                message: error.message, 
                stack: error.stack 
            });
            next(error);
        }
    };
};

module.exports = { withLogging };
