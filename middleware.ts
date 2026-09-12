import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Known malicious user agents and automated scrapers
const BLOCKED_USER_AGENTS = [
  'python-requests',
  'curl',
  'wget',
  'postmanruntime',
  'go-http-client',
  'java',
  'nmap',
  'sqlmap',
  'nikto',
  'masscan',
  'zgrab',
];

// Allowed origins for CORS (Add exact production domains here later)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://jatayu-qms.vercel.app',
  'https://jatayu.pages.dev',
  'https://jatayu.gov.in', // Mock government domain
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const pathname = request.nextUrl.pathname;

  // 1. Bot Mitigation (WAF Lite)
  // Block requests that match known automated vulnerability scanners or scraping scripts
  if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return NextResponse.json(
      { error: 'Forbidden. Automated scraping and malicious bots are blocked by JATAYU Edge Firewall.' },
      { status: 403 }
    );
  }

  // 2. Strict API Security Controls
  if (pathname.startsWith('/api')) {
    // 2a. Require standard HTTP Methods
    const allowedMethods = ['GET', 'POST', 'OPTIONS'];
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        { error: 'Method Not Allowed.' },
        { status: 405, headers: { Allow: 'GET, POST, OPTIONS' } }
      );
    }

    // 2b. Validate Origin / Referer (CORS strict enforcement)
    // Only apply strict origin check on POST/mutations to prevent CSRF and external hijack
    if (request.method === 'POST') {
      const origin = request.headers.get('origin') || request.headers.get('referer');
      if (!origin || !ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
        return NextResponse.json(
          { error: 'Unauthorized Cross-Origin Request. Blocked by CORS.' },
          { status: 401 }
        );
      }
    }
  }

  // Handle standard OPTIONS preflight requests for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 3. Fallthrough - Pass the request to the main application
  const response = NextResponse.next();

  // Attach standard Edge headers for tracking/debugging
  response.headers.set('X-JATAYU-Edge-Secured', 'true');
  const region = request.headers.get('cf-ipcity') || request.headers.get('x-vercel-ip-city') || 'global';
  response.headers.set('X-Edge-Region', region);

  return response;
}

export const config = {
  // Apply middleware to all routes except static files, Next.js internal assets, and images
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, audio, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
