const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const { init: initDB, Counter } = require("./db");

// 添加微信配置
const config = {
  API_URL: "https://api.weixin.qq.com/sns/jscode2session",
  APP_ID: "wx435ec14cba95f522",
  APP_SECRET: "c9c59e954cf932bf1552731c3d78f457"
};

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 小程序调用，获取微信 openid
app.get("/api/wx_openid", async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  try {
    const response = await axios.get(config.API_URL, {
      params: {
        appid: config.APP_ID,
        secret: config.APP_SECRET,
        js_code: code,
        grant_type: "authorization_code"
      }
    });

    const { openid } = response.data;
    
    if (openid) {
      res.json({ openid });
    } else {
      res.status(400).json({ error: "openid not found in response" });
    }
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch openid from API" 
    });
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
