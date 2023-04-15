/**
 * 宏任务
 * 同步任务 
 *    同步任务过程中遇见微任务或宏任务就将其塞到微任务队列或宏任务队列
 *    同步任务执行完毕取出微任务队列中回调执行
 * 微任务
 *    微任务执行完成后,取出宏任务队列执行
 * 宏任务
 */

/**
 * setTimeout到底是什么时候塞到任务队列的?
 *    setTimeout是等待setTimeout规定的时间之后才将其回调塞入宏任务队列
 */
/**
 * setTimeout精度丢失问题
 *  原因: setTimeout是一个宏任务,宏任务会等待同步任务和微任务执行结束在开始执行,如果同步任务和微任务耗时过长,定时器就会多等待同步任务和微任务执行的这段时间
 *  解决方案:
 *     1、webworker webwoker中onmessage接收到消息就会立马执行onmessage回调
 *        优点: 和主线任务不在一个线程内,相对来说精度更高,不需要等待同步任务执行的时间,
 *        缺点: 兼容性差、有点大题小作
 *     2、while 循环
 *        优点: 比较精准
 *        缺点: 阻塞同步任务
 *     3、系统时间补偿:每次执行时都计算一下上次的延时,下一次执行时就减去这个延时时间
 */
// 系统时间补偿方案
function correctSetTimeout(fn, wait) {
  let timer=null,count = 0,interval = 1000
  const startTime = new Date().getTime()
  const loop = ()=>{
    count++;
    const offset = new Date().getTime() - (startTime+count*interval)
    nextTime = interval - offset
    if(nextTime<0){
      nextTime = 0
    }
    wait -= interval;
    console.log(
      `误差：${offset} ms，下一次执行：${nextTime} ms 后，离活动开始还有：${wait} ms`
    );
    if(wait<=0){
      fn()
      clearTimeout(timer);
    } else {
      timer = setTimeout(loop, nextTime)
    }
  }

  timer = setTimeout(loop, interval)
}
console.log(new Date().getTime())
correctSetTimeout(()=>{console.log(new Date().getTime());},50000)
setTimeout(()=>{console.log(new Date().getTime(),7);},50000)

/**
 * 常见宏任务
 *   setTimeout
 *   setInterval
 *   script
 * 常见微任务
 *   Promise.then
 *   mutationObsever
 *   Process.nextTick
 *   注意:
 *      有两个东西比较特殊,看起来很像是微任务
 *      async/await  await后面的代码会立即执行,但立即执行完了以后将会交出执行栈,让外部的同步代码继续执行,执行结束再回到自身,await 其实相当于Promise的then
 *      Promise中返回Promise.resolve或者new Promise()会执行两次微任务,其中一次是Promise的then的返回如果是一个Promise,他将会调用一次then方法,这是一次微任务
 *      还有一次是浏览器在处理resolve时会将其塞入一个微任务队列,这个在Promise规范中其实并没有提到
 */

console.log(1);
async function asyncfn1(){
    console.log(2);
    await asyncfn2();
    console.log(3);
};
setTimeout(() => {
    console.log('setTimeout')
}, 0)

async function asyncfn2(){
    console.log(4)
};

asyncfn1();
console.log(5); 
Promise.resolve().then(res=>{
  console.log(6);
})
console.log(7); 
// 1/2/4/5/3