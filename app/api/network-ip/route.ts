import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const interfaces = os.networkInterfaces();
  const candidates: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;

    for (const net of netList) {
      // IPv4, non-internal (not 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        // Exclude virtual adapters like Docker/WSL if real Wi-Fi/Ethernet exists
        candidates.push(net.address);
      }
    }
  }

  // Prioritize typical Wi-Fi / local LAN ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const lanIp = candidates.find(ip => ip.startsWith('192.168.')) ||
                candidates.find(ip => ip.startsWith('10.')) ||
                candidates[0] ||
                '127.0.0.1';

  return NextResponse.json({
    success: true,
    lanIp,
    allIps: candidates,
    port: 3000,
    mobileLanUrl: `http://${lanIp}:3000/mobile`,
    serverTime: new Date().toISOString(),
  });
}
