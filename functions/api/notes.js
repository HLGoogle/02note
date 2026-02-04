/**
 * Cloudflare Pages 后端处理逻辑
 */
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };
  const ADMIN_PWD = '273573221';

  // 1. 新增 (POST)
  if (request.method === 'POST') {
    try {
      const { content, is_pinned } = await request.json();
      await env.DB.prepare('INSERT INTO notes (content, is_pinned) VALUES (?, ?)')
        .bind(content.trim(), is_pinned ? 1 : 0)
        .run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // 2. 更新 (PUT) - 支持内容和置顶状态更新
  if (request.method === 'PUT') {
    try {
      const { id, content, is_pinned, password } = await request.json();
      if (password !== ADMIN_PWD) {
        return new Response(JSON.stringify({ success: false, error: '密码错误' }), { status: 403, headers });
      }
      await env.DB.prepare('UPDATE notes SET content = ?, is_pinned = ? WHERE id = ?')
        .bind(content.trim(), is_pinned ? 1 : 0, id)
        .run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // 3. 删除 (DELETE)
  if (request.method === 'DELETE') {
    try {
      const { id, password } = await request.json();
      if (password !== ADMIN_PWD) {
        return new Response(JSON.stringify({ success: false, error: '密码错误' }), { status: 403, headers });
      }
      await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // 4. 获取 (GET)
  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare('SELECT * FROM notes ORDER BY is_pinned DESC, created_at DESC').all();
      return new Response(JSON.stringify(results), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
