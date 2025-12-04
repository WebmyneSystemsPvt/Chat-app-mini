export const promisifySocketEmitCallback = (socket, ...args) => {
  return new Promise((resolve) => {
    const callback = args.at(-1);
    let splicedArgs;
    if (typeof callback === "function") {
      splicedArgs = args.slice(0,args.length - 1);
    }

    socket.emit(...splicedArgs, async (...callbackArgs) => {
      if (typeof callback === "function") {
        const res = await callback(...callbackArgs);
        resolve(res);
      }
      resolve()
    });
  });
};
