interface Env {
  'best-motos-db': D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env['best-motos-db'];
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return new Response(
        JSON.stringify({ success: false, error: '비밀번호를 입력해주세요.' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 관리자 비밀번호 확인
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

    // 비밀번호 확인 (실제 환경에서는 해시 비교 필요)
    if ((admin as any).password !== password) {
      return new Response(
        JSON.stringify({ success: false, error: '비밀번호가 일치하지 않습니다.' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 세션 쿠키 생성 (간단한 토큰 기반)
    const sessionToken = crypto.randomUUID();
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24시간

    return new Response(
      JSON.stringify({ success: true, token: sessionToken }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '로그인 중 오류가 발생했습니다.',
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

