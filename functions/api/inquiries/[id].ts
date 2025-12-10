interface Env {
  'best-motos-db': D1Database;
}

// 인증 확인 함수
function checkAuth(request: Request): boolean {
  const cookieHeader = request.headers.get('Cookie');
  return cookieHeader ? cookieHeader.includes('admin_session=') : false;
}

export async function onRequest(context: { request: Request; env: Env; params: { id: string } }) {
  const { request, env, params } = context;
  const db = env['best-motos-db'];
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 인증 확인 (PUT, DELETE 요청만)
  if ((request.method === 'PUT' || request.method === 'DELETE') && !checkAuth(request)) {
    return new Response(
      JSON.stringify({ success: false, error: '인증이 필요합니다.' }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const id = params.id;

    if (request.method === 'GET') {
      // 단일 문의 조회
      const result = await db
        .prepare('SELECT * FROM inquiries WHERE id = ?')
        .bind(id)
        .first();

      if (!result) {
        return new Response(
          JSON.stringify({ success: false, error: '문의를 찾을 수 없습니다.' }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: result }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (request.method === 'PUT') {
      // 문의 상태 업데이트
      const body = await request.json();
      const { status } = body;

      if (!status) {
        return new Response(
          JSON.stringify({ success: false, error: '상태가 필요합니다.' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      await db
        .prepare('UPDATE inquiries SET status = ? WHERE id = ?')
        .bind(status, id)
        .run();

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (request.method === 'DELETE') {
      // 문의 삭제
      await db
        .prepare('DELETE FROM inquiries WHERE id = ?')
        .bind(id)
        .run();

      return new Response(
        JSON.stringify({ success: true }),
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

