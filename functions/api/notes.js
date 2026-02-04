/**
 * Cloudflare Pages 后端处理逻辑
 * 支持逻辑：获取、保存、更新、带密码删除
 */
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };
  
  // 管理员密码
  const ADMIN_PWD = '273573221';

  // --- 1. 新增笔记 (POST) ---
  if (request.method === 'POST') {
    try {
      const { content, is_pinned } = await request.json();
      if (!content || content.trim().length === 0) {
        return new Response(JSON.stringify({ success: false, error: '内容不能为空' }), { status: 400, headers });
      }
      // 将内容和置顶状态存入 D1
      await env.DB.prepare('INSERT INTO notes (content, is_pinned) VALUES (?, ?)')
        .bind(content.trim(), is_pinned ? 1 : 0)
        .run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // --- 2. 更新笔记 (PUT) ---
  if (request.method === 'PUT') {
    try {
      const { id, content, password } = await request.json();
      if (password !== ADMIN_PWD) {
        return new Response(JSON.stringify({ success: false, error: '权限验证失败：密码错误' }), { status: 403, headers });
      }
      await env.DB.prepare('UPDATE notes SET content = ? WHERE id = ?')
        .bind(content.trim(), id)
        .run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // --- 3. 删除笔记 (DELETE) ---
  if (request.method === 'DELETE') {
    try {
      const { id, password } = await request.json();
      if (password !== ADMIN_PWD) {
        return new Response(JSON.stringify({ success: false, error: '权限验证失败：密码错误' }), { status: 403, headers });
      }
      await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // --- 4. 获取所有笔记 (GET) ---
  if (request.method === 'GET') {
    try {
      // 排序逻辑：先按 is_pinned 倒序（置顶在前），再按创建时间倒序
      const { results } = await env.DB.prepare('SELECT * FROM notes ORDER BY is_pinned DESC, created_at DESC').all();
      return new Response(JSON.stringify(results), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
