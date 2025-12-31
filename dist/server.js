"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const MONGO_URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 4000;
async function main() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    app_1.default.listen(PORT, () => {
        console.log(`✅ Server listening on ${PORT}`);
    });
}
main().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map