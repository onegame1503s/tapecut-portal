import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender_id, receiver_id, deal_id, message_text } = body;

    // Basic validation to ensure we have the required data
    if (!sender_id || !receiver_id || !message_text) {
      return NextResponse.json(
        { error: 'Missing required fields (sender_id, receiver_id, message_text)' },
        { status: 400 }
      );
    }

    // Insert the message using the admin client
    const { data, error } = await supabaseAdmin
      .from('portal_messages')
      .insert([
        {
          sender_id,
          receiver_id,
          deal_id: deal_id || null, 
          message_text,
          is_read: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}