from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from rembg import remove
import aiofiles
import os
from pathlib import Path
import uuid

app = FastAPI(title="Image Background Remover API")

# CORS 配置 - 开发环境允许所有来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# 创建目录
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def validate_file(file: UploadFile) -> tuple[bool, str | None]:
    """验证文件类型和大小"""
    # 检查扩展名
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"不支持的文件格式: {ext}"

    # 重置文件指针并读取内容来检查大小
    content = file.file.read()
    file.file.seek(0)  # 重置到开头
    file_size = len(content)

    if file_size > MAX_FILE_SIZE:
        return False, f"文件过大 ({file_size / 1024 / 1024:.2f}MB)，最大支持 10MB"

    return True, None


def remove_background(input_path: Path, output_path: Path) -> None:
    """使用 rembg 移除背景"""
    input_image = Image.open(input_path)

    # 转换为 RGB 如果不是 RGBA
    if input_image.mode != 'RGBA' and input_image.mode != 'RGB':
        input_image = input_image.convert('RGB')

    # 移除背景
    output_image = remove(input_image)

    # 保存为 PNG（支持透明）
    output_image.save(output_path, "PNG")
    output_image.close()
    input_image.close()


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Image Background Remover API",
        "version": "1.0.0",
        "endpoints": {
            "remove_background": "/api/remove-background"
        }
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}


@app.post("/api/remove-background")
async def remove_background_endpoint(file: UploadFile = File(...)):
    """
    移除图片背景

    - **file**: 上传的图片文件 (JPG, PNG, WEBP, 最大 10MB)
    - **返回**: 处理后的图片 URL
    """
    try:
        # 验证文件
        is_valid, error_msg = validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        # 生成唯一文件名
        file_id = uuid.uuid4().hex
        input_ext = Path(file.filename).suffix.lower()

        input_filename = f"{file_id}{input_ext}"
        output_filename = f"{file_id}.png"

        input_path = UPLOAD_DIR / input_filename
        output_path = OUTPUT_DIR / output_filename

        # 保存上传的文件
        async with aiofiles.open(input_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        # 处理图片
        remove_background(input_path, output_path)

        # 删除原文件
        input_path.unlink()

        # 返回结果
        return {
            "original_filename": file.filename,
            "processed_url": f"/api/download/{output_filename}",
            "output_filename": output_filename
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="处理图片时出错，请重试")


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """
    下载处理后的图片
    """
    file_path = OUTPUT_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    return FileResponse(
        file_path,
        media_type="image/png",
        filename=f"{Path(filename).stem}-bg-removed.png"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)