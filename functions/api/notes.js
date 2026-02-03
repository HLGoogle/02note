//后端文件，对接 Cloudflare 的服务器上（边缘网络），直接与 D1 数据库打交道

export async function onRequest(context) {
  const { request, env } = context;

  // 1. 统一响应头（移除了冗余的 CORS，因为是在同源环境下运行）
  const headers = { 'Content-Type': 'application/json' };

  // 2. 处理 POST 请求：保存笔记
  if (request.method === 'POST') {
    try {
      const { content } = await request.json();

      // 逻辑增强：校验内容是否为空或全为空格
      if (!content || content.trim().length === 0) {
        return new Response(JSON.stringify({ success: false, error: '内容不能为空' }), { status: 400, headers });
      }

      // 执行 SQL 插入
      await env.DB.prepare(
        'INSERT INTO notes (content) VALUES (?)'
      ).bind(content.trim()).run();
      
      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // 3. 处理 GET 请求：获取列表
  if (request.method === 'GET') {
    try {
      // 从 D1 读取并按时间倒序
      const { results } = await env.DB.prepare(
        'SELECT * FROM notes ORDER BY created_at DESC'
      ).all();
      
      // 直接返回数组，让前端处理更简单
      return new Response(JSON.stringify(results), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
    }
  }

  // 4. 其他方法返回 405
  return new Response('Method Not Allowed', { status: 405 });
}
