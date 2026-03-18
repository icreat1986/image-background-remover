# 🎨 Image Background Remover

一个基于 AI 的智能图片背景移除工具，拖拽上传即可自动移除背景，生成透明 PNG 图片。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特点

- 📷 **简单易用** - 拖拽或点击上传，一键处理
- 🤖 **AI 驱动** - 基于 rembg (U^2-Net 模型) 智能识别主体
- 🚀 **快速处理** - 秒级响应，即时预览结果
- 💎 **免费开源** - 无需注册，完全免费
- 📱 **响应式设计** - 支持桌面端和移动端
- 🌐 **本地部署** - 数据完全在本地处理，保护隐私

## 🛠️ 技术栈

### 前端
- **React 18** + TypeScript
- **Vite** - 快速构建工具
- **Tailwind CSS** - 现代化样式
- **React Dropzone** - 拖拽上传
- **Axios** - HTTP 客户端

### 后端
- **FastAPI** - 高性能 Python Web 框架
- **Uvicorn** - ASGI 服务器
- **rembg** - AI 背景移除库 (基于 U^2-Net)
- **Pillow** - 图片处理

## 📦 快速开始

### 前置要求

- Python 3.8+
- Node.js 18+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone https://github.com/icreat1986/image-background-remover.git
cd image-background-remover
```

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 http://localhost:8000 启动

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:5173 启动

### 4. 使用

打开浏览器访问 http://localhost:5173，拖拽或点击上传图片即可！

## 📂 项目结构

```
image-background-remover/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── App.tsx          # 主应用组件
│   │   ├── App.css          # 样式
│   │   └── index.css        # 全局样式
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── main.py          # 主应用
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── uploads/             # 上传文件目录
│   └── outputs/             # 输出文件目录
├── image-bg-remover-mvp.md  # MVP 需求文档
└── README.md
```

## 🔧 配置

### 后端配置

在 `backend/app/main.py` 中可以修改：

```python
MAX_FILE_SIZE = 10 * 1024 * 1024  # 最大文件大小 (默认 10MB)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}  # 允许的文件格式
```

### 环境变量

创建 `.env` 文件（可选）：

```env
# 后端配置
MAX_FILE_SIZE=10485760
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🚀 部署

### Docker 部署（推荐）

```bash
docker-compose up -d
```

### Vercel / Render

1. Fork 本仓库
2. 在 Vercel/Render 中导入
3. 配置环境变量
4. 部署!

### 服务器部署

```bash
# 后端 - 使用 Gunicorn + Nginx
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# 前端 - 构建静态文件
npm run build
# 部署 dist/ 目录到 Nginx
```

## 📝 API 文档

启动后端后访问：

- API 文档: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要 API

| 端点 | 方法 | 说明 |
|-----|------|------|
| `/` | GET | API 信息 |
| `/health` | GET | 健康检查 |
| `/api/remove-background` | POST | 移除图片背景 |
| `/api/download/{filename}` | GET | 下载处理后的图片 |

## 🔒 隐私说明

- 所有图片处理在本地服务器完成
- 处理后的图片立即删除，不存储
- 不收集任何用户数据
- 代码完全开源，可自行审计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [rembg](https://github.com/danielgatis/rembg) - AI 背景移除库
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化 Python Web 框架
- [React](https://react.dev/) - JavaScript UI 库

---

Built with ❤️ by icreat1986