import { useEffect, useState } from 'react';

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
      <h2 className="text-xl font-bold text-gray-800">设置</h2>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-3">关于</h3>
        <p className="text-sm text-gray-600">
          宝宝成长记录 v1.0
        </p>
        <p className="text-sm text-gray-500 mt-1">
          所有数据存储在本地服务器，不依赖任何云服务。
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-3">数据备份</h3>
        <p className="text-sm text-gray-600 mb-3">
          数据库文件位于 <code className="bg-gray-100 px-1 rounded">data/db/baby.db</code>，上传文件位于 <code className="bg-gray-100 px-1 rounded">data/uploads/</code>。
        </p>
        <p className="text-sm text-gray-500">
          直接复制这些目录即可完成备份。迁移到 NAS 时，将整个 <code className="bg-gray-100 px-1 rounded">data/</code> 目录复制到新服务器即可。
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-3">远程访问</h3>
        <p className="text-sm text-gray-600">
          建议使用 <strong>Tailscale</strong> 实现安全的远程访问：
        </p>
        <ol className="text-sm text-gray-600 mt-2 ml-4 list-decimal space-y-1">
          <li>在服务器和手机上安装 Tailscale</li>
          <li>使用同一账号登录</li>
          <li>通过虚拟 IP 访问本系统</li>
        </ol>
      </div>

      {serverInfo && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-800 mb-3">访问地址</h3>
          <p className="text-sm text-gray-600 mb-2">内网访问：</p>
          <code className="block bg-gray-100 px-2 py-1 rounded text-sm mb-4">{serverInfo.localUrl}</code>
          <p className="text-sm text-gray-600 mb-2">安装 Tailscale 后，远程访问地址：</p>
          <code className="block bg-gray-100 px-2 py-1 rounded text-sm">http://&lt;服务器TailscaleIP&gt;:{serverInfo.port}</code>
        </div>
      )}
    </div>
  );
}
