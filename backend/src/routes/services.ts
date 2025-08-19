import { Router } from 'express';
import { supabase, TABLES } from '../config/database';
import { validateCreateService, validateUpdateService } from '../middleware/validation';
import { authenticateUser, requireSalonProfile } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);
router.use(requireSalonProfile);

// Get all services for the salon
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, is_active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from(TABLES.SERVICES)
      .select('*', { count: 'exact' })
      .eq('salon_id', req.user!.salon_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Get total count
    const { count } = await query;

    // Get paginated results
    const { data: services, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get services'
    });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: service, error } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service'
    });
  }
});

// Create new service
router.post('/', validateCreateService, async (req, res) => {
  try {
    const { name, description, duration, price, category } = req.body;

    // Create service
    const { data: service, error } = await supabase
      .from(TABLES.SERVICES)
      .insert({
        salon_id: req.user!.salon_id,
        name: name.toUpperCase(), // Convert to uppercase as per user preference
        description,
        duration,
        price,
        category
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
      message: 'Service created successfully',
      data: service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service'
    });
  }
});

// Update service
router.put('/:id', validateUpdateService, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if service exists and belongs to the salon
    const { data: existingService } = await supabase
      .from(TABLES.SERVICES)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Convert name to uppercase if it's being updated
    if (updateData.name) {
      updateData.name = updateData.name.toUpperCase();
    }

    // Update service
    const { data: service, error } = await supabase
      .from(TABLES.SERVICES)
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
      message: 'Service updated successfully',
      data: service
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service'
    });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service has any appointments
    const { data: appointments } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('id')
      .eq('service_id', id)
      .limit(1);

    if (appointments && appointments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete service with existing appointments'
      });
    }

    // Check if service is assigned to any employees
    const { data: employeeServices } = await supabase
      .from(TABLES.EMPLOYEE_SERVICES)
      .select('id')
      .eq('service_id', id)
      .limit(1);

    if (employeeServices && employeeServices.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete service that is assigned to employees'
      });
    }

    const { error } = await supabase
      .from(TABLES.SERVICES)
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
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
});

// Get service categories
router.get('/categories/list', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from(TABLES.SERVICES)
      .select('category')
      .eq('salon_id', req.user!.salon_id)
      .not('category', 'is', null);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Extract unique categories
    const uniqueCategories = [...new Set(categories.map(item => item.category))];

    res.json({
      success: true,
      data: uniqueCategories
    });

  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service categories'
    });
  }
});

// Get services by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const { data: services, error } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('salon_id', req.user!.salon_id)
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get services by category'
    });
  }
});

export default router;
