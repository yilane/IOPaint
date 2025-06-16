# IOPaint 部署故障排除指南

## 常见部署错误及解决方案

### 1. typer 版本兼容性问题

**错误信息：**
```
WARNING: typer 0.16.0 does not provide the extra 'all'
```

**解决方案：**
- 确保使用兼容的依赖版本：
  - `typer==0.12.5`
  - `click==8.1.8`
  - `typer-config==1.4.0`
- 更新requirements.txt中的相关版本

### 2. 模块导入错误

**错误信息：**
```
from iopaint.model.original_sd_configs import get_config_files
ModuleNotFoundError: No module named 'iopaint.model.original_sd_configs'
```

**解决方案：**
1. 确保IOPaint包完整安装
2. 检查Python路径设置
3. 重新安装IOPaint包：
   ```bash
   pip uninstall iopaint
   pip install -e .
   ```

### 3. 配置文件缺失

**错误信息：**
```
Config file not found: /path/to/config.yaml
```

**解决方案：**
- 确保所有配置文件都已正确复制到部署环境
- 检查文件权限
- 验证路径设置

## 部署前检查清单

### 1. 环境准备
- [ ] Python 3.10+ 已安装
- [ ] 所有依赖包已安装（使用requirements.txt）
- [ ] CUDA环境配置正确（如果使用GPU）

### 2. 包安装验证
```bash
# 验证IOPaint安装
python -c "import iopaint; print('IOPaint installed successfully')"

# 验证关键依赖
python -c "import torch; print(f'PyTorch: {torch.__version__}')"
python -c "import diffusers; print(f'Diffusers: {diffusers.__version__}')"
```

### 3. 配置文件检查
```bash
# 检查配置文件是否存在
ls -la iopaint/model/original_sd_configs/
```

### 4. 权限检查
```bash
# 确保应用有读取权限
chmod -R 755 iopaint/
```

## 推荐的部署步骤

### 1. 使用虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

### 2. 安装依赖
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. 安装IOPaint
```bash
pip install -e .
```

### 4. 验证安装
```bash
iopaint --help
```

### 5. 启动服务
```bash
iopaint start --host 0.0.0.0 --port 8080
```

## Docker部署建议

如果使用Docker部署，确保：

1. 基础镜像包含所有必要的系统依赖
2. 正确设置工作目录和文件权限
3. 使用多阶段构建优化镜像大小
4. 配置健康检查

```dockerfile
# 示例Dockerfile片段
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install -e .

EXPOSE 8080
CMD ["iopaint", "start", "--host", "0.0.0.0", "--port", "8080"]
```

## 性能优化建议

1. **内存优化**：使用 `--low-mem` 参数
2. **CPU卸载**：使用 `--cpu-offload` 参数
3. **模型缓存**：预下载常用模型
4. **并发控制**：根据服务器配置调整worker数量

## 监控和日志

1. 启用详细日志记录
2. 监控内存和GPU使用情况
3. 设置健康检查端点
4. 配置错误报告机制

## 联系支持

如果遇到其他问题，请：
1. 检查GitHub Issues
2. 提供完整的错误日志
3. 包含环境信息（Python版本、操作系统等） 