/**
 * to.js - 快捷到达某服务器
 * 推荐别名： alias to="home;run to.js"
 * 用法: run to.js [服务器名(可选)]
 */

const defaultTarget = "w0r1d_d43m0n";

/** @param {NS} ns */
export async function main(ns) {
  var toList = findPath(ns);
  var target = toList[0];
  ns.tprint(toList);
  while (toList.length > 0) {
    ns.singularity.connect(toList.pop());
    await ns.sleep(50);
  }
  ns.tprint(`到达 ${target}`);
}

export function findPath(ns) {
  let target = defaultTarget;
  if (ns.args.length > 0) target = ns.args[0];
  let serverLink = [target];
  let i = 0;
  while (serverLink.indexOf("home") == -1) {
    let serverScan = ns.scan(serverLink[i++], true);
    serverLink[serverLink.length] = serverScan[0];
  }
  return serverLink;
}

export function autocomplete(data, args) {
  return [...data.servers];
}