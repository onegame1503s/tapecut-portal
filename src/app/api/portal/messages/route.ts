import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Added GET handler to resolve 405 Method Not Allowed
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('portal_messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown GET error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender_id, receiver_id, deal_id, message_text } = body;

    // Basic validation
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
    // Updated to return the actual crash reason instead of a generic 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}