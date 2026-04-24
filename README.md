# 宝宝成长记录

本地部署的宝宝成长记录系统。

## 启动

```bash
npm install
npm run build
npm start
```

访问 http://localhost:3000

## 远程访问（Tailscale）

1. 在服务器和手机上安装 Tailscale：https://tailscale.com/download
2. 在服务器上运行 `tailscale up` 并登录
3. 在手机上用同一账号登录
4. 通过虚拟 IP 访问本系统

## 数据备份

复制 `data/` 目录即可备份所有数据。
