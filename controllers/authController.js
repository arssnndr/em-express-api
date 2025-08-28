import { supabase as _supabase } from '../config/supabase.js';
import _bcrypt from 'bcrypt';
import _jwt from 'jsonwebtoken';

// Allow test injection of dependencies
let supabase = _supabase;
let bcrypt = _bcrypt;
let jwt = _jwt;

export function _setSupabase(client) { supabase = client; }
export function _setBcrypt(mock) { bcrypt = mock; }
export function _setJwt(mock) { jwt = mock; }

// Parse common expiresIn formats (e.g. '15m', '1h', '3600s') to milliseconds.
export function parseExpiresInToMs(expiresIn) {
    const defaultMs = 15 * 60 * 1000; // 15 minutes
    if (!expiresIn) return defaultMs;
    if (typeof expiresIn === 'number') return expiresIn * 1000; // assume seconds
    const str = String(expiresIn).trim();
    const m = str.match(/^(\d+)\s*(s|m|h|d)$/i);
    if (m) {
        const val = Number(m[1]);
        const unit = m[2].toLowerCase();
        switch (unit) {
            case 's':
                return val * 1000;
            case 'm':
                return val * 60 * 1000;
            case 'h':
                return val * 60 * 60 * 1000;
            case 'd':
                return val * 24 * 60 * 60 * 1000;
        }
    }
    // fallback: if numeric string, treat as seconds
    const n = parseInt(str, 10);
    if (!Number.isNaN(n)) return n * 1000;
    return defaultMs;
}

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        // Hindari user enumeration: balikan pesan generik
        if (error || !data) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, data.password_hash || '');
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
        if (!secret) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ message: 'Server misconfiguration' });
        }

        // Minimal payload
        const payload = {
            sub: data.id,
            username: data.username,
            role: data.role || 'user',
        };

        const token = jwt.sign(payload, secret, { expiresIn });

        // Hitung maxAge cookie berdasarkan JWT_EXPIRES_IN agar konsisten dengan token
        const maxAgeMs = parseExpiresInToMs(expiresIn);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: maxAgeMs,
            path: '/',
        });

        const { password_hash, ...user } = data;
        return res.json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username, password_hash }])
            .select('*')
            .single();

        if (error) {
            // unique_violation on username
            if (error.code === '23505') {
                return res.status(409).json({ message: 'Username already exists' });
            }
            console.error('Register error:', error);
            return res.status(500).json({ message: 'Failed to register user' });
        }

        const { password_hash: _ph, ...user } = data;
        return res.status(201).json({ message: 'User registered', user });
    } catch (err) {
        console.error('Register exception:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });
    return res.json({ message: 'Logged out' });
};
