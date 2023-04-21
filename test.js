import NodeID3 from "node-id3";
import fs from "node:fs/promises";
import nodePath from "node:path";
import fetch from "node-fetch";
import querystring from "node:querystring";

const root = "Y:\\test";
const baseHost = { hostname: "localhost", port: 7000 };

async function getNMCMsg(path) {
  const pathParse = nodePath.parse(path);
  const res = await fetch(
    `http://localhost:7000/cloudApi/search/${encodeURIComponent(
      pathParse.name
    )}`
  );
  const data = await res.json();
  if (data.code === 200) {
    const songs = data.result?.songs || [];
    if (songs.length) {
    }
  }
}

try {
  const dir = await fs.opendir(root);
  for await (const dirent of dir) {
    getNMCMsg(dirent.name);
  }
} catch (err) {
  console.log(err);
}
