import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo purposes
const applications: Record<string, any> = {};

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg1 = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  const seg2 = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return 'BVS-' + seg1 + '-' + seg2;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = generateId();
    const application = {
      id,
      ...body,
      status: 'submitted',
      statusLabel: 'Submitted',
      submittedAt: new Date().toISOString(),
      updates: [
        { date: new Date().toISOString().split('T')[0], text: 'Application submitted online', status: 'complete' },
        { date: '', text: 'Application review by staff', status: 'pending' },
        { date: '', text: 'Document verification', status: 'pending' },
        { date: '', text: 'Final determination', status: 'pending' },
        { date: '', text: 'Notification sent to applicant', status: 'pending' },
      ],
    };
    applications[id] = application;
    return NextResponse.json({ success: true, confirmationId: id, application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process application' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const app = applications[id];
    if (app) return NextResponse.json({ success: true, application: app });
    return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, applications: Object.values(applications) });
}