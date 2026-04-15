// api/proxy/index.js

export const config = {
  runtime: 'edge', // 使用 Vercel 边缘网络
};

export default async function handler(req) {
  // 1. 获取目标 URL
  const targetUrl = req.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing "url" parameter', { status: 400 });
  }

  try {
    // 2. 发起请求去抓取模型
    // 注意：这里我们直接透传，不设置复杂的 Headers，防止被 Meshy 识别为机器人拦截
    const response = await fetch(targetUrl);

    if (!response.ok) {
      // 如果 Meshy 返回 403 或 404，直接返回错误
      return new Response(`Failed to fetch model: ${response.statusText}`, { status: response.status });
    }

    // 3. 获取模型数据
    const data = await response.arrayBuffer();

    // 4. 返回数据给前端
    return new Response(data, {
      status: 200,
      headers: {
        // 强制告诉浏览器这是一个二进制模型文件
        'Content-Type': 'model/gltf-binary',
        // 允许你的网页访问这个资源
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    // 5. 捕获代码层面的错误（比如 URL 格式不对）
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}
