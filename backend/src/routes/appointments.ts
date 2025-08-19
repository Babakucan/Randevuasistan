import { Router } from 'express';
import { supabase, TABLES } from '../config/database';
import { validateCreateAppointment, validateUpdateAppointment } from '../middleware/validation';
import { authenticateUser, requireSalonProfile } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateUser);
router.use(requireSalonProfile);

// Get all appointments for the salon
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, start_date, end_date } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from(TABLES.APPOINTMENTS)
      .select(`
        *,
        customer:customers(name, phone, email),
        service:services(name, duration, price),
        employee:employees(name, position)
      `)
      .eq('salon_id', req.user!.salon_id)
      .order('start_time', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('start_time', start_date);
    }

    if (end_date) {
      query = query.lte('start_time', end_date);
    }

    // Get total count
    const { count } = await query;

    // Get paginated results
    const { data: appointments, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get appointments'
    });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: appointment, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select(`
        *,
        customer:customers(*),
        service:services(*),
        employee:employees(*)
      `)
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get appointment'
    });
  }
});

// Create new appointment
router.post('/', validateCreateAppointment, async (req, res) => {
  try {
    const { customer_id, service_id, start_time, end_time, notes, source = 'manual' } = req.body;

    // Check if customer belongs to the salon
    const { data: customer } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('id')
      .eq('id', customer_id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found or does not belong to this salon'
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
      return res.status(400).json({
        success: false,
        error: 'Service not found or does not belong to this salon'
      });
    }

    // Check for time conflicts
    const { data: conflicts } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('id')
      .eq('salon_id', req.user!.salon_id)
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`)
      .neq('status', 'cancelled');

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Time slot conflicts with existing appointment'
      });
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .insert({
        salon_id: req.user!.salon_id,
        customer_id,
        service_id,
        start_time,
        end_time,
        notes,
        source
      })
      .select(`
        *,
        customer:customers(name, phone, email),
        service:services(name, duration, price)
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
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
});

// Update appointment
router.put('/:id', validateUpdateAppointment, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if appointment exists and belongs to the salon
    const { data: existingAppointment } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('id')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check for time conflicts if time is being updated
    if (updateData.start_time || updateData.end_time) {
      const startTime = updateData.start_time || existingAppointment.start_time;
      const endTime = updateData.end_time || existingAppointment.end_time;

      const { data: conflicts } = await supabase
        .from(TABLES.APPOINTMENTS)
        .select('id')
        .eq('salon_id', req.user!.salon_id)
        .neq('id', id)
        .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)
        .neq('status', 'cancelled');

      if (conflicts && conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Time slot conflicts with existing appointment'
        });
      }
    }

    // Update appointment
    const { data: appointment, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .update(updateData)
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .select(`
        *,
        customer:customers(name, phone, email),
        service:services(name, duration, price)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from(TABLES.APPOINTMENTS)
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
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment'
    });
  }
});

// Get appointments by date range
router.get('/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;

    const { data: appointments, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select(`
        *,
        customer:customers(name, phone, email),
        service:services(name, duration, price),
        employee:employees(name, position)
      `)
      .eq('salon_id', req.user!.salon_id)
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time', { ascending: true });

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
    console.error('Get appointments by range error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get appointments'
    });
  }
});

export default router;
