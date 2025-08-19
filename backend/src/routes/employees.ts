import { Router } from 'express';
import { supabase, TABLES } from '../config/database';
import { validateCreateEmployee, validateUpdateEmployee } from '../middleware/validation';
import { authenticateUser, requireSalonProfile } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);
router.use(requireSalonProfile);

// Get all employees for the salon
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from(TABLES.EMPLOYEES)
      .select('*', { count: 'exact' })
      .eq('salon_id', req.user!.salon_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Get total count
    const { count } = await query;

    // Get paginated results
    const { data: employees, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get employees'
    });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: employee, error } = await supabase
      .from(TABLES.EMPLOYEES)
      .select('*')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get employee'
    });
  }
});

// Create new employee
router.post('/', validateCreateEmployee, async (req, res) => {
  try {
    const { name, email, phone, position, specialties, working_hours, bio, experience_years, hourly_rate } = req.body;

    // Create employee
    const { data: employee, error } = await supabase
      .from(TABLES.EMPLOYEES)
      .insert({
        salon_id: req.user!.salon_id,
        name: name.toUpperCase(), // Convert to uppercase as per user preference
        email,
        phone,
        position,
        specialties: specialties || [],
        working_hours: working_hours || {},
        bio,
        experience_years: experience_years || 0,
        hourly_rate: hourly_rate || 0
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create employee'
    });
  }
});

// Update employee
router.put('/:id', validateUpdateEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if employee exists and belongs to the salon
    const { data: existingEmployee } = await supabase
      .from(TABLES.EMPLOYEES)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Convert name to uppercase if it's being updated
    if (updateData.name) {
      updateData.name = updateData.name.toUpperCase();
    }

    // Update employee
    const { data: employee, error } = await supabase
      .from(TABLES.EMPLOYEES)
      .update(updateData)
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update employee'
    });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee has any appointments
    const { data: appointments } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('id')
      .eq('employee_id', id)
      .limit(1);

    if (appointments && appointments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete employee with existing appointments'
      });
    }

    const { error } = await supabase
      .from(TABLES.EMPLOYEES)
      .delete()
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete employee'
    });
  }
});

// Get employee services
router.get('/:id/services', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee belongs to the salon
    const { data: employee } = await supabase
      .from(TABLES.EMPLOYEES)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const { data: employeeServices, error } = await supabase
      .from(TABLES.EMPLOYEE_SERVICES)
      .select(`
        *,
        service:services(*)
      `)
      .eq('employee_id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: employeeServices
    });

  } catch (error) {
    console.error('Get employee services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get employee services'
    });
  }
});

// Assign service to employee
router.post('/:id/services', async (req, res) => {
  try {
    const { id } = req.params;
    const { service_id, custom_price } = req.body;

    // Check if employee belongs to the salon
    const { data: employee } = await supabase
      .from(TABLES.EMPLOYEES)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Check if service belongs to the salon
    const { data: service } = await supabase
      .from(TABLES.SERVICES)
      .select('id')
      .eq('id', service_id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Create employee service relationship
    const { data: employeeService, error } = await supabase
      .from(TABLES.EMPLOYEE_SERVICES)
      .insert({
        employee_id: id,
        service_id,
        custom_price
      })
      .select(`
        *,
        service:services(*)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Service assigned to employee successfully',
      data: employeeService
    });

  } catch (error) {
    console.error('Assign service to employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign service to employee'
    });
  }
});

// Remove service from employee
router.delete('/:id/services/:service_id', async (req, res) => {
  try {
    const { id, service_id } = req.params;

    const { error } = await supabase
      .from(TABLES.EMPLOYEE_SERVICES)
      .delete()
      .eq('employee_id', id)
      .eq('service_id', service_id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Service removed from employee successfully'
    });

  } catch (error) {
    console.error('Remove service from employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove service from employee'
    });
  }
});

export default router;
