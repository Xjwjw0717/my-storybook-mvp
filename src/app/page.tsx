// src/app/page.tsx

'use client'; // 这是一个客户端组件，因为它使用了 useState 和事件处理

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState(''); // 用户输入的提示词
  const [outline, setOutline] = useState(''); // AI 生成的故事大纲
  const [loading, setLoading] = useState(false); // 加载状态
  const [error, setError] = useState(''); // 错误信息
  const [step, setStep] = useState(1); // 步骤控制：1=输入提示词, 2=大纲确认

  // 处理“开始创作”或“重新生成大纲”按钮点击
  const handleGenerateOutline = async () => {
    setError(''); // 清除之前的错误信息
    setLoading(true); // 设置加载状态为 true
    setOutline(''); // 清空旧大纲

    try {
      const response = await fetch('/api/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }), // 将提示词发送到后端 API
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成大纲失败。');
      }

      const data = await response.json();
      setOutline(data.outline); // 更新大纲状态
      setStep(2); // 切换到大纲确认步骤

    } catch (err: any) {
      console.error('API 调用失败:', err);
      setError(err.message || '网络或服务器错误，请稍后再试。');
    } finally {
      setLoading(false); // 无论成功或失败，都结束加载状态
    }
  };

  // 处理大纲文本区域的修改
  const handleOutlineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOutline(e.target.value);
  };

  // 处理“确认大纲并继续”按钮点击 (MVP 阶段仅作占位)
  const handleConfirmOutline = () => {
    alert('大纲已确认！此功能将在后续步骤中连接到故事生成API。');
    // 在实际项目中，这里会调用下一个 API 来生成完整故事
    // setStep(3); // 切换到下一个步骤
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full text-center">
        {step === 1 && (
          <>
            <h1 className="text-4xl font-bold text-gray-800 mb-6 font-inter">
              为你的孩子创作专属故事绘本
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              输入一个故事主题或关键词，让AI帮你构思奇妙的冒险！
            </p>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg mb-6 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y min-h-[100px]"
              placeholder="例如：一只勇敢的小猫的冒险故事"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            <button
              onClick={handleGenerateOutline}
              disabled={loading || !prompt.trim()} // 禁用按钮，如果正在加载或提示词为空
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '正在构思...' : '开始创作'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 font-inter">
              故事大纲
            </h1>
            {loading ? (
              <div className="text-center text-blue-600 text-lg">
                <p>AI 正在生成大纲，请稍候...</p>
                {/* 简单的加载动画，可以替换为更复杂的 */}
                <div className="animate-pulse mt-4 h-4 bg-blue-200 rounded w-3/4 mx-auto"></div>
                <div className="animate-pulse mt-2 h-4 bg-blue-200 rounded w-1/2 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-lg mb-4">{error}</div>
            ) : (
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg mb-6 text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 resize-y min-h-[200px]"
                value={outline}
                onChange={handleOutlineChange}
                rows={10}
              />
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGenerateOutline} // 重新生成大纲
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '重新构思...' : '重新生成大纲'}
              </button>
              <button
                onClick={handleConfirmOutline} // 确认大纲
                disabled={loading || !outline.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认大纲并继续
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
