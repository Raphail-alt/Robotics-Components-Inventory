import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      items (name, category)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Record the transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert(body)
      .select()
      .single();

    if (txError) throw txError;

    // Update item quantity
    const { error: itemError } = await supabase
      .from('items')
      .update({ 
        available_quantity: body.action === 'checkout' 
          ? body.available_quantity - body.quantity 
          : body.available_quantity + body.quantity 
      })
      .eq('id', body.item_id);

    if (itemError) throw itemError;

    return NextResponse.json(transaction, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}