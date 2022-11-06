import fs from "node:fs/promises";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import dotEnv from "dotenv";
import OSS from "ali-oss";

// 获取环境变量
dotEnv.config();

const __filename = fileURLToPath(import.meta.url);
const distPath = `${dirname(__filename)}/dist`;

const client = new OSS({
  region: "oss-cn-beijing",
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  bucket: "tutulist-web-static",
});

const deploy = async () => {
  await uploadNoCacheFile();
  await uploadCacheFile();
  // 删除冗余 oss 文件
  await removeExtraFile();
};

const uploadNoCacheFile = async () => {
  const dir = await fs.opendir(distPath);
  // 上传非 hash 资源
  for await (const dirent of dir) {
    if (dirent.name !== "assets") {
      await client.put(dirent.name, `${distPath}/${dirent.name}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
    }
  }
  console.log("🚀 非 hash 文件上传成功");
};

// 上传带 hash 的资源
const uploadCacheFile = async () => {
  const assetPath = `${distPath}/assets`;
  const dir = await fs.opendir(assetPath);
  for await (const dirent of dir) {
    const filePath = `assets/${dirent.name}`;
    const isExist = await isExistObject(filePath);
    if (!isExist) {
      await client.put(`assets/${dirent.name}`, `${assetPath}/${dirent.name}`, {
        headers: {
          "Cache-Control": "max-age=31536000",
        },
      });
    }
  }
  console.log("🚀 hash 文件上传成功");
};

const isExistObject = async (name, options = {}) => {
  try {
    await client.head(name, options);
    return true;
  } catch (error) {
    return false;
  }
};

// 删除老的文件
const removeExtraFile = async () => {
  const { res, objects } = await client.list({
    prefix: "assets/",
  });
  // 将最后一次的产物与 oss 中已有的做对比，将不存在的进行删除
  if (res.status === 200) {
    const notExistFileList = [];
    const __filename = fileURLToPath(import.meta.url);
    const distPath = `${dirname(__filename)}/dist`;

    for (let ossPath of objects) {
      try {
        await fs.access(`${distPath}/${ossPath.name}`);
      } catch (error) {
        notExistFileList.push(ossPath.name);
      }
    }

    if (notExistFileList.length) {
      client.useBucket("tutulist-web-static");

      console.log("🚀 发现 oss 中存在冗余文件，正在删除。。。");
      try {
        const {
          res: { status },
        } = await client.deleteMulti(notExistFileList);
        if (status === 200) {
          console.log("🚀 冗余 oss 文件已删除");
        }
      } catch (error) {
        console.log(`❌ 冗余 oss 文件 删除失败`);
      }
    } else {
      console.log("❗️ 未发现冗余 oss 文件");
    }
    process.exit(0);
  }
};

// 执行部署代码;
deploy();
