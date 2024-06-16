const deployScript="/hack/scan-deploy-silent.js";
const delay = 1.2e6;

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  let hostTo = "sigma-cosmetics";
  if(ns.args.length>0) hostTo = ns.args[0];
  
  ns.tprint(`循环自动部署已启用 周期(${delay/1000}s) 参数(${hostTo})`);
  var t = 0;
  while(true){
    ns.print(`尝试进行scan-deploy部署 ${++t}`);
    ns.exec(deployScript,ns.getHostname(),1,hostTo);
    await ns.sleep(delay);
  }
}