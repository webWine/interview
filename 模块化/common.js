// https://juejin.cn/post/6844903652574887943 CommonJS的实现
/**
 * COMMONJS  node专用
 *    ——同步加载 
 *    ——只能在node环境中使用,不适用浏览器环境
 *    ——导出的是值的拷贝而非引用,比如在外部引用COMMONJS的变量进行修改后再次引用该变量,该变量的值仍然取得的是初始化COMMONJS时的值
 *    ——引用文件默认为js文件,根据路径查询时根据js->json->node文件格式依次查询
 *    ——模块引用时优先取缓存,缓存没有才回去读取文件
 *    ——加载顺序按照模块的引入顺序加载
 *    ——————加载规则
 *          ——以“/”开头,表示加载的的是一个绝对路径下的模块位置
 *          ——以“./”或“../”开头,表示加载的是一个位于相对路径下的模块位置
 *          ——不以上述两种方式开头的引用,表示加载的是核心模块,直接从node_modules目录下加载
 */
const path = require("path");
const fs = require("fs");
const fileWrapper = ["function(exports,require,module,__filename,__dirname){", "}"]
const extensions = {
  ".js"(module) {
    const jsString = fs.readFileSync(module.id, "utf-8");// 读取文件
    const fn = new Function("exports", "require", "module", "__filename", "__dirname", jsString); // 创建方法
    fn.call(module.exports, module.exports, myRequire, module, module.id, path.dirname(module.id))
  },
  ".json"(module) {
    const json = JSON.parse(fs.readFileSync(module.id, "utf-8"));
    module.exports = json
  }
}
class Module {
  constructor(id) {
    this.id = id;
    this.exports = {}
  }
  load() {
    let ext = path.extname(this.id) // 获取文件类型
    extensions[ext](this)
  }
  static resolveFileName(filename) {
    let current = path.resolve(__dirname, filename);
    let flag = fs.existsSync(current);

    if (!flag) {
      current = Object.keys(extensions).map(item => current + item)
        .filter(current => fs.existsSync(current))
        .join();
      if (!current) throw Error("please require a correct file!")
    }
    return current
  }
  static _cache = {}
}


function myRequire(filename) {
  let current = Module.resolveFileName(filename); // 查找文件
  if (Module._cache[current]) return Module._cache[current]; // 如果缓存存在直接返回 
  let module = new Module(current); // 创建module实例
  module.load(); // 读取文件
  Module._cache[current] = module; // 存入缓存
  return module.exports 导出文件
}

const res = myRequire("./a")
console.log(res)