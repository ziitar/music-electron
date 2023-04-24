const { parseFile } = require("music-metadata");
const { inspect } = require("node:util");
const { execPy } = require("./util.js");

const filePath = "G:\\IDM\\Music\\马吟吟&CORSAK胡梦周-溯.mp3";
(async () => {
  try {
    const metadata = await parseFile(filePath);
    await execPy(filePath, metadata.common);
    console.log("run finish");
  } catch (error) {
    console.error("error: ", error.message);
  }
})();
