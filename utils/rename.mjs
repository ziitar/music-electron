import { getID3, execPy } from "./util.js";
import fsPromises from "node:fs/promises";
import fs from "node:fs";
import nodePath from "node:path";
import fetch, { FormData, File } from "node-fetch";

const root = "Y:\\tmp";
const topRoot = nodePath.resolve(root, "..");

function getExtension(mime) {
  const [main, sub] = mime.split("/");
  if (main === "image") {
    switch (sub) {
      case "png":
      case "x-png":
      case "x-citrix-png":
        return ".png";
      case "x-icon":
        return ".ico";
      case "gif":
        return ".gif";
      case "bmp":
        return ".bmp";
      case "webp":
        return ".webp";
      case "tiff":
        return ".tiff";
      case "x-rgb":
        return ".rgb";
      case "svg+xml":
        return ".svg";
      case "jpeg":
      case "x-citrix-jpeg":
      default:
        return ".jpg";
    }
  }
  return "";
}

async function moveFile(fileName, tags) {
  let { title, album, artist, image } = tags;
  if (true) {
    const name = `${album.replace(/[\\/:?''<>|]/g, "-")}.jpg`;
    const imgPath = nodePath.join("C:\\Users\\uziit\\Pictures", name);
    if (fs.existsSync(imgPath)) {
      try {
        await fsPromises.rename(
          imgPath,
          nodePath.join(
            "C:\\Users\\uziit\\Documents\\visualizeMusicBackend\\assets",
            name
          )
        );
        await execPy(nodePath.join(root, fileName), {
          image: `http://localhost:7000/assets/${name}`,
          comment: tags.comment,
        });
        image = `http://localhost:7000/assets/${name}`;
      } catch (e) {
        console.error(e);
      }
    }
  }
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
    const url = nodePath.resolve(
      albumPath,
      `${title.replace(/[\\/:?''<>|]/g, "-")}${extname}`
    );
    await fsPromises.rename(nodePath.join(root, fileName), url);
    const formData = new FormData();
    formData.set("type", "single");
    formData.set("url", url);
    formData.set("title", title);
    formData.set("artist", artist);
    formData.set("album", album);
    formData.set("albumartist", artist);
    if (tags.year) formData.set("year", tags.year);
    if (tags.comment && tags.comment[0])
      formData.set("duration", tags.comment[0]);
    console.log(image);
    if (typeof image === "string") {
      formData.set("picUrl", image);
    } else if (image) {
      const type = image.mime || "image/jpeg";
      const fileName = `${album}${getExtension(type)}`;
      const img = new File([image.imageBuffer], fileName, { type: type });
      formData.set("file", img, fileName);
    }
    const res = await fetch("http://0.0.0.0:7000/songs/create", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.result) {
      console.log("入库成功");
    } else {
      console.error("入库失败");
    }
  } catch (err) {
    console.error(err);
  }
}

const run = async () => {
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
};

await run();
