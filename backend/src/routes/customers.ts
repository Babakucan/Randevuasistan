import { Router } from 'express';
import { supabase, TABLES } from '../config/database';
import { validateCreateCustomer, validateUpdateCustomer } from '../middleware/validation';
import { authenticateUser, requireSalonProfile } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);
router.use(requireSalonProfile);

// Get all customers for the salon
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from(TABLES.CUSTOMERS)
      .select('*', { count: 'exact' })
      .eq('salon_id', req.user!.salon_id)
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await query;

    // Get paginated results
    const { data: customers, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customers'
    });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('*')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer'
    });
  }
});

// Create new customer
router.post('/', validateCreateCustomer, async (req, res) => {
  try {
    const { name, phone, email, birth_date, notes, preferences } = req.body;

    // Check if customer with same phone already exists
    const { data: existingCustomer } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('id')
      .eq('salon_id', req.user!.salon_id)
      .eq('phone', phone)
      .single();

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this phone number already exists'
      });
    }

    // Create customer
    const { data: customer, error } = await supabase
      .from(TABLES.CUSTOMERS)
      .insert({
        salon_id: req.user!.salon_id,
        name: name.toUpperCase(), // Convert to uppercase as per user preference
        phone,
        email,
        birth_date,
        notes,
        preferences
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
      message: 'Customer created successfully',
      data: customer
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// Update customer
router.put('/:id', validateUpdateCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if customer exists and belongs to the salon
    const { data: existingCustomer } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check for phone number conflicts if phone is being updated
    if (updateData.phone) {
      const { data: phoneConflict } = await supabase
        .from(TABLES.CUSTOMERS)
        .select('id')
        .eq('salon_id', req.user!.salon_id)
        .eq('phone', updateData.phone)
        .neq('id', id)
        .single();

      if (phoneConflict) {
        return res.status(400).json({
          success: false,
          error: 'Customer with this phone number already exists'
        });
      }
    }

    // Convert name to uppercase if it's being updated
    if (updateData.name) {
      updateData.name = updateData.name.toUpperCase();
    }

    // Update customer
    const { data: customer, error } = await supabase
      .from(TABLES.CUSTOMERS)
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
      message: 'Customer updated successfully',
      data: customer
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer has any appointments
    const { data: appointments } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('id')
      .eq('customer_id', id)
      .limit(1);

    if (appointments && appointments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete customer with existing appointments'
      });
    }

    const { error } = await supabase
      .from(TABLES.CUSTOMERS)
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
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
});

// Get customer appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Check if customer belongs to the salon
    const { data: customer } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const { data: appointments, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select(`
        *,
        service:services(name, duration, price),
        employee:employees(name, position)
      `)
      .eq('customer_id', id)
      .eq('salon_id', req.user!.salon_id)
      .order('start_time', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Get customer appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer appointments'
    });
  }
});

export default router;
