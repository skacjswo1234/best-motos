interface Env {
  'best-motos-db': D1Database;
}

// 인증 확인 함수
function checkAuth(request: Request): boolean {
  const cookieHeader = request.headers.get('Cookie');
  return cookieHeader ? cookieHeader.includes('admin_session=') : false;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env['best-motos-db'];
  
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 사용자 문의 제출은 인증 불필요 (GET, POST는 모두 인증 불필요)
  // PUT, DELETE는 [id].ts에서 인증 체크

  try {

    if (request.method === 'GET') {
      // 문의 리스트 조회
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || null;
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = 'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT ? OFFSET ?';
      let params: any[] = [limit, offset];

      if (status) {
        query = 'SELECT * FROM inquiries WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params = [status, limit, offset];
      }

      const result = await db.prepare(query).bind(...params).all();
      const totalResult = await db.prepare('SELECT COUNT(*) as total FROM inquiries').first();

      return new Response(
        JSON.stringify({
          success: true,
          data: result.results,
          total: (totalResult as any)?.total || 0,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (request.method === 'POST') {
      // 새 문의 생성
      const body = await request.json();
      const { name, phone, service, message } = body;

      if (!name || !phone || !service) {
        return new Response(
          JSON.stringify({ success: false, error: '필수 필드가 누락되었습니다.' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const result = await db
        .prepare(
          'INSERT INTO inquiries (name, phone, service, message) VALUES (?, ?, ?, ?)'
        )
        .bind(name, phone, service, message || '')
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          id: result.meta.last_row_id,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '서버 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

