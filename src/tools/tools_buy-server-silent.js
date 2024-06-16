/** @param {NS} ns **/
export async function main(ns) {

  var params = ns.flags([
    // 服务器名字
    ['name', ""],
    // 购买大小
    ['size', 1024],
    // 购买单位 g/t
    ['unit', "t"]
  ]);
  var { name, size, unit } = params;

  //异常处理
  if (name.length === 0 || ns.serverExists(name) || size <= 0 || unit !== "g" && unit !== "t") {
    return;
  }

  // 计算购买大小
  if (unit === "t") size *= 1024;

  const servers = ns.getPurchasedServers();
  const limit = ns.getPurchasedServerLimit();
  if (servers.length >= limit) {
    return;
  }

  const maxRam = ns.getPurchasedServerMaxRam();
  if (size > maxRam) {
    return;
  }

  const currentMoney = ns.getServerMoneyAvailable("home");
  const money = ns.getPurchasedServerCost(size);
  if (currentMoney < money) {
    return;
  }
  ns.purchaseServer(name, size);
}