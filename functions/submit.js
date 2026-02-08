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
    const cleanName = name ? name.substring(0, 10).trim() : "";
    
    if (!cleanName || typeof score !== 'number') {
      return new Response(JSON.stringify({ error: '数据格式不正确' }), { status: 400, headers });
    }

    // 1. 检查是否存在同名玩家
    const existing = await env.DB.prepare(
      'SELECT id, score FROM rankings WHERE name = ?'
    ).bind(cleanName).first();

    if (existing) {
      // 2. 如果新分数低于或等于已有记录
      if (score < existing.score) {
        return new Response(JSON.stringify({ 
          success: false, 
          code: 'NAME_TAKEN_HIGHER_SCORE',
          message: '该名字已有更高纪录，请换个名字或挑战更高分' 
        }), { status: 409, headers });
      } else {
        // 3. 如果新分数更高或相等，则覆盖旧纪录（更新分数和时间）
        await env.DB.prepare(
          'UPDATE rankings SET score = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(score, existing.id).run();
        
        return new Response(JSON.stringify({ success: true, action: 'updated' }), { headers });
      }
    }

    // 4. 不存在同名，直接插入
    await env.DB.prepare(
      'INSERT INTO rankings (name, score) VALUES (?, ?)'
    ).bind(cleanName, score).run();

    return new Response(JSON.stringify({ success: true, action: 'inserted' }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
