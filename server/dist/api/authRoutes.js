"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../db/database");
const router = (0, express_1.Router)();
router.get('/users', (req, res) => {
    const users = Array.from(database_1.db.users.values());
    res.json({ success: true, users });
});
router.post('/login', (req, res) => {
    const { email } = req.body;
    const user = Array.from(database_1.db.users.values()).find(u => u.email === email) || Array.from(database_1.db.users.values())[0];
    res.json({
        success: true,
        user,
        token: `jwt-${user.id}-${Date.now()}`
    });
});
exports.default = router;
