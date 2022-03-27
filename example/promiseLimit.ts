const urls = [
    { info: '1', time: 3000 },
    { info: '2', time: 2000 },
    { info: '3', time: 3400 },
    { info: '4', time: 1300 },
    { info: '5', time: 5600 },
    { info: '6', time: 3800 },
    { info: '7', time: 1100 },
    { info: '8', time: 2900 },
    { info: '9', time: 5500 },
    { info: '10', time: 6600 },
    { info: '11', time: 7400 },
    { info: '12', time: 9800 },
];

function loadImage(url: { info: string, time: number }) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${url.info  }ok`);
            resolve(null);
        }, url.time);
    });
}

// promise并发控制
function limitLoad<T = any>(data: T[], handle: (arg: T) => Promise<any>, limit: number) {
    const seq = [...data];
    let promises: any[] = [];

    promises = seq.splice(0, limit).map((item, index) => 
        // 返回index，需要知道哪一个异步任务执行完了
        handle(item).then(() => index),
    );

    // 返回最先执行完毕的异步任务的结果，其实就是索引，但是其他异步任务仍然会继续执行，只是不在这里返回结果
    let p = Promise.race(promises);
    for (let i = 0;i < seq.length; i ++) {
        p = p.then(index => {
            // 将执行完毕的位置替换
            promises[index] = handle(promises[i]).then(() => index);
            return Promise.race(promises);
        });
    }
}

limitLoad(urls, loadImage, 3);