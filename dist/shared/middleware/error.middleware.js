"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
function errorMiddleware(err, _req, res, _next) {
    if (res.headersSent)
        return;
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error",
    });
}
//# sourceMappingURL=error.middleware.js.map