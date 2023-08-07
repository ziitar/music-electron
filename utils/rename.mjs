import { getID3, execPy } from "./util.js";
import fsPromises from "node:fs/promises";
import fs from "node:fs";
import nodePath from "node:path";
import fetch, { FormData, File } from "node-fetch";
import config from "../config.json";

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
function formatFileName(name) {
  return name.replace(/[\\/:?''<>|]/g, "_");
}
async function moveFile(fileName, tags, format) {
  let { title, album, albumartist, artist, image } = tags;
  if (!image) {
    const name = `${formatFileName(album)}-${formatFileName(albumartist)}.jpg`;
    const imgPath = nodePath.join("C:\\Users\\uziit\\Pictures", name);
    if (fs.existsSync(imgPath)) {
      try {
        const imageFile = await fsPromises.readFile(imgPath);
        const formData = new FormData();
        formData.set("file", imageFile, name);
        await fetch(`${config.backendhost}/assets/upload`, {
          method: "PUT",
          body: formData,
        });
        await execPy(nodePath.join(root, fileName), {
          image: `${config.backendhost}/assets/${name}`,
        });
        image = `/assets/${name}`;
      } catch (e) {
        console.error(e);
      }
    }
  }
  let changeArtist = artist.replace(/[,，、]/g, " & ").replace(/\b&\b/g, " & ");
  const artistPath = nodePath.resolve(topRoot, formatFileName(changeArtist));
  try {
    const extname = nodePath.extname(fileName);
    const existArtist = fs.existsSync(artistPath);
    if (!existArtist) {
      await fsPromises.mkdir(artistPath);
    }
    const albumPath = nodePath.resolve(artistPath, formatFileName(album));
    const existAlbum = fs.existsSync(albumPath);
    if (!existAlbum) {
      await fsPromises.mkdir(albumPath);
    }
    const url = nodePath.resolve(
      albumPath,
      `${formatFileName(title)}${extname}`
    );
    await fsPromises.rename(nodePath.join(root, fileName), url);
    const formData = new FormData();
    formData.set("type", "single");
    formData.set("url", url);
    formData.set("title", title);
    formData.set("artist", artist);
    formData.set("album", album);
    formData.set("albumartist", albumartist);
    formData.set("year", tags.year || null);
    formData.set("duration", format.duration || null);
    formData.set("trackNo", tags.track.no || null);
    formData.set("trackTotal", tags.track.of || null);
    formData.set("diskNo", tags.disk.no || null);
    formData.set("diskTotal", tags.disk.of || null);
    formData.set("lossless", format.lossless || null);
    formData.set("sampleRat", format.sampleRat || null);
    formData.set("start", format.start || null);
    formData.set("bitrate", format.bitrate || null);
    if (typeof image === "string") {
      formData.set("picUrl", image);
    } else if (image) {
      const type = image.mime || "image/jpeg";
      const fileName = `${album}${getExtension(type)}`;
      const img = new File([image.imageBuffer], fileName, { type: type });
      formData.set("file", img, fileName);
    }
    const res = await fetch(`${config.backendhost}/songs/create`, {
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
          if (tags.common) {
            await moveFile(dirent.name, tags.common, tags.format);
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

await run();
