const { Menu, dialog } = require("electron");
const fs = require("fs");
const nodePath = require("node:path");
const config = require("./config.json");
const { readDir } = require("./utils/util.js");

function switchMenu(flag, window) {
  switch (flag) {
    case 3:
      return [
        {
          label: "打开文件",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openFile"],
              })
              .then((result) => {
                if (!result.canceled) {
                  const files = result.filePaths;
                  window.webContents.send("open-files", files);
                }
              });
          },
        },
        {
          label: "打开文件夹",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openDirectory"],
              })
              .then(async (result) => {
                if (!result.canceled) {
                  const path = result.filePaths[0];
                  const fileList = await readDir(path, (item) =>
                    [".cue"].includes(nodePath.extname(item))
                  );
                  window.webContents.send("open-directory", path, fileList);
                }
              });
          },
        },
      ];
    case 2:
      return [
        {
          label: "打开文件",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openFile"],
              })
              .then((result) => {
                if (!result.canceled) {
                  const files = result.filePaths;
                  window.webContents.send("open-files", files);
                }
              });
          },
        },
        {
          label: "打开文件夹",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openDirectory"],
              })
              .then(async (result) => {
                if (!result.canceled) {
                  const path = result.filePaths[0];
                  const fileList = await readDir(path, (item) =>
                    [".mp3", ".wav", ".wma", ".flac", ".ogg", ".aac"].includes(
                      nodePath.extname(item)
                    )
                  );
                  window.webContents.send("open-directory", path, fileList);
                }
              });
          },
        },
      ];
    case 1:
    default:
      return [
        {
          label: "打开文件",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openFile"],
              })
              .then((result) => {
                if (!result.canceled) {
                  const files = result.filePaths;
                  window.webContents.send("open-files", files);
                }
              });
          },
        },
        {
          label: "打开文件夹",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openDirectory"],
              })
              .then(async (result) => {
                if (!result.canceled) {
                  const path = result.filePaths[0];
                  const fileList = await readDir(path, (item) =>
                    [".mp3", ".wav", ".wma", ".flac", ".ogg", ".aac"].includes(
                      nodePath.extname(item)
                    )
                  );
                  window.webContents.send("open-directory", path, fileList);
                }
              });
          },
        },
      ];
  }
}

function setMenu(template, flag, window) {
  const extendsMenu = switchMenu(flag, window);
  const menu = Menu.buildFromTemplate(template.concat(extendsMenu));
  Menu.setApplicationMenu(menu);
}

function renderMenu(window) {
  const template = [
    {
      label: "功能",
      submenu: [
        {
          label: "ID3",
          click: () => {
            window.loadURL(config["music-id3"]);
            setMenu(template, 1, window);
          },
        },
        {
          label: "对比库",
          click: () => {
            window.loadURL(config["music-library"]);
            setMenu(template, 2, window);
          },
        },
        {
          label: "格式化cue编码",
          click: () => {
            window.loadURL(config["cue-encode"]);
            setMenu(template, 3, window);
          },
        },
      ],
    },
  ];
  window.loadURL(config["music-id3"]);
  setMenu(template, 1, window);
}

exports.renderMenu = renderMenu;
