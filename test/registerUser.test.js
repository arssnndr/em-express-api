import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { registerUser, _setSupabase, _setBcrypt } from '../controllers/authController.js';

function makeRes() {
    const res = {};
    res.statusCode = 200;
    res.headers = {};
    res._json = null;
    res.status = function (code) { this.statusCode = code; return this; };
    res.json = function (obj) { this._json = obj; return this; };
    return res;
}

test('registerUser success returns 201 and user without password', async () => {
    // Arrange: bcrypt.hash and supabase.insert success
    _setBcrypt({ hash: async (pwd, rounds) => 'hashed-password' });
    _setSupabase({
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: { id: 2, username: 'bob' }, error: null })
                })
            })
        })
    });

    const req = { body: { username: 'bob', password: 'secret' } };
    const res = makeRes();

    await registerUser(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res._json.message, 'User registered');
    assert.equal(res._json.user.username, 'bob');
    assert.equal(res._json.user.password_hash, undefined);
});

test('registerUser duplicate username returns 409', async () => {
    _setBcrypt({ hash: async () => 'h' });
    _setSupabase({
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: null, error: { code: '23505', message: 'unique_violation' } })
                })
            })
        })
    });

    const req = { body: { username: 'exists', password: 'p' } };
    const res = makeRes();

    await registerUser(req, res);
    assert.equal(res.statusCode, 409);
    assert.equal(res._json.message, 'Username already exists');
});

test('registerUser missing fields returns 400', async () => {
    const res = makeRes();
    await registerUser({ body: { username: '', password: '' } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res._json.message, 'Username and password are required');
});
