interface Env {
  'best-motos-db': D1Database;
}

// 인증 확인 함수
function checkAuth(request: Request): boolean {
  const cookieHeader = request.headers.get('Cookie');
  return cookieHeader ? cookieHeader.includes('admin_session=') : false;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env['best-motos-db'];
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 인증 확인
  if (!checkAuth(request)) {
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
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 현재 관리자 정보 조회
    const admin = await db
      .prepare('SELECT * FROM admin WHERE id = 1')
      .first();

    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: '관리자 정보를 찾을 수 없습니다.' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 현재 비밀번호 확인
    if ((admin as any).password !== currentPassword) {
      return new Response(
        JSON.stringify({ success: false, error: '현재 비밀번호가 일치하지 않습니다.' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 새 비밀번호로 업데이트
    await db
      .prepare('UPDATE admin SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
      .bind(newPassword)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: '비밀번호가 변경되었습니다.' }),
      {
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
        error: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

