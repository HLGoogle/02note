/**
 * 逃出黑暗森林 - 排行榜后端逻辑
 * 功能：提交分数 (POST /submit) 和 获取前50名 (GET /rankings)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 统一设置跨域头，允许你的游戏网页访问这个接口
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理浏览器预检请求 (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // 路由 1：获取排行榜数据 (GET /rankings)
    if (url.pathname === '/rankings' && request.method === 'GET') {
      try {
        // 从 D1 数据库查询分数最高的 50 个人
        const { results } = await env.DB.prepare(
          'SELECT name, score FROM rankings ORDER BY score DESC, created_at ASC LIMIT 50'
        ).all();
        return new Response(JSON.stringify(results), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    // 路由 2：提交新分数 (POST /submit)
    if (url.pathname === '/submit' && request.method === 'POST') {
      try {
        const { name, score } = await request.json();
        
        // 基础校验：名字不能为空，分数必须是数字
        if (!name || typeof score !== 'number') {
          return new Response(JSON.stringify({ error: '数据格式不正确' }), { status: 400, headers });
        }

        // 将数据插入 D1 数据库
        await env.DB.prepare(
          'INSERT INTO rankings (name, score) VALUES (?, ?)'
        ).bind(name.substring(0, 10), score).run();

        return new Response(JSON.stringify({ success: true }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    return new Response('API 路径不存在', { status: 404 });
  },
};
