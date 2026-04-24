import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [serverInfo, setServerInfo] = useState(null);

  useEffect(() => {
    fetch('/api/server-info')
      .then(r => r.json())
      .then(setServerInfo)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground">设置</h2>

      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            宝宝成长记录 v1.0
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            所有数据存储在本地服务器，不依赖任何云服务。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>数据备份</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            数据库文件位于 <code className="bg-muted px-1 rounded">data/db/baby.db</code>，上传文件位于 <code className="bg-muted px-1 rounded">data/uploads/</code>。
          </p>
          <p className="text-sm text-muted-foreground">
            直接复制这些目录即可完成备份。迁移到 NAS 时，将整个 <code className="bg-muted px-1 rounded">data/</code> 目录复制到新服务器即可。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>远程访问</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            建议使用 <strong>Tailscale</strong> 实现安全的远程访问：
          </p>
          <ol className="text-sm text-muted-foreground mt-2 ml-4 list-decimal space-y-1">
            <li>在服务器和手机上安装 Tailscale</li>
            <li>使用同一账号登录</li>
            <li>通过虚拟 IP 访问本系统</li>
          </ol>
        </CardContent>
      </Card>

      {serverInfo && (
        <Card>
          <CardHeader>
            <CardTitle>访问地址</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">内网访问：</p>
            <code className="block bg-muted px-2 py-1 rounded text-sm mb-4">{serverInfo.localUrl}</code>
            <p className="text-sm text-muted-foreground mb-2">安装 Tailscale 后，远程访问地址：</p>
            <code className="block bg-muted px-2 py-1 rounded text-sm">http://&lt;服务器TailscaleIP&gt;:{serverInfo.port}</code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
