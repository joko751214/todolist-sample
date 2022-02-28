function errorHandle(res, headers) {
  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: "false",
      message: "格式錯誤",
    })
  );
  res.end();
}

module.exports = errorHandle;
