const folder = "/hack";
const loopScript = `${folder}/hack-loop.js`;
const weakenScript = `${folder}/do-weaken.js`;
const growScript = `${folder}/do-grow.js`;
const hackScript = `${folder}/do-hack.js`;

/** @param {NS} ns **/
export async function main(ns) {

  const params = ns.flags([
    ['name', ''],
    ['delay', 200]
  ]);
  const { name, delay } = params;

  ns.disableLog("ALL");

  // 开始循环任务,延迟约10s
  ns.spawn(loopScript, 1, name, delay, hackScript, growScript, weakenScript);
}