const { parseFile } = require("music-metadata");
const nodePath = require("node:path");
const util = require("node:util");
const { exec } = require("node:child_process");
const asyncExec = util.promisify(exec);
const { readdir, readFile, writeFile, rm } = require("node:fs/promises");
const root = nodePath.join(__dirname, "..");
const { analyse } = require("chardet");
const config = require("../config.json");

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

async function getAudioDuration(root, file) {
  const path = nodePath.join(root, file);
  const cmd = `"${config.ffprobePath}" ${[
    "-v",
    "error",
    "-select_streams",
    "a:0",
    "-show_format",
    "-show_streams",
    path,
  ]
    .map((item) => {
      if (typeof item === "string") {
        return `"${item}"`;
      }
      return item;
    })
    .join(" ")}`;
  const { code, stdout, stderr } = await asyncExec(cmd);
  if (stderr) {
    console.error("getAudioDuration", stderr);
  }
  if (stdout) {
    const matched = stdout.match(/duration="?(\d*)\.\d*"?/);
    if (matched && matched[1]) {
      return parseFloat(matched[1]);
    }
  }
  return undefined;
}

function getAbsolutePath(root, file) {
  return nodePath.join(root, file);
}

async function getID3(root, file) {
  const filePath = nodePath.join(root, file);
  const { common, format } = await parseFile(filePath);
  const extendsObj = {};
  if (common.picture && common.picture[0]) {
    const image = common.picture[0];
    extendsObj.image = {
      mime: image.format,
      imageBuffer: image.data,
    };
  }
  return {
    common: {
      ...common,
      ...extendsObj,
    },
    format,
  };
}

/**
 * 将ID3写入音频文件
 * 程序将 music-metadata库的ICommonTagsResult类型某些字段转化为python music_tag 的对应字段
 * python music_tag支持的字段有：
 * Disc Number,Total Discs,Track Number,Total Tracks,Title,Artist,Album,Album Artist,Year,Genre,Comment,filename
 * @param {string} path 文件路径
 * @param {Tags} tags 类型为：https://github.com/Borewit/music-metadata/blob/master/lib/type.ts  ICommonTagsResult 类型
 * @returns {Promise<string>} 返回python程序std信息
 */
function execPy(path, tags) {
  const msg = Object.entries(tags)
    .filter((item) => {
      if (
        config["ID3-item"].includes("trackNumber") &&
        config["ID3-item"].includes("totalTracks") &&
        item[0] === "track"
      ) {
        return true;
      }
      return config["ID3-item"].includes(item[0]);
    })
    .map((item) => {
      const [key, value] = item;
      if (key === "comment") {
        return `-comment="${value[0]}"`;
      } else if (key === "track") {
        return `-totalTracks=${value.of} -trackNumber=${value.no}`;
      } else {
        if (typeof value === "string" || key === "genre") {
          return `-${key}="${value}"`;
        }
        return `-${key}=${value}`;
      }
    })
    .join(" ");
  return new Promise(async (resolve, reject) => {
    const cmd = `"${nodePath.join(
      root,
      "py/dist/music-tags/music-tags.exe"
    )}" "${path}" ${msg}`;
    const { stdout, stderr } = await asyncExec(cmd);

    if (stderr) {
      reject(stderr);
    } else {
      console.log(tags.title, stdout);
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

async function deleteFile(root, file) {
  const filePath = nodePath.join(root, file);
  await rm(filePath);
}

exports.getID3 = getID3;
exports.execPy = execPy;
exports.setID3 = setID3;
exports.readDir = readDir;
exports.getCueMsg = getCueMsg;
exports.setCueMsg = setCueMsg;
exports.getAudioDuration = getAudioDuration;
exports.msToTime = msToTime;
exports.deleteFile = deleteFile;
exports.getAbsolutePath = getAbsolutePath;
