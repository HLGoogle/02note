/**
 * Cloudflare Pages 后端处理逻辑
 * 支持逻辑：获取、保存、带密码删除
 */
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };
  
  // 管理员密码（明文形式）
  const ADMIN_PWD = '273573221';

  // --- 1. 新增笔记 (POST) ---
  if (request.method === 'POST') {
    try {
      const { content } = await request.json();
      if (!content || content.trim().length === 0) {
        return new Response(JSON.stringify({ success: false, error: '内容不能为空' }), { status: 400, headers });
      }
      // 将内容存入 D1
      await env.DB.prepare('INSERT INTO notes (content) VALUES (?)').bind(content.trim()).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // --- 2. 删除笔记 (DELETE) ---
  if (request.method === 'DELETE') {
    try {
      const { id, password } = await request.json();

      // 服务器端二次验证密码
      if (password !== ADMIN_PWD) {
        return new Response(JSON.stringify({ success: false, error: '权限验证失败：密码错误' }), { status: 403, headers });
      }

      // 执行 D1 删除指令
      await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
      
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // --- 3. 获取所有笔记 (GET) ---
  if (request.method === 'GET') {
    try {
      // 按创建时间倒序排列，保证最新的在上面
      const { results } = await env.DB.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
      return new Response(JSON.stringify(results), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
