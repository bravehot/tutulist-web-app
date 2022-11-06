import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import childProcess from "node:child_process";

import ora from "ora";
import { NodeSSH } from "node-ssh";
import compressing from "compressing";
import dotEnv from "dotenv";
import inquirer from "inquirer";

const BUILD_SCRIPT = "npm run build:dev";

const deploy = async () => {
  // 需要创建 .env 文件，并在 .env 文件中定义服务器 host 地址
  const { HOST } = process.env;
  if (!HOST) {
    console.log("🤔🤔部署失败，环境变量无法加载");
    process.exit(0);
  }
  const config = {
    host: HOST,
    deployType: "deploy",
  };
  inquirer
    .prompt([
      {
        type: "input",
        message: "😄😄请输入服务器用户名",
        name: "username",
      },
      {
        type: "password",
        message: "🫣 🫣 请输入服务器密码",
        name: "password",
        when: (answers) => answers.username,
      },
      {
        type: "list",
        message: "请选择部署方式",
        name: "deployType",
        choices: [
          { value: "deploy", name: "部署新版" },
          { value: "reset", name: "回退版本" },
        ],
        when: (answers) => answers.username && answers.password,
      },
    ])
    .then(({ username, password, deployType }) => {
      config.username = username;
      config.password = password;
      config.deployType = deployType;
      // 连接服务器
      connectServer(config);
    })
    .catch((err) => {
      console.log(err);
    });
};

const connectServer = async (config) => {
  try {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: config.host,
      username: config.username,
      password: config.password,
      tryKeyboard: true,
    });
    console.log("🚀 服务器连接成功");
    if (config.deployType === "deploy") {
      handleUpload(ssh);
    }

    if (config.deployType === "reset") {
      handleReset(ssh);
    }
  } catch (error) {
    console.log("❌ 服务器连接失败，请检查服务器配置🤔🤔");
    process.exit(0);
  }
};

const handleReset = async (ssh) => {
  const sftp = await ssh.requestSFTP();
  sftp.exists("/root/home/nginx/html/dist-last", async (boolean) => {
    if (boolean) {
      await ssh.execCommand("cd home/nginx/html && rm -rf dist");
      await ssh.execCommand("cd home/nginx/html && mv dist-last dist");
      await ssh.execCommand("docker restart nginx");
      console.log("🚀 docker nginx 镜像开始重启");
      console.log("🚀🚀🚀 回退成功 🚀🚀🚀");
      process.exit(0);
    } else {
      console.log("❌ 回滚失败，未发现备份产物");
      process.exit(0);
    }
  });
};

const handleZipFile = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      await compressing.tar.compressDir("dist", "dist.tar");
      await compressing.gzip.compressFile("dist.tar", "dist.tgz");
      resolve(true);
    } catch (err) {
      console.log("❌ 文件压缩失败", err);
      reject(false);
      process.exit(0);
    }
  });
};

const handleRunBuild = () => {
  const spinner = ora("开始构建 build 产物").start();
  try {
    childProcess.execSync(BUILD_SCRIPT);
    spinner.stop();
    console.log("🚀 build产物构建成功, 开始压缩文件");
  } catch (error) {
    console.log("❌ npm run build 执行失败");
    spinner.stop();
    process.exit(0);
  }
};

const handleUpload = async (ssh) => {
  handleRunBuild();

  const isSuccess = await handleZipFile();
  if (isSuccess) {
    console.log("🚀 文件压缩成功，开始上传文件");
    const __filename = fileURLToPath(import.meta.url);
    const distPath = `${dirname(__filename)}/dist.tgz`;

    try {
      await ssh.putFile(distPath, "/root/home/nginx/html/dist.tgz");
      console.log("🚀 上传文件成功");
    } catch (error) {
      console.log("❌ 上传文件失败", error);
      process.exit(0);
    }

    const sftp = await ssh.requestSFTP();
    sftp.exists("/root/home/nginx/html/dist", async (boolean) => {
      if (boolean) {
        await ssh.execCommand(
          "cd home/nginx/html && rm -rf dist-list && cp -r dist dist-last"
        );
        console.log("🚀 构建产物备份成功");
      } else {
        console.log("⚠️ 未发现上次构建产物");
      }
    });

    try {
      await ssh.execCommand("cd home/nginx/html && tar -zxvf dist.tgz -C ./");
      console.log("🚀 服务器解压文件成功");
      await ssh.execCommand("docker restart nginx");
      console.log("🚀 docker nginx 镜像开始重启");
      await ssh.execCommand("cd home/nginx/html && rm -rf dist.tgz");
      console.log("🚀 服务器压缩文件已删除");
      await removeLocalFile();
      console.log("🚀🚀🚀 部署成功 🚀🚀🚀");
      process.exit(0);
    } catch (error) {
      console.log("❌ 部署失败，请检查服务器", error);
      process.exit(0);
    }
  }
};

const removeLocalFile = async () => {
  const __filename = fileURLToPath(import.meta.url);
  try {
    await fs.unlink(`${dirname(__filename)}/dist.tar`);
    await fs.unlink(`${dirname(__filename)}/dist.tgz`);
    console.log("🚀本地压缩文件已删除");
  } catch (error) {
    console.log("❌本地压缩文件删除失败", error);
  }
};
// 获取环境变量
dotEnv.config();
// 执行部署代码;
deploy();
