const mongoose = require("mongoose");

function isValidMongooseObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
module.exports.convertToObjectId = (id) => {
  if (isValidMongooseObjectId(id)) return id;
  if (typeof id === "string") return new mongoose.Types.ObjectId(id);

  return null;
};

module.exports.convertObjectIdToString = (id) => {
  if (!id) return;
  if (typeof id === "string") return id;

  if (isValidMongooseObjectId(id)) return id.toString();

  return "";
};
