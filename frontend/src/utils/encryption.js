import CryptoJS from "crypto-js";
import { stringifyIfObject } from ".";

export const generateRandomKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

export function createMD5Hash(rawInput) {
  const hash = CryptoJS.HmacMD5(stringifyIfObject(rawInput), "HOlla");

  return hash.toString();
}
