/** 
 * scan-deploy.js - 手动向可用服务器部署攻击脚本
 * version = 0.4
 * dependencies: /hack/*
*/

var hostTo = "sigma-cosmetics"; //默认无金服务器攻击目标
var canHackList = [];
var outOfMemList = [];
const folder = "/hack";
const normalHackScript = "/hack/normal-hack.js";
const loopScript = `${folder}/hack-loop.js`;
const weakenScript = `${folder}/do-weaken.js`;
const growScript = `${folder}/do-grow.js`;
const hackScript = `${folder}/do-hack.js`;
const analyzeHackScript = `${folder}/analyze-hack-silent.js`;
var tooHighServers = 0;

/** @param {NS} ns **/
export async function main(ns) {

  var host = ns.getHostname();
  canHackList = [];
  outOfMemList = [];
  if (ns.args.length > 0)
    if (ns.args[0] == "-h") {
      ns.tprint(`用法: scan-deploy-auto.js [-h/hostTo(让无金服务器攻击的目标 默认${hostTo})]`);
      return;
    }
    else hostTo = ns.args[0];
  await scanServer(ns, host);
  ns.tprint(`...排除了\x1b[31m ${tooHighServers} \x1b[0m个Hack需求过高的服务器`);
  for (var server of canHackList) {
    runHackTools(ns, server);
    await hackServer(ns, server);
  }
  for (var server of outOfMemList)
    ns.tprint(`${printName(server.hostname, 19)}\x1b[33m金${formatMoney(server.moneyMax)}\t部署中止 内存已满 ${formatMem(server.maxRam)}`);
}

/**
 * 检查当前破解工具个数
 *  @param {NS} ns 
 */
function getCurrentPortTools(ns) {
  var tools = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) tools++;
  if (ns.fileExists("FTPCrack.exe", "home")) tools++;
  if (ns.fileExists("relaySMTP.exe", "home")) tools++;
  if (ns.fileExists("HTTPWorm.exe", "home")) tools++;
  if (ns.fileExists("SQLInject.exe", "home")) tools++;
  return tools;
}

/** 
 * 使用破解工具
 * @param {NS} ns
 * @param {Server} server 
 **/
function runHackTools(ns, server) {
  // 已经root
  if (server.hasAdminRights) return;
  if (!server.sshPortOpen && ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(server.hostname);
  if (!server.ftpPortOpen && ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(server.hostname);
  if (!server.smtpPortOpen && ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(server.hostname);
  if (!server.httpPortOpen && ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(server.hostname);
  if (!server.sqlPortOpen && ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(server.hostname);
  ns.nuke(server.hostname);
}

/**
 * 扫描服务器
 * @param {NS} ns
 */
async function scanServer(ns, name, exclude) {

  // 获取扫描列表
  const scanList = ns.scan(name);
  const list = [];
  // 移除排除项
  for (var item of scanList) {
    if (item == exclude) continue;
    list.push(item);
  }

  if (list.length > 0) {
    for (var s of list) {
      const server = ns.getServer(s);
      const can = canHackServer(ns, server);
      if (can)
        canHackList.push(server);
      await scanServer(ns, s, name);
    }
  }

  return list;
}

/** 
 * 判断服务器是否可以Hack
 * @param {NS} ns
 * @param {Server} server 
 **/
function canHackServer(ns, server) {

  // 服务器属于自己，跳过
  if (server.purchasedByPlayer) {
    ns.tprint(`${server.hostname.padEnd(19, ' ')}\x1b[36m自有机   \t部署禁用 内存容量 ${formatMem(server.maxRam)}`);
    return false;
  }

  // 检查hack等级
  const hackLvl = ns.getHackingLevel();
  const targetHackLvl = server.requiredHackingSkill;
  if (targetHackLvl > hackLvl) {
    if (targetHackLvl - hackLvl < 100)
      ns.tprint(`${printName(server.hostname, 19)}\x1b[31m需求Hack\t${targetHackLvl} > ${hackLvl}`);
    else tooHighServers++;
    return false;
  }

  // 检查端口需求
  const tools = getCurrentPortTools(ns);
  const targetPorts = server.numOpenPortsRequired;
  if (targetPorts > tools) {
    ns.tprint(`${printName(server.hostname, 19)}\x1b[33m需求Port\t${targetPorts} > ${tools}`);
    return false;
  }

  return true;
}

/** 
 * 复制脚本到目标服务器，并执行Hack
 * @param {NS} ns
 * @param {Server} server 
 **/
async function hackServer(ns, server) {
  //根据服务器内存选择脚本
  const targetName = server.hostname;
  const free = server.maxRam - server.ramUsed;
  if (server.maxRam >= 32) {
    if (server.moneyMax > 0) {
      ns.tprint(`${printName(targetName, 19)}金${formatMoney(server.moneyMax)}\t部署动态脚本>>${targetName}`);
      hackServerDynamic(ns, targetName, targetName);
      return;
    }
    else {
      ns.tprint(`${printName(targetName, 19)}金${formatMoney(server.moneyMax)}\t部署动态脚本>>${hostTo}`);
      hackServerDynamic(ns, targetName, hostTo);
      return;
    }
  }
  const needRam = ns.getScriptRam(normalHackScript);
  const thread = parseInt((free / needRam).toString());
  if (thread > 0) {
    if (server.moneyMax > 0) {
      ns.tprint(`${printName(targetName, 19)}金${formatMoney(server.moneyMax)}\t部署线程x${thread}>>${targetName}`);
      ns.scp(normalHackScript, targetName, "home");
      ns.exec(normalHackScript, targetName, thread, targetName);
      return;
    }
    else {
      ns.tprint(`${printName(targetName, 19)}金${formatMoney(server.moneyMax)}\t部署线程x${thread}>>${hostTo}`);
      ns.scp(normalHackScript, targetName, "home");
      ns.exec(normalHackScript, targetName, thread, hostTo);
      return;
    }
  }
  else outOfMemList.push(server);
}

async function hackServerDynamic(ns, deployName, serverName) {
  ns.scp([analyzeHackScript, loopScript, weakenScript, growScript, hackScript], deployName, "home");
  await ns.killall(deployName);
  ns.exec(analyzeHackScript, deployName, 1, "--name", serverName);
}

// 命令行 自动补全
export function autocomplete(data, args) {
  return [...data.servers];
}

/** 金额格式化 */
function formatMoney(money) {
  if (money >= 1e12) {
    return `${(money / 1e12).toFixed(2)}t`;
  }
  else if (money >= 1e9) {
    return `${(money / 1e9).toFixed(2)}b`;
  }
  else if (money >= 1e6) {
    return `${(money / 1e6).toFixed(2)}m`;
  }
  else if (money >= 1000) {
    return `${(money / 1000).toFixed(2)}k`;
  }
  else {
    return `${money}`.padEnd(9, ' ');
  }
}

/** 内存容量格式化 */
function formatMem(memory) {
  if (memory >= 1024)
    return `${(memory / 1024).toFixed(2)}t`;
  else return `${memory}g`;
}

/** 服务器名格式化 */
function printName(name, length) {
  return name.padEnd(length, ' ');
}