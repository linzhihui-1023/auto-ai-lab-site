# 汽车人工智能实验室网站

这是一个适合部署到 GitHub Pages 的静态实验室网站。

## 本地预览

在网站目录运行：

```bash
python3 -m http.server 8000
```

然后打开：

- `http://127.0.0.1:8000/index.html`
- `http://127.0.0.1:8000/admin.html`

## GitHub Pages 部署

1. 在 GitHub 新建仓库。
2. 把当前目录内容推到仓库根目录。
3. 在仓库 `Settings -> Pages` 中选择：
   - `Source: Deploy from a branch`
   - `Branch: main`
   - `Folder: / (root)`
4. 保存后等待 GitHub Pages 发布。

可用命令：

```bash
cd /home/lin/wangye
git add .
git commit -m "Initial lab website"
git remote add origin <你的仓库地址>
git push -u origin main
```

## 维护后台

项目包含一个轻量维护后台：

- `admin.html`

功能：

- 选择网站目录
- 打开并编辑页面文件
- 直接保存回本地文件
- 下载当前文件备份
- 预览当前页面

建议使用 Chrome 或 Edge 打开 `admin.html`。

## 常用文件

- `index.html`：首页
- `research.html`：研究方向
- `equipment.html`：研究设备
- `members.html`：成员介绍
- `achievements.html`：研究成果
- `activities.html`：组内活动
- `contact.html`：加入我们
- `site.css`：全站样式
- `site.js`：全站交互
