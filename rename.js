const { getID3 } = require("./util.js");
const fsPromises = require("node:fs/promises");
const fs = require("node:fs");
const nodePath = require("node:path");

const root = "Y:\\tmp";
const topRoot = nodePath.resolve(root, "..");
console.log(topRoot);

async function moveFile(fileName, tags) {
  const { title, album, artist } = tags;
  let changeArtist = artist.replace(/[,，、]/g, " & ").replace(/\b&\b/g, " & ");
  const artistPath = nodePath.resolve(
    topRoot,
    changeArtist.replace(/[\\/:?''<>|]/g, "-")
  );
  try {
    const extname = nodePath.extname(fileName);
    const existArtist = fs.existsSync(artistPath);
    if (!existArtist) {
      await fsPromises.mkdir(artistPath);
    }
    const albumPath = nodePath.resolve(
      artistPath,
      album.replace(/[\\/:?''<>|]/g, "-")
    );
    const existAlbum = fs.existsSync(albumPath);
    if (!existAlbum) {
      await fsPromises.mkdir(albumPath);
    }
    await fsPromises.rename(
      nodePath.join(root, fileName),
      nodePath.resolve(
        albumPath,
        `${title.replace(/[\\/:?''<>|]/g, "-")}${extname}`
      )
    );
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  try {
    const dir = await fsPromises.opendir(root);
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        if (
          [".mp3", ".wav", ".wma", ".flac", ".ogg", ".aac"].includes(
            nodePath.extname(dirent.name)
          )
        ) {
          const tags = await getID3(root, dirent.name);
          if (tags) {
            await moveFile(dirent.name, tags);
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
