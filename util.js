const { parseFile } = require("music-metadata");
const nodePath = require("node:path");
const { PythonShell } = require("python-shell");
const nodeId3 = require("node-id3");
const iconv = require("iconv-lite");

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
  return new Promise((resolve, reject) => {
    const pythonProcess = new PythonShell("./music-tags.py", {
      args: [path, tags.title, tags.artist, tags.album, tags.year, tags.image],
    });

    pythonProcess.on("message", (message) => {
      console.log(message);
    });
    pythonProcess.end((err, code, signal) => {
      if (err) {
        reject(err);
      } else {
        resolve(code);
      }
    });
  });
}

function setID3WithNodeID3(root, file, tags) {
  const result = nodeId3.update(tags, nodePath.join(root, file));
  if (result) {
    return true;
  } else {
    console.error(result);
    return false;
  }
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

exports.getID3 = getID3;
exports.execPy = execPy;
exports.setID3 = setID3;
exports.setID3WithNodeID3 = setID3WithNodeID3;
