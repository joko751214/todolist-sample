const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errHandle");
const successHandle = require("./successHandle");
const todos = [];

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Length, X-Requested-With", // headers 允許哪些資訊
  "Access-Control-Allow-Origin": "*", // 允許其他IP造訪
  "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE", // 支援的方法
  "Content-Type": "application/json",
};

const requestListener = (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url === "/todos" && req.method === "GET") {
    successHandle(res, headers, todos);
  } else if (req.url === "/todos" && req.method === "POST") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          todos.push({
            title,
            id: uuidv4(),
          });
          successHandle(res, headers, todos);
        } else {
          errHandle(res, headers, "缺少 title 屬性");
        }
      } catch (err) {
        errHandle(res, headers, "格式錯誤");
      }
    });
  } else if (req.url === "/todos" && req.method === "DELETE") {
    todos.length = 0;
    successHandle(res, headers, todos);
  } else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    const index = todos.findIndex((el) => el.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      successHandle(res, headers, todos);
    } else {
      errHandle(res, headers, "id 不存在");
    }
  } else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex((el) => el.id === id);
        if (title !== undefined && index !== -1) {
          todos[index].title = title;
          successHandle(res, headers, todos);
        } else {
          errHandle(res, headers, "缺少 title 屬性，或是 id 不存在");
        }
      } catch (err) {
        errHandle(res, headers, "格式錯誤");
      }
    });
  } else if (req.method === "OPTION") {
    res.writeHead(200, headers);
    res.end();
  } else {
    errHandle(res, headers, "路由錯誤");
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
