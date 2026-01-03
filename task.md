20251017:
本地部署成功
vercel 部署成功
vercel申请了pgsqlDB成功
申请了stripe账户和密钥
理解了stripe支付的webhook，并与本地连接成功
npm run db:generate   -- lib/db/schema.ts
npm run db:migrate    -- lib/db/migrations/sql脚本执行
以上两个命令的使用场景是新增表-新业务情况
----------------------------------------------
Let's Encrypt 是免费的证书颁发机构（CA），可以帮你申请 免费 SSL 证书。
配合 Nginx，可以自动配置 HTTPS，浏览器和 Stripe 都能正常访问。
命令解释：
yum install -y certbot python3-certbot-nginx  # 安装 Certbot 工具和 Nginx 插件
certbot --nginx -d your-domain.com          # 生成证书并自动修改 Nginx 配置
----------------------------------------------




下一个阶段是尝试部署到serv00服务器或其他服务器
尝试开发几个页面
尝试开发几个接口
尝试直接访问接口
