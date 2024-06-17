/** 
 * 自动建hacknet
 * 自动买自动升级
 * 直到超过回本周期为止
 */
const paybackTime = 3600;
const milestone = 5.2e9;
const delay = 1000, retryTime = 1.2e6;

async function hacknetAuto(ns) {
  while (true) {
    ns.print("==============================");
    let numNodes = ns.hacknet.numNodes();
    let maxNumNodes = ns.hacknet.maxNumNodes();
    ns.print(`节点数\t${numNodes} / ${maxNumNodes}`);
    let getPurchaseNodeCost = ns.hacknet.getPurchaseNodeCost(0);
    if (numNodes >= 1) {
      let getNodeStats = ns.hacknet.getNodeStats(numNodes - 1);
      ns.print("新节点信息");
      for (let key in getNodeStats) ns.print(`\t${key.padEnd(17, ' ')}${getNodeStats[key]}`);
    }
    // 遍历所有的服务器:
    // 计算最小升级费用.
    let min_upgrade_cost = getPurchaseNodeCost; // 买新节点一般是最贵的吧
    let id_of_node = -1;
    let upgrade_type = 0;// 升级项目: 0:买服务器, 1:升等级, 2:升内存 3:升cpu
    let total_production = 0;// 总的每秒收入
    for (let i = 0; i < numNodes; i++) {
      let nodeStats = ns.hacknet.getNodeStats(i);
      total_production += nodeStats["production"];
      let level_upgrade_cost = ns.hacknet.getLevelUpgradeCost(i);
      if (level_upgrade_cost < min_upgrade_cost) {
        min_upgrade_cost = level_upgrade_cost;
        id_of_node = i;
        upgrade_type = 1;
      }
      let ram_upgrade_cost = ns.hacknet.getRamUpgradeCost(i);
      if (ram_upgrade_cost < min_upgrade_cost) {
        min_upgrade_cost = ram_upgrade_cost;
        id_of_node = i;
        upgrade_type = 2;
      }
      let core_upgrade_cost = ns.hacknet.getCoreUpgradeCost(i);
      if (core_upgrade_cost < min_upgrade_cost) {
        min_upgrade_cost = core_upgrade_cost;
        id_of_node = i;
        upgrade_type = 3;
      }
    }

    // 若未达回本周期, 执行升级
    if (min_upgrade_cost < total_production * paybackTime) {
      switch (upgrade_type) {
        case 0:
          ns.print(`节点购买>>\tnode${numNodes}`);
          ns.hacknet.purchaseNode();
          break;
        case 1:
          ns.print(`节点升级 等级 >>\tnode-${id_of_node}`)
          ns.hacknet.upgradeLevel(id_of_node);
          break;
        case 2:
          ns.print(`节点升级 内存 >>\tnode-${id_of_node}`)
          ns.hacknet.upgradeRam(id_of_node);
          break;
        case 3:
          ns.print(`节点升级 核心 >>\tnode-${id_of_node}`)
          ns.hacknet.upgradeCore(id_of_node);
          break;
      }
      ns.print(`秒收入\t\t${total_production}`)
      ns.print(`距里程碑(${milestone / 1e9}b)\t${5.2e9 / total_production / 3600}h`);
      ns.print("==============================");
    }
    else {
      ns.print(`Hacknet节点接管中止 达到回本周期(${paybackTime}s) 重试时间(${retryTime / 1000}s)`);
      ns.print("==============================");
      await ns.sleep(retryTime);
    }
    await ns.sleep(delay);
  }
}

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");

  ns.tprint(`Hacknet节点已接管 最大回本周期(${paybackTime}s) 执行周期(${delay / 1000}s)`);

  //初始化
  let numNodes = ns.hacknet.numNodes();
  while (!(numNodes > 0)) {
    await ns.sleep(400);
    ns.tprint("尝试初始化 node-0");
    ns.hacknet.purchaseNode();
    numNodes = ns.hacknet.numNodes();
  }
  await hacknetAuto(ns);
}