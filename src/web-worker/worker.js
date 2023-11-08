const workercode = () => {
  let counterTime = 0;
  let interval;
  onmessage = (e) => {
    // worker get data from method postMessage in file App.tsx
    if (e.data === "start") {
      // counter idle time
      interval = setInterval(() => {
        counterTime += 5;
        postMessage(counterTime);
      }, 5000);
    }
    if (e.data === "stop") {
      // set counterTime = 0 when user active
      counterTime = 0;
      clearInterval(interval);
    }

    if (e.data.title === "market_sessions") {
      const { nextTime } = e.data;

      if(nextTime){
        setTimeout(() => {
          postMessage("change_sessions");
        }, nextTime);
      }
    }
  };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

export default worker_script;
