/** 
 * scan-deploy-silent.js - 自动向可用服务器部署攻击脚本
 * version = 0.4
 * dependencies: /hack/*
 * Comment: 前置脚本传参执行 非重置性部署
*/

const folder = "/hack";
const normalHackScript = "/hack/normal-hack.js";
const loopScript = `${folder}/hack-loop.js`;
const weakenScript = `${folder}/do-weaken.js`;
const growScript = `${folder}/do-grow.js`;
const hackScript = `${folder}/do-hack.js`;
const analyzeHackScript = `${folder}/analyze-hack-silent.js`;

/** @param {NS} ns **/
export async function main(ns) {
  var host = ns.getHostname();

  const params = ns.flags([['name', 'sigma-cosmetics']]);//无金服务器攻击目标
  const { hostTo } = params;
  await scanServer(ns, host, "", hostTo);
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
async function scanServer(ns, name, exclude, hostTo) {

  const scanList = ns.scan(name);
  const list = [];
  for (var item of scanList) {
    if (item == exclude || item == 'home') continue;
    list.push(item);
  }

  if (list.length > 0) {
    for (var s of list) {
      const server = ns.getServer(s);
      const can = canHackServer(ns, server);
      if (can) {
        runHackTools(ns, server);
        await hackServer(ns, server, hostTo);
      }
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
  if (server.purchasedByPlayer) return false;

  const hackLvl = ns.getHackingLevel();
  const targetHackLvl = server.requiredHackingSkill;
  if (targetHackLvl > hackLvl) return false;

  const tools = getCurrentPortTools(ns);
  const targetPorts = server.numOpenPortsRequired;
  if (targetPorts > tools) return false;

  return true;
}

/** 
 * 复制脚本到目标服务器，并执行Hack
 * @param {NS} ns
 * @param {Server} server 
 **/
async function hackServer(ns, server, hostTo) {

  const targetName = server.hostname;
  const free = server.maxRam - server.ramUsed;
  if (server.maxRam >= 32 && server.ramUsed == 0) {
    if (server.moneyMax > 0) {
      hackServerDynamic(ns, targetName, targetName);
      return;
    }
    else {
      hackServerDynamic(ns, targetName, hostTo);
      return;
    }
  }
  const needRam = ns.getScriptRam(normalHackScript);
  const thread = parseInt((free / needRam).toString());
  if (server.maxRam < 32 && thread > 0) {
    if (server.moneyMax > 0) {
      ns.scp(normalHackScript, targetName, "home");
      ns.exec(normalHackScript, targetName, thread, targetName);
      return;
    }
    else {
      ns.scp(normalHackScript, targetName, "home");
      ns.exec(normalHackScript, targetName, thread, hostTo);
      return;
    }
  }
}

async function hackServerDynamic(ns, deployName, serverName) {
  ns.scp([analyzeHackScript, loopScript, weakenScript, growScript, hackScript], deployName, "home");
  await ns.killall(deployName);
  ns.exec(analyzeHackScript, deployName, 1, "--name", serverName);
}
