import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    deleteEmployee,
    _setSupabase,
} from '../controllers/employeeController.js';

function makeRes() {
    const res = {};
    res.statusCode = 200;
    res._json = null;
    res._sent = null;
    res.status = function (code) { this.statusCode = code; return this; };
    res.json = function (obj) { this._json = obj; return this; };
    res.send = function (v) { this._sent = v; return this; };
    return res;
}

// Helper to create a chainable mock query that resolves to the provided result
function makeQuery(result) {
    const q = {
        or() { return this; },
        eq() { return this; },
        ilike() { return this; },
        order() { return this; },
        range() { return this; },
        single: async function () { return result; },
        insert() { return this; },
        select() { return this; },
        delete() { return this; },
        then(resolve) { return resolve(result); },
    };
    return q;
}

test('getAllEmployees returns data and pagination', async () => {
    _setSupabase({
        from: () => ({
            select: () => makeQuery({ data: [{ id: 1, first_name: 'A' }], error: null, count: 1 }),
            // ensure chaining methods exist
            or: () => ({
                eq: () => ({ order: () => ({ range: () => makeQuery({ data: [{ id: 1 }], error: null, count: 1 }) }) })
            }),
        })
    });

    const req = { query: {} };
    const res = makeRes();
    await getAllEmployees(req, res);
    assert.equal(Array.isArray(res._json.employees), true);
    assert.equal(res._json.pagination.totalItems, 1);
});

test('getEmployeeById returns 404 when not found', async () => {
    _setSupabase({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'not found' } }) }) }) }) });
    const req = { params: { id: '999' } };
    const res = makeRes();
    await getEmployeeById(req, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res._json.message, 'Employee not found');
});

test('getEmployeeById returns data when found', async () => {
    _setSupabase({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { id: 2, first_name: 'B' }, error: null }) }) }) }) });
    const req = { params: { id: '2' } };
    const res = makeRes();
    await getEmployeeById(req, res);
    assert.equal(res._json.id, 2);
});

test('createEmployee missing fields returns 400', async () => {
    const req = { body: { username: '', firstName: '' } };
    const res = makeRes();
    await createEmployee(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res._json.message, 'All fields are required');
});

test('createEmployee success returns 201 with created data', async () => {
    _setSupabase({
        from: () => ({
            insert: () => ({
                select: () => ({ single: async () => ({ data: { id: 3, username: 'c' }, error: null }) })
            })
        })
    });
    const req = { body: { username: 'c', firstName: 'C', lastName: 'D', email: 'c@x', birthDate: '2000-01-01', basicSalary: 1000, status: 'active', group: 'dev', description: 'x' } };
    const res = makeRes();
    await createEmployee(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res._json.id, 3);
});

test('deleteEmployee success returns 204', async () => {
    _setSupabase({ from: () => ({ delete: () => ({ eq: async () => ({ error: null }) }) }) });
    const req = { params: { id: '3' } };
    const res = makeRes();
    await deleteEmployee(req, res);
    assert.equal(res.statusCode, 204);
});
