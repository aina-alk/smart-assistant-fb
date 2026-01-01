"use strict";
/**
 * Cloud Functions pour Super Assistant Médical
 * Système d'autorisation avec circuit d'entretien
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = exports.updateUserStatus = exports.rejectUser = exports.approveUser = exports.onUserStatusChanged = exports.onUserCreated = void 0;
const app_1 = require("firebase-admin/app");
// Initialiser Firebase Admin
(0, app_1.initializeApp)();
// Triggers Firestore
var onUserCreated_1 = require("./triggers/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
var onUserStatusChanged_1 = require("./triggers/onUserStatusChanged");
Object.defineProperty(exports, "onUserStatusChanged", { enumerable: true, get: function () { return onUserStatusChanged_1.onUserStatusChanged; } });
// Callable Functions
var approveUser_1 = require("./callables/approveUser");
Object.defineProperty(exports, "approveUser", { enumerable: true, get: function () { return approveUser_1.approveUser; } });
var rejectUser_1 = require("./callables/rejectUser");
Object.defineProperty(exports, "rejectUser", { enumerable: true, get: function () { return rejectUser_1.rejectUser; } });
var updateUserStatus_1 = require("./callables/updateUserStatus");
Object.defineProperty(exports, "updateUserStatus", { enumerable: true, get: function () { return updateUserStatus_1.updateUserStatus; } });
var getAdminStats_1 = require("./callables/getAdminStats");
Object.defineProperty(exports, "getAdminStats", { enumerable: true, get: function () { return getAdminStats_1.getAdminStats; } });
//# sourceMappingURL=index.js.map