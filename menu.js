const { Menu, dialog } = require("electron");
const fs = require("fs");
const nodePath = require("node:path");
const config = require("./config.json");
const { readDir, getID3 } = require("./utils/util.js");

const openFile = (window) => {
  return {
    label: "打开文件",
    click: () => {
      dialog
        .showOpenDialog({
          properties: ["openFile"],
        })
        .then((result) => {
          if (!result.canceled) {
            const files = result.filePaths;
            window.webContents.send("open-directory", ".", files);
          }
        });
    },
  };
};

function switchMenu(flag, window) {
  switch (flag) {
    case 3:
      return [
        openFile(window),
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
        openFile(window),
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
        openFile(window),
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
        {
          label: "整理TAG",
          click: () => {
            dialog
              .showOpenDialog({
                properties: ["openDirectory"],
              })
              .then(async (result) => {
                if (!result.canceled) {
                  const path = result.filePaths[0];
                  const fileList = await readDir(path, async (item) => {
                    if (
                      [
                        ".mp3",
                        ".wav",
                        ".wma",
                        ".flac",
                        ".ogg",
                        ".aac",
                      ].includes(nodePath.extname(item))
                    ) {
                      const { common } = await getID3(path, item);
                      if (
                        common &&
                        ["artist", "albumartist", "album"].some(
                          (tag) => common[tag] === undefined
                        )
                      ) {
                        return true;
                      }
                      return false;
                    } else {
                      return false;
                    }
                  });
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
            window.loadURL(`${config["uihost"]}/music`);
            setMenu(template, 1, window);
          },
        },
        {
          label: "对比库",
          click: () => {
            window.loadURL(`${config["uihost"]}/library`);
            setMenu(template, 2, window);
          },
        },
        {
          label: "格式化cue编码",
          click: () => {
            window.loadURL(`${config["uihost"]}/encode`);
            setMenu(template, 3, window);
          },
        },
      ],
    },
  ];
  window.loadURL(`${config["uihost"]}/music`);
  setMenu(template, 1, window);
}

exports.renderMenu = renderMenu;
