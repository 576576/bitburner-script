/** 
 * scan-list.js - 仅扫描服务器
 * version = 0.4
*/

var canHackList = [];

/** @param {NS} ns */
export async function main(ns) {
  var host = ns.getHostname();
  await scanServer(ns, host);
  for (var server of canHackList)
    ns.tprint(`${server.hostname.padEnd(19, ' ')}金${formatMoney(server.moneyMax)}\t内存${formatMem(server.maxRam)}\t核心${server.cpuCores}`);
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
    ns.tprint(`${server.hostname.padEnd(19, ' ')}\x1b[36m自有机   \t内存${formatMem(server.maxRam)}\t核心${server.cpuCores}`);
    return false;
    }

  // 检查hack等级
  const hackLvl = ns.getHackingLevel();
  const targetHackLvl = server.requiredHackingSkill;
  if (targetHackLvl > hackLvl) {
    ns.tprint(`${server.hostname.padEnd(19, ' ')}\x1b[31m需求Hack\t${targetHackLvl} > ${hackLvl}`);
    return false;
  }

  // 检查端口需求
  const tools = getCurrentPortTools(ns);
  const targetPorts = server.numOpenPortsRequired;
  if (targetPorts > tools) {
    ns.tprint(`${server.hostname.padEnd(19, ' ')}\x1b[33m需求Port\t${targetPorts} > ${tools}`);
    return false;
  }
  return true;
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