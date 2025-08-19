import { supabase } from '../config/supabase.js';

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

        if (error || !data) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = data.password_hash === password;
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { password_hash, ...user } = data;
        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
