const analyzeHackScript = "/hack/analyze-hack.js";

/** @param {NS} ns **/
export async function main(ns) {

  var deployName, serverName; // 部署服务器名,被Hack服务器名
  if (ns.args.length > 0) {
    deployName = ns.args[0];
    serverName = ns.args[1];
  }
  else {
    const params = ns.flags([
      // 部署服务器名
      ['deployName', ''],
      // 被Hack服务器名
      ['serverName', '']
    ]);
    deployName = params[0];
    serverName = params[1];
  }

  if (!ns.serverExists(deployName)) {
    throw `部署服务器${deployName}不存在`;
  }

  if (!ns.serverExists(serverName)) {
    throw `Hack目标服务器${serverName}不存在`;
  }

  // 拷贝脚本到部署服务器上，并执行
  ns.killall(deployName);
  ns.scp(analyzeHackScript, deployName);
  ns.exec(analyzeHackScript, deployName, 1, "--name", serverName);
}