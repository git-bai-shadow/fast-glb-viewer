// api/proxy/index.js
export const config = {
  runtime: 'edge', // 启用边缘网络，速度极快
};

export default async function handler(req) {
  // 1. 从 URL 参数中获取目标地址
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response('请提供 "url" 参数', { status: 400 });
  }

  try {
    // 2. 服务器去请求那个被拦截的地址
    const response = await fetch(url, {
      // 如果是 Meshy 这种有防盗链的，有时需要伪造一下来源
      headers: {
        Origin: 'https://www.meshy.ai',
        Referer: 'https://www.meshy.ai/',
      },
    });

    if (!response.ok) {
      throw new Error('模型下载失败');
    }

    // 3. 把数据转成二进制流
    const blob = await response.blob();

    // 4. 返回给前端，并设置正确的头部，告诉浏览器“这是允许的”
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Access-Control-Allow-Origin': '*', // 关键：允许任何人访问
      },
    });
  } catch (error) {
    return new Response('代理失败: ' + error.message, { status: 500 });
  }
}