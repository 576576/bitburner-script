/** @param {NS} ns **/
export async function main(ns) {

  if (ns.args.length == 0) {
    ns.tprint("用法: [name 服务器名] [size 内存] [g/t 内存单位] [true/false 是否仅查询]");
    return;
  }

  var name = ns.args[0];
  var size = ns.args[1];
  var unit = ns.args[2];
  var help = ns.args[3];

  //异常处理
  if (name.length === 0) {
    ns.tprint("服务器名为空");
    return;
  }
  if (ns.serverExists(name)) {
    ns.tprint(`${name} 服务器重名`);
    return;
  }
  if (size <= 0) {
    ns.tprint("非法大小");
    return;
  }
  if (unit !== "g" && unit !== "t") {
    ns.tprint("非法单位(受支持单位 g/t)");
    return;
  }

  // 计算购买大小
  if (unit === "t") size *= 1024;

  const servers = ns.getPurchasedServers();
  const limit = ns.getPurchasedServerLimit();
  ns.tprint(`服务器编号 ${servers.length + 1} / ${limit}`);
  if (servers.length >= limit) {
    ns.tprint(`购买失败 达到数量限制`);
    return;
  }

  const maxRam = ns.getPurchasedServerMaxRam();
  ns.tprint(`服务器内存 ${formatMem(size)} / ${(formatMem(maxRam))}`);
  if (size > maxRam) {
    ns.tprint(`购买失败 达到内存限制`);
    return;
  }

  const currentMoney = ns.getServerMoneyAvailable("home");
  const money = ns.getPurchasedServerCost(size);
  ns.tprint(`服务器价格 ${formatMoney(money)} / ${formatMoney(currentMoney)}`);
  if (currentMoney < money) {
    ns.tprint(`购买失败 余额不足 差额${formatMoney(money - currentMoney)}`);
    return;
  }

  if (help) ns.tprint("已查询对应服务器信息 未实际购买");
  else {
    const resultName = ns.purchaseServer(name, size);
    ns.tprint(`购买成功 服务器名${resultName} 开销${formatMoney(money)}`);
  }
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