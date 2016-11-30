var url1 = "https://domain1:1200";
var url2 = "https://domain2";

console.log("host1: " +url1.split("://")[1].split(":")[0]);
console.log("port1: " +url1.split("://")[1].split(":")[1] || "");
console.log("host2: " +url2.split("://")[1].split(":")[0]);
console.log("port1: " + (url2.split("://")[1].split(":")[1] || url2.split("://")[0]=="http"?"80":"443"));
