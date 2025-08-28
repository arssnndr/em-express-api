import { supabase as _supabase } from '../config/supabase.js';

let supabase = _supabase;
export function _setSupabase(client) { supabase = client; }

export const getAllEmployees = async (req, res) => {
    const { page = 1, pageSize = 10, searchTerm, status, group, sortBy, sortDirection } = req.query;
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    try {
        let query = supabase.from('employees').select('*', { count: 'exact' });
        if (searchTerm) {
            const term = `%${searchTerm}%`;
            query = query.or(`first_name.ilike.${term},last_name.ilike.${term},username.ilike.${term},email.ilike.${term}`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (group) {
            query = query.ilike('group_name', `%${group}%`);
        }
        if (sortBy) {
            query = query.order(sortBy, { ascending: sortDirection === 'asc' });
        } else {
            query = query.order('first_name', { ascending: true });
        }
        const startIndex = (pageNum - 1) * sizeNum;
        query = query.range(startIndex, startIndex + sizeNum - 1);

        const { data, error, count } = await query;
        if (error) {
            console.error('Error fetching employees:', error);
            return res.status(500).json({ message: 'Error fetching employees' });
        }
        res.json({
            employees: data,
            pagination: {
                currentPage: pageNum,
                pageSize: sizeNum,
                totalItems: count || 0,
                totalPages: Math.ceil((count || 0) / sizeNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createEmployee = async (req, res) => {
    const { username, firstName, lastName, email, birthDate, basicSalary, status, group, description } = req.body;
    if (!username || !firstName || !lastName || !email || !birthDate || !basicSalary || !group || !description) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const { data, error } = await supabase
            .from('employees')
            .insert([
                {
                    username,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    birth_date: birthDate,
                    basic_salary: basicSalary,
                    status,
                    group_name: group,
                    description,
                },
            ])
            .select()
            .single();
        if (error) {
            console.error('Error creating employee:', error);
            if (error.code === '23505') {
                return res.status(409).json({ message: `An employee with that ${error.details.includes('username') ? 'username' : 'email'} already exists.` });
            }
            return res.status(500).json({ message: 'Failed to create employee' });
        }
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error deleting employee:', error);
            return res.status(500).json({ message: 'Failed to delete employee' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
