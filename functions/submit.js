export async function onRequest(context) {
  const { request, env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { name, score } = await request.json();
    
    if (!name || typeof score !== 'number') {
      return new Response(JSON.stringify({ error: '数据格式不正确' }), { status: 400, headers });
    }

    await env.DB.prepare(
      'INSERT INTO rankings (name, score) VALUES (?, ?)'
    ).bind(name.substring(0, 10), score).run();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
