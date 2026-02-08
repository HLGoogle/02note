export async function onRequest(context) {
  const { request, env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // 1. 处理 GET 请求（获取前 50 名）
  if (request.method === 'GET') {
    try {
      // 这里的 env.DB 必须已经在 Cloudflare 后台绑定
      const { results } = await env.DB.prepare(
        'SELECT name, score FROM rankings ORDER BY score DESC, created_at ASC LIMIT 50'
      ).all();
      return new Response(JSON.stringify(results), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  // 2. 处理 OPTIONS (跨域预检)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
