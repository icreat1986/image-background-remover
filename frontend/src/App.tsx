import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

interface UploadResponse {
  original_url?: string;
  processed_url?: string;
  error?: string;
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 自动检测后端 URL
  const getApiBaseUrl = () => {
    // 直接使用公网 IP（临时配置）
    return 'http://170.106.193.53:8000';
    
    // 以下代码暂时注释，待确认环境变量加载后再考虑启用
    /*
    const configuredUrl = import.meta.env.VITE_API_URL;
    if (configuredUrl) {
      return configuredUrl;
    }
    const currentOrigin = window.location.origin;
    const url = new URL(currentOrigin);
    return `${url.protocol}//${url.hostname}:8000`;
    */
  };

  const API_BASE_URL = getApiBaseUrl();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 清除之前的状态
    setError('');
    setProcessedUrl('');
    setShowOriginal(false);

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的文件格式，请上传 JPG、PNG 或 WEBP');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件过大，请上传小于 10MB 的图片');
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // 上传并处理
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}/api/remove-background`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000, // 30秒超时
        }
      );

      if (response.data.processed_url) {
        // 处理相对路径，确保完整的 URL
        const processedUrl = response.data.processed_url.startsWith('http')
          ? response.data.processed_url
          : `${API_BASE_URL}${response.data.processed_url}`;
        setProcessedUrl(processedUrl);
      } else if (response.data.error) {
        setError(response.data.error);
      }
    } catch (err: any) {
      console.error('Processing error:', err);
      if (err.code === 'ECONNREFUSED') {
        setError('无法连接到服务器，请确保后端已启动');
      } else if (err.code === 'ECONNABORTED') {
        setError('处理超时，请重试或使用较小的图片');
      } else {
        setError('处理失败，请重试或更换图片');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `${uploadedFile?.name.replace(/\.[^/.]+$/, '')}-bg-removed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="py-8 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🎨 Image Background Remover
        </h1>
        <p className="text-gray-600 text-lg">
          拖拽或点击上传图片，AI 智能移除背景
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8">
        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-8">
          {!uploadedFile && (
            <div
              {...getRootProps()}
              className={`
                border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${isDragActive
                  ? 'border-purple-400 bg-purple-50 scale-105'
                  : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📷</div>
              {isDragActive ? (
                <p className="text-purple-600 text-xl font-medium">松开鼠标上传图片</p>
              ) : (
                <div>
                  <p className="text-gray-700 text-xl font-medium mb-2">拖拽图片到这里</p>
                  <p className="text-gray-500">或点击选择文件</p>
                  <p className="text-gray-400 text-sm mt-2">支持 JPG、PNG、WEBP（最大 10MB）</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {uploadedFile && (
          <div className="max-w-4xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg">正在处理图片...</p>
              </div>
            )}

            {/* Result */}
            {!loading && processedUrl && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => setShowOriginal(true)}
                    className={`
                      px-6 py-3 rounded-lg font-medium transition-all
                      ${showOriginal
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    查看原图
                  </button>
                  <button
                    onClick={() => setShowOriginal(false)}
                    className={`
                      px-6 py-3 rounded-lg font-medium transition-all
                      ${!showOriginal
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    查看效果
                  </button>
                  <button
                    onClick={downloadImage}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                  >
                    <span>⬇️</span>
                    <span>下载 PNG</span>
                  </button>
                </div>

                {/* Image Display */}
                <div className="relative min-h-[400px] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={showOriginal ? previewUrl : processedUrl}
                    alt={showOriginal ? 'Original' : 'Processed'}
                    className={`
                      max-w-full max-h-[600px]
                      ${!showOriginal ? 'checkerboard-pattern' : ''}
                    `}
                  />
                </div>

                {/* Tips */}
                <div className="mt-4 text-center text-gray-500 text-sm">
                  {!showOriginal && (
                    <p>💡 棋盘格背景表示透明区域，下载后可自由叠加到其他背景</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>Built with React + FastAPI + rembg</p>
      </footer>
    </div>
  );
}

export default App;