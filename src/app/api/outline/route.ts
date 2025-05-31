// src/app/api/outline/route.ts

import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// 从 Vercel 环境变量中获取 OpenRouter API Key
// **请确保在 Vercel 项目设置中配置了 OPENROUTER_API_KEY 环境变量**
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 从 Vercel 环境变量中获取站点信息（可选，用于 OpenRouter 排名）
// **请确保在 Vercel 项目设置中配置了 YOUR_SITE_URL 和 YOUR_SITE_NAME 环境变量**
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || "https://your-storybook-app.vercel.app"; // **请替换为您的实际网站 URL**
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || "我的AI故事绘本"; // **请替换为您的实际网站名称**

// 初始化 OpenAI 客户端，配置为指向 OpenRouter API
const client = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // OpenRouter 的 API 基础 URL
});

// 处理 POST 请求，用于生成故事大纲
export async function POST(req: Request) {
  try {
    // 解析请求体，获取用户提供的提示词
    const { prompt } = await req.json();

    // 检查提示词是否存在
    if (!prompt) {
      return NextResponse.json({ error: "缺少提示词。" }, { status: 400 });
    }

    // 检查 API Key 是否已配置
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: "OpenRouter API Key 未配置，请联系管理员或检查 Vercel 环境变量。" }, { status: 500 });
    }

    // 调用 OpenRouter API 生成故事大纲
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await (client.chat.completions as any).create({ // 修正点：添加了 // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // OpenRouter 特有的额外 HTTP 头部信息
      extra_headers: {
        "HTTP-Referer": YOUR_SITE_URL, // 网站 URL，用于 OpenRouter 上的排名
        "X-Title": YOUR_SITE_NAME,     // 网站标题，用于 OpenRouter 上的排名
      },
      // OpenRouter 特有的额外请求体（此处为空）
      extra_body: {},
      // 指定要使用的模型，这里是 DeepSeek V3
      model: "deepseek/deepseek-chat",
      // 对话消息数组，定义 AI 的角色和用户输入
      messages: [
        {
          "role": "system",
          "content": "你是一位专业的儿童故事作家，请根据用户的提示词，为孩子生成一个简单、积极、富有想象力的故事大纲。大纲应包含：角色、背景、开端、冲突、解决、结局。请使用中文生成，并且以清晰的分点或段落形式呈现大纲。"
        },
        {
          "role": "user",
          "content": `请生成一个故事大纲，主题是："${prompt}"`
        }
      ],
      // 模型生成参数
      temperature: 0.7, // 控制生成内容的随机性和创造性（0.0-1.0）
      max_tokens: 200,  // 限制生成大纲的最大长度
    });

    // 提取 AI 生成的大纲内容
    const outlineContent = completion.choices[0].message.content;

    // 返回成功响应，包含生成的大纲
    return NextResponse.json({ outline: outlineContent }, { status: 200 });

  } catch (error: unknown) { // 修正点：将 catch(error: any) 改为 catch(error: unknown)
    console.error("生成故事大纲失败:", error);
    // 对错误进行更安全的类型判断
    if (error instanceof Error) {
        if ('code' in error && error.code === 'authentication_error') {
            return NextResponse.json({ error: "API 认证失败，请检查 OpenRouter API Key 配置是否正确。" }, { status: 401 });
        }
        return NextResponse.json({ error: `生成故事大纲时发生错误: ${error.message || "未知错误"}` }, { status: 500 });
    }
    return NextResponse.json({ error: "生成故事大纲时发生未知错误，请稍后再试。" }, { status: 500 });
  }
}
