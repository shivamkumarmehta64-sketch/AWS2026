import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const mobileLanUrl = `${protocol}://${host}/mobile`;
  const ip = host.split(':')[0];

  return NextResponse.json({
    success: true,
    lanIp: ip,
    allIps: [ip],
    port: host.includes(':') ? Number(host.split(':')[1]) : (protocol === 'https' ? 443 : 80),
    mobileLanUrl,
    serverTime: new Date().toISOString(),
  });
}
