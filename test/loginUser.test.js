import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { loginUser, _setSupabase, _setBcrypt, _setJwt } from '../controllers/authController.js';

function makeRes() {
    const res = {};
    res.statusCode = 200;
    res.headers = {};
    res.cookieCalls = [];
    res.status = function (code) { this.statusCode = code; return this; };
    res.json = function (obj) { this._json = obj; return this; };
    res.cookie = function (name, val, opts) { this.cookieCalls.push({ name, val, opts }); return this; };
    res.clearCookie = function () { this.clearCalled = true; return this; };
    return res;
}

test('loginUser success sets cookie and returns token and user', async () => {
    // Arrange: inject fake supabase, bcrypt, jwt
    _setSupabase({
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: { id: 1, username: 'alice', password_hash: 'hashed', role: 'user' }, error: null })
                })
            })
        })
    });
    _setBcrypt({ compare: async (pwd, hash) => true });
    _setJwt({ sign: (payload, secret, opts) => 'signed-token' });

    const req = { body: { username: 'alice', password: 'password' } };
    const res = makeRes();

    // Act
    const result = await loginUser(req, res);

    // Assert
    assert.equal(res._json.message, 'Login successful');
    assert.equal(res._json.token, 'signed-token');
    assert.equal(res.cookieCalls.length, 1);
    assert.equal(res.cookieCalls[0].name, 'token');
    assert.equal(res.cookieCalls[0].opts.httpOnly, true);
});

test('loginUser invalid credentials returns 401', async () => {
    _setSupabase({
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { message: 'not found' } })
                })
            })
        })
    });
    // bcrypt/jwt shouldn't be called but set safe defaults
    _setBcrypt({ compare: async () => false });
    _setJwt({ sign: () => 'nope' });

    const req = { body: { username: 'unknown', password: 'x' } };
    const res = makeRes();

    await loginUser(req, res);
    assert.equal(res.statusCode, 401);
    assert.equal(res._json.message, 'Invalid credentials');
});
