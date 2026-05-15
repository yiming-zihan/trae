# 部署安全指南

## 概述
本文档说明如何在生产环境中安全部署家庭菜单管理系统。

## 问题说明

### 当前状态
- 开发环境使用 HTTP 协议，未加密传输
- 本地部署没有安全证书

### 安全风险
- 数据传输未加密，容易被窃取
- 没有身份验证机制
- 缺少防攻击措施

## 生产环境部署方案

### 方案一：使用 Vercel (推荐)

Vercel 会自动配置 HTTPS，使用简单：

1. 上传代码到 GitHub
2. 使用 Vercel 自动部署
3. Vercel 会自动配置 SSL 证书

### 方案二：使用 Nginx + Let's Encrypt

如果您想自己部署服务器：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    root /path/to/your/app;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

使用 certbot 获取免费证书：
```bash
sudo certbot --nginx -d your-domain.com
```

### 方案三：使用 Cloudflare

Cloudflare 提供免费的 CDN 和 HTTPS：

1. 域名 DNS 解析到 Cloudflare
2. 在 Cloudflare 中开启「SSL/TLS」->「完全」模式
3. 享受自动 HTTPS 加密

## 安全加固建议

### 1. 启用 CSP (内容安全策略)
在 `index.html` 的 `<head>` 中添加：
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'">
```

### 2. 配置安全头
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### 3. 添加用户认证
在生产环境中，建议添加登录功能以保护数据安全。

## 本地开发环境优化

虽然本地环境不需要 HTTPS，但您可以：

1. 在浏览器中忽略安全警告（仅限开发）
2. 使用 mkcert 生成本地证书（仅用于测试）

### 使用 mkcert 本地 HTTPS 测试

```bash
# 安装 mkcert
brew install mkcert

# 生成本地证书
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

## 微信集成说明

当前版本中的微信功能是模拟实现。如需真实的微信集成，需要：

1. 注册微信公众平台账号
2. 配置服务器域名白名单
3. 实现微信 OAuth 登录
4. 开发微信消息推送接口

## 总结

- **开发环境**：可以继续使用 HTTP，但不要生产敏感数据
- **生产环境**：必须使用 HTTPS 保护数据传输安全
- **推荐方案**：使用 Vercel 或 Cloudflare，部署简单且免费

如有安全相关问题，请咨询网络安全专家。
