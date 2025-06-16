# IOPaint 部署检查清单

## 🚀 快速部署指南

### 1. 环境准备
- [ ] Python 3.10+ 已安装
- [ ] 创建虚拟环境：`python -m venv venv`
- [ ] 激活虚拟环境：`source venv/bin/activate` (Linux/Mac) 或 `venv\Scripts\activate` (Windows)

### 2. 依赖安装
```bash
# 升级pip
pip install --upgrade pip

# 安装依赖（使用修复后的requirements.txt）
pip install -r requirements.txt

# 安装IOPaint
pip install -e .
```

### 3. 关键依赖版本验证
确保以下版本正确安装：
- ✅ `typer==0.12.5`
- ✅ `click==8.1.8` 
- ✅ `typer-config==1.4.0`

验证命令：
```bash
pip list | grep -E "(typer|click)"
```

### 4. 功能验证
```bash
# 测试CLI帮助
iopaint start --help

# 测试基本导入
python -c "from iopaint.schema import RemoveBGModel; print('✓ 导入成功')"

# 测试服务启动（可选）
iopaint start --model=lama --device=cpu --port=8080
```

### 5. 常见问题快速修复

#### 如果遇到typer错误：
```bash
pip install "typer==0.12.5" "click==8.1.8"
```

#### 如果遇到RemoveBGModel错误：
确保使用最新的代码，包含schema.py中的修复。

#### 如果遇到导入错误：
```bash
pip uninstall iopaint
pip install -e .
```

## 🎯 部署成功标志

当看到以下输出时，说明部署成功：
```
2025-06-17 01:14:33.209 | INFO | iopaint.runtime:setup_model_dir:81 - Model directory: /path/to/.cache
- Platform: Linux-x.x.x
- Python version: 3.10.x
- torch: 2.7.1
- diffusers: 0.27.2
...
2025-06-17 01:14:37.137 | INFO | iopaint.model_manager:init_model:47 - Loading model: lama
```

## 📞 获取帮助

如果仍然遇到问题：
1. 检查 `DEPLOYMENT_TROUBLESHOOTING.md` 详细指南
2. 确保使用最新的 `requirements.txt`
3. 验证所有代码修复都已应用

---
*最后更新：2025-06-17* 