"use strict";
// Common types and interfaces shared across services
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleName = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["CASHIER"] = "CASHIER";
    UserRole["STAFF"] = "STAFF";
})(UserRole || (exports.UserRole = UserRole = {}));
var ModuleName;
(function (ModuleName) {
    ModuleName["POS"] = "POS";
    ModuleName["INVENTORY"] = "INVENTORY";
    ModuleName["ACCOUNTING"] = "ACCOUNTING";
    ModuleName["LOYALTY"] = "LOYALTY";
    ModuleName["ECOMMERCE"] = "ECOMMERCE";
    ModuleName["AI"] = "AI";
    ModuleName["CRM"] = "CRM";
})(ModuleName || (exports.ModuleName = ModuleName = {}));
//# sourceMappingURL=index.js.map