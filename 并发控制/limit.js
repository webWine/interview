/**
 * 并发控制
 * 原理:
 *    初始化并发数量的请求或方法
 *    每当并发的方法结束调用后就立即递归调用一个新的待并发的方法,持续调用自身缩减并发列表
 * 设计思路:
 *    传入并发数、并发方法列表、并发完成的回调
 *    返回并发信息:
 *      方法执行状态:失败或成功
 *      方法结果
 *      并发方法的索引,便于创建并发请求和并发结果的关系
 */


/**
 * 并发控制方法1,循环控制
 * @param {*} limit 
 * @param {*} requestList 
 * @param {*} cb 
 * @returns 
 */
const limitRequestOne = (limit = 2, requestList, cb) => {
  let count = 0
  const result = []
  const run = () => {
    const request = requestList.shift()
    count++
    request && request().then(res => {
      result.push(res)
      count--
      if (requestList.length == 0 && count == 0) {
        cb && cb()
        return
      }
      if(count<limit && requestList.length>0){
        run()
      }
    })

  }

  for (let i = 0; i < limit; i++) {
    run()
  }
  return result
}

/**
 * 并发控制循环2
 * @param {*} limit 
 * @param {*} requestList 
 * @param {*} cb 
 * @returns 
 */
const limitRequestTwo = (limit = 2, requestList, cb)=>{
  const result= []
  const list = [...requestList]
  let count = 0
  const run = (res)=>{
    if(list.length){
      const request = list.shift()
      const index = requestList.length - list.length
      return request && request().then(res => {
        count--
        if(!list.length && count == 0){
          cb && cb()
          return result
        }
        result.push({
          status:"fulfilled",
          value:res,
          index
        })
        return run()
      }).catch(err=>{
        count--
        if(!list.length && count == 0){
          cb && cb()
          return result
        }
        result.push({
          status:"rejected",
          value:err,
          index
        })
        return run()
      })
    }
    
  }
  const startRequestList = new Array(limit).fill(Promise.resolve()).map(promise=>promise.then(run))
  return Promise.allSettled(startRequestList).then(res=>{
    return result
  })
}

const limitPromise =  (limit,requestList,cb,type = 2)=>{
  if(type == 1){
    return limitRequest(limit, requestList,cb)
  } else {
    return limitRequestTwo(limit, requestList,cb)
  }
}
export default limitPromise


