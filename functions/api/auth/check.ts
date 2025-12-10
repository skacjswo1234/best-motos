interface Env {
  'best-motos-db': D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request } = context;
  
  const cookieHeader = request.headers.get('Cookie');
  const hasSession = cookieHeader && cookieHeader.includes('admin_session=');

  return new Response(
    JSON.stringify({ 
      success: true, 
      authenticated: !!hasSession 
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

