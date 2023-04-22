const NodeID3 = require("node-id3");
const nodePath = require("node:path");

function getID3(root, file) {
  const filePath = nodePath.join(root, file);
  const tags = NodeID3.read(filePath);
  return tags;
}

exports.getID3 = getID3;
