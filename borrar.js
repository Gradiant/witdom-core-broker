var url1 = "https://domain1:1200";
var url2 = "https://domain2";

console.log("host1: " +url1.split("://")[1].split(":")[0]);
console.log("port1: " +url1.split("://")[1].split(":")[1] || "");
console.log("host2: " +url2.split("://")[1].split(":")[0]);
console.log("port1: " + (url2.split("://")[1].split(":")[1] || url2.split("://")[0]=="http"?"80":"443"));


var abcd = {"auth":{"identity":{"methods": ["password"],"password": {"user": {"domain": {"name": "Default"}, "name": "testuser", "password": "testuser"}}}}};

console.log(JSON.stringify(abcd,null,2));