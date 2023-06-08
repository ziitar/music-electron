const { parseFile } = require("music-metadata");
const nodePath = require("node:path");
const util = require("node:util");
const { exec } = require("node:child_process");
const asyncExec = util.promisify(exec);
const { readdir, readFile, writeFile } = require("node:fs/promises");
const root = nodePath.join(__dirname, "..");
const { analyse } = require("chardet");

async function getID3(root, file) {
  const filePath = nodePath.join(root, file);
  const { common } = await parseFile(filePath);
  const existImage = {};
  if (common.picture && common.picture[0]) {
    const image = common.picture[0];
    existImage.image = {
      mime: image.mime,
      imageBuffer: image.data,
    };
  }
  return {
    ...common,
    ...existImage,
  };
}

function execPy(path, tags) {
  return new Promise(async (resolve, reject) => {
    const cmd = `${nodePath.join(root, "py/dist/music-tags.exe")} ${[
      path,
      tags.title,
      tags.artist,
      tags.album,
      tags.year,
      tags.image,
    ]
      .map((item) => {
        if (typeof item === "string") {
          return `"${item}"`;
        }
        return item;
      })
      .join(" ")}`;
    const { stdout, stderr } = await asyncExec(cmd);

    if (stderr) {
      reject(stderr);
    } else {
      console.log(stdout);
      resolve(stdout);
    }
  });
}

async function setID3(root, file, tags) {
  const filePath = nodePath.join(root, file);
  try {
    await execPy(filePath, tags);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function getCueMsg(root, file) {
  const filePath = nodePath.join(root, file);
  const fileBlob = await readFile(filePath);
  const analyseCode = analyse(fileBlob);
  return {
    analyse: analyseCode,
    buffer: fileBlob,
  };
}

async function setCueMsg(root, file, content) {
  const filePath = nodePath.join(root, file);
  return await writeFile(filePath, content);
}
/**
 * 遍历文件夹
 * @param path {string} 目录入口路径
 * @param filter {function} 过滤文件回调函数
 * @extendsPath {string} 额外的中间路径
 */
async function readDir(path, filter, extendsPath = "") {
  let result = [];
  const files = await readdir(path, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile()) {
      if (filter(file.name)) {
        result.push(nodePath.join(extendsPath, file.name));
      }
    } else {
      const fileList = await readDir(
        nodePath.join(path, file.name),
        filter,
        nodePath.join(extendsPath, file.name)
      );
      result = result.concat(fileList);
    }
  }
  return result;
}

exports.getID3 = getID3;
exports.execPy = execPy;
exports.setID3 = setID3;
exports.readDir = readDir;
exports.getCueMsg = getCueMsg;
exports.setCueMsg = setCueMsg;
