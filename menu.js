const { Menu, dialog } = require("electron");
const fs = require("fs");

function renderMenu(window) {
  const template = [
    {
      label: "File",
      submenu: [
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
              .then((result) => {
                if (!result.canceled) {
                  const path = result.filePaths[0];
                  const fileList = fs.readdirSync(path);
                  window.webContents.send("open-directory", path, fileList);
                }
              });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  return menu;
}

exports.renderMenu = renderMenu;
