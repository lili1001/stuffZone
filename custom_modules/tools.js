const generateId = length => {
  const base = "abcdefghijklmonpqrstuvwxyz";
  let id = "";
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * 26);
    id = id + base[index];
  }
  return id;
};

module.exports = { generateId };
