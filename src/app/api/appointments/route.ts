import { NextRequest, NextResponse } from 'next/server';

const appointments: Record<string, any> = {};

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg1 = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  const seg2 = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return 'APT-' + seg1 + '-' + seg2;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = generateId();
    const appointment = {
      id,
      ...body,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    appointments[id] = appointment;
    return NextResponse.json({ success: true, confirmationId: id, appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to book appointment' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const apt = appointments[id];
    if (apt) return NextResponse.json({ success: true, appointment: apt });
    return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, appointments: Object.values(appointments) });
}