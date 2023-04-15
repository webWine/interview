import limitPromise from "./limit.js"

const URL_LIST = new Array(27).fill('').map((item,index)=>'URL_'+(index+1))


/**
 * 创建请求
 */
function createRequest(url) {
  const wait = Math.floor(Math.random() * 10000)
  return new Promise((resolve,reject)=>{
    let timer = setTimeout(() => {
      console.log(`${url} request end, wait ${wait}ms`);
      if(wait>7000){
        reject(wait)
      }
      resolve(wait)
      clearTimeout(timer)
      timer = null
    }, wait)
  })
  
}
const requestList = (urlList) => {
  const list = new Array(urlList.length).fill(null).map((item, index) => {
    return function(){
      return createRequest(urlList[index])
    } 
  })
  return list
}

limitPromise(5,requestList(URL_LIST),()=>{console.log("end")},2).then(res=>{
  console.log(res);
})