"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.generate4DigitCode = generate4DigitCode;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
function signToken(userId) {
    const payload = { sub: userId };
    const options = {};
    if (JWT_EXPIRES_IN !== undefined) {
        options.expiresIn = JWT_EXPIRES_IN;
    }
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
function generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // "1234"
}
//# sourceMappingURL=auth.utils.js.map