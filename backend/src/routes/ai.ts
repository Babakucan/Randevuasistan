import { Router } from 'express';
import { supabase, TABLES } from '../config/database';
import { validateAIConversation } from '../middleware/validation';
import { authenticateUser, requireSalonProfile, optionalAuth } from '../middleware/auth';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Apply authentication to all routes
router.use(optionalAuth);

// Process AI conversation
router.post('/conversation', validateAIConversation, async (req, res) => {
  try {
    const { customer_phone, platform, message } = req.body;
    const salon_id = req.user?.salon_id;

    if (!salon_id) {
      return res.status(400).json({
        success: false,
        error: 'Salon ID required for AI conversation'
      });
    }

    // Get or create conversation
    let { data: conversation } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .select('*')
      .eq('salon_id', salon_id)
      .eq('customer_phone', customer_phone)
      .eq('platform', platform)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from(TABLES.AI_CONVERSATIONS)
        .insert({
          salon_id,
          customer_phone,
          platform,
          messages: []
        })
        .select()
        .single();

      if (createError) {
        return res.status(400).json({
          success: false,
          error: createError.message
        });
      }

      conversation = newConversation;
    }

    // Get salon information for context
    const { data: salon } = await supabase
      .from(TABLES.SALON_PROFILES)
      .select('name, owner_name, working_hours')
      .eq('id', salon_id)
      .single();

    // Get available services
    const { data: services } = await supabase
      .from(TABLES.SERVICES)
      .select('name, description, duration, price, category')
      .eq('salon_id', salon_id)
      .eq('is_active', true);

    // Prepare conversation context
    const messages = conversation.messages || [];
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Create system prompt
    const systemPrompt = `Sen ${salon?.name || 'salon'} için çalışan bir AI asistanısın. 
    
Salon Bilgileri:
- Salon Adı: ${salon?.name || 'Bilinmiyor'}
- Sahip: ${salon?.owner_name || 'Bilinmiyor'}
- Çalışma Saatleri: ${JSON.stringify(salon?.working_hours || {})}

Mevcut Hizmetler:
${services?.map(service => `- ${service.name}: ${service.description || 'Açıklama yok'} (${service.duration} dakika, ${service.price} TL)`).join('\n') || 'Hizmet bulunamadı'}

Görevlerin:
1. Müşteri sorularını yanıtla
2. Randevu alma isteklerini anla
3. Hizmet bilgilerini ver
4. Çalışma saatlerini belirt
5. Nazik ve profesyonel ol
6. Türkçe konuş

Randevu almak için müşteriden şu bilgileri iste:
- İstediği hizmet
- Tercih ettiği tarih ve saat
- İsim bilgisi (eğer yeni müşteriyse)

Eğer müşteri randevu almak istiyorsa, "RANDEVU_TALEP" kelimesini kullan.`;

    // Prepare conversation for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Üzgünüm, şu anda yanıt veremiyorum.';

    // Add AI response to conversation
    messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    // Update conversation
    const { error: updateError } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .update({ messages })
      .eq('id', conversation.id);

    if (updateError) {
      console.error('Update conversation error:', updateError);
    }

    // Check if this is an appointment request
    const isAppointmentRequest = aiResponse.includes('RANDEVU_TALEP') || 
                                message.toLowerCase().includes('randevu') ||
                                message.toLowerCase().includes('rezervasyon');

    res.json({
      success: true,
      data: {
        response: aiResponse,
        conversation_id: conversation.id,
        is_appointment_request: isAppointmentRequest
      }
    });

  } catch (error) {
    console.error('AI conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'AI conversation failed'
    });
  }
});

// Get conversation history
router.get('/conversations', authenticateUser, requireSalonProfile, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from(TABLES.AI_CONVERSATIONS)
      .select('*', { count: 'exact' })
      .eq('salon_id', req.user!.salon_id)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Get total count
    const { count } = await query;

    // Get paginated results
    const { data: conversations, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: conversations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations'
    });
  }
});

// Get conversation by ID
router.get('/conversations/:id', authenticateUser, requireSalonProfile, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: conversation, error } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .select('*')
      .eq('id', id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation'
    });
  }
});

// Update conversation status
router.put('/conversations/:id/status', authenticateUser, requireSalonProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const { data: conversation, error } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .update({ status })
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
      message: 'Conversation status updated successfully',
      data: conversation
    });

  } catch (error) {
    console.error('Update conversation status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation status'
    });
  }
});

// Analyze conversation sentiment
router.post('/analyze/:conversation_id', authenticateUser, requireSalonProfile, async (req, res) => {
  try {
    const { conversation_id } = req.params;

    // Get conversation
    const { data: conversation, error } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .select('messages')
      .eq('id', conversation_id)
      .eq('salon_id', req.user!.salon_id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Prepare messages for analysis
    const userMessages = conversation.messages
      .filter((msg: any) => msg.role === 'user')
      .map((msg: any) => msg.content)
      .join(' ');

    if (!userMessages) {
      return res.status(400).json({
        success: false,
        error: 'No user messages to analyze'
      });
    }

    // Analyze sentiment with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Bu metni analiz et ve şu bilgileri JSON formatında ver:\n1. Duygu analizi (positive, negative, neutral)\n2. Memnuniyet skoru (1-10)\n3. Ana konular\n4. Aksiyon gerektiren noktalar'
        },
        {
          role: 'user',
          content: userMessages
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content || '';

    res.json({
      success: true,
      data: {
        conversation_id,
        analysis: analysis
      }
    });

  } catch (error) {
    console.error('Analyze conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze conversation'
    });
  }
});

export default router;
