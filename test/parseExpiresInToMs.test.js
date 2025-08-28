import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { parseExpiresInToMs } from '../controllers/authController.js';

test('parseExpiresInToMs handles minutes', () => {
    assert.equal(parseExpiresInToMs('15m'), 15 * 60 * 1000);
    assert.equal(parseExpiresInToMs('1m'), 60 * 1000);
});

test('parseExpiresInToMs handles seconds and numbers', () => {
    assert.equal(parseExpiresInToMs('30s'), 30 * 1000);
    assert.equal(parseExpiresInToMs(45), 45 * 1000);
    assert.equal(parseExpiresInToMs('3600'), 3600 * 1000);
});

test('parseExpiresInToMs handles hours and days', () => {
    assert.equal(parseExpiresInToMs('1h'), 60 * 60 * 1000);
    assert.equal(parseExpiresInToMs('2d'), 2 * 24 * 60 * 60 * 1000);
});

test('parseExpiresInToMs falls back to default on invalid input', () => {
    const defaultMs = 15 * 60 * 1000;
    assert.equal(parseExpiresInToMs(null), defaultMs);
    assert.equal(parseExpiresInToMs('invalid'), defaultMs);
});
