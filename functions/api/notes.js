export async function onRequest(context) {
  const { request, env } = context;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Permissions-Policy': 'compute-pressure=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method === 'POST') {
    try {
      const { content } = await request.json();
      await env.DB.prepare(
        'INSERT INTO notes (content) VALUES (?)'
      ).bind(content).run();
      
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { headers, status: 500 }
      );
    }
  }

  try {
    const notes = await env.DB.prepare(
      'SELECT * FROM notes ORDER BY created_at DESC'
    ).all();
    
    return new Response(JSON.stringify(notes), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { headers, status: 500 }
    );
  }
}
