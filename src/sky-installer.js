const logo = `
███████╗██╗  ██╗██╗   ██╗     ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
██╔════╝██║ ██╔╝╚██╗ ██╔╝     ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
███████╗█████╔╝  ╚████╔╝█████╗███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
╚════██║██╔═██╗   ╚██╔╝ ╚════╝╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
███████║██║  ██╗   ██║        ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
╚══════╝╚═╝  ╚═╝   ╚═╝        ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
`;

// Sky插件安装配置
const setupConfig = {
  // 代码源地址
  github:
    "https://raw.githubusercontent.com/LtyFantasy/bitburner-script/main/src",
  // 模块配置，后续在这里追加其他模块配置
  modules: [
    {
      enable: false,
      name: "巡天系统",
      folder: "sky-system",
      files: []
    },
    {
      enable: true,
      name: '动态Hack模块',
      folder: "sky-hack-server",
      files: [
        "hack-server.js",
        "hack-event-loop.js",
        "do-hack.js",
        "do-grow.js",
        "do-weaken.js"
      ]
    },
    {
      enable: false,
      name: "工具集",
      folder: "sky-tools",
      files: []
    },
  ],
};

/** @param {NS} ns **/
export async function main(ns) {

  if (ns.getHostname !== 'home') {
    throw "⚠ 脚本只能从home执行";
  }

  const success = await downloadFiles(ns);
  if (!success) {
    ns.tprintf();
  }
}

/**
 * 下载各模块文件
 * 
 * @param {NS} ns
 */
async function downloadFiles(ns) {

  const log = createLogger(ns, '下载');
  log("准备下载Sky系列脚本文件，请稍候...");

  var count = 0;
  var retry = 0;
  const list = [];
  // 读取所有需要下载的文件
  for (const mod of setupConfig.modules) {
    if (!mod.enable || mod.files.length === 0) continue;
    for (const file of mod.files) {
      list.push({
        url: `${setupConfig.github}/${mod.folder}/${file}`,
        path: `/${mod.folder}/${file}`,
        module: mod.name,
        success: false,
      });
    }
  }

  while(count != list.length && retry < 3); {
    
    retry > 0 && log(`下载重试，第${retry}次`);
    for (const file of list.length) {
      log(`开始下载模块(${file.module})，下属文件(${file.path})，[${count} / ${list.length}]`);
      const success = await ns.wget(file.url, file.path);
      if (success) {
        log(`😡 文件${file.path}下载失败`);
        count++;
      }
      else {
        log(`😁 文件${file.path}下载成功`);
      }
    }

    retry++;
  }
  return count === list.length;
}

/**
 * Logger
 * 
 * @param {NS} ns
 * @param {string} name
 */
function createLogger(ns, name) {
  return (msg) => {
    ns.tprintf(`[${name}]：${msg}`);
  };
}