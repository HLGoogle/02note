export async function onRequest(context) {
  const { request, env } = context;
  
  // 允许跨域访问
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // 处理 POST 请求（保存笔记）
  if (request.method === 'POST') {
    const { content } = await request.json();
    await env.DB.prepare(
      'INSERT INTO notes (content) VALUES (?)'
    ).bind(content).run();
    
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  // 处理 GET 请求（获取笔记）
  const notes = await env.DB.prepare(
    'SELECT * FROM notes ORDER BY created_at DESC'
  ).all();
  
  return new Response(JSON.stringify(notes), { headers });
}
