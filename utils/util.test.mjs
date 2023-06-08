import musicMetadata from "music-metadata";
import utils from "./util.js";
import test from "node:test";
import nodePath from "node:path";
import assert from "node:assert";

const path = "Y:\\";
// test("test utils map readDir", async (t) => {
//   const dir = await utils.readDir(path, (file) => {
//     return [".wav"].includes(nodePath.extname(file));
//   });
//   console.log(JSON.stringify(dir));
//   assert.equal(dir.length, 54);
// });

test("test utils getCue", async (t) => {
  try {
    const { content, analyse, buffer } = await utils.getCueMsg(
      path,
      "林俊杰46专辑54CD\\2006-曹操[内地版][WAV]\\2006-曹操[内地版][WAV]\\林俊杰.-.[曹操](2006)[WAV].cue"
    );
    console.log(content, JSON.stringify(analyse));
    assert.equal(content, "");
  } catch (e) {
    console.error(e);
  }
});
