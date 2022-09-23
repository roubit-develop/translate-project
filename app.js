const { TranslationServiceClient } = require("@google-cloud/translate");
const fs = require("fs");
const cliProgress = require("cli-progress");

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let barLength = 0;
let nowBarLength = 0;
const translationClient = new TranslationServiceClient();

const PROJECT_ID = "kakaobob-ac167";
const LOCATION = "global";
const ORIGIN_LANG = "ko";
const TARGET_LANG = 'en';
const FILE_NAME = "target-ko.json";
const RES_FILE_NAME = 'output.json';

const jsonFile1 = fs.readFileSync(FILE_NAME, "utf-8");
const jsonData1 = JSON.parse(jsonFile1);

const convertDateInfo2 = async (data) => {
  // 말단이거나 string 타입에 대해서는 탐색 안함
  if (!data || typeof data === "string") {
    console.log("❌ data[obj]", data);
    return data;
  }

  const objs = Object.keys(data);
  for await (const obj of objs) {
    try {
      if (isObject(data[obj])) {
        data[obj] = convertDateInfo2(data[obj]);
        console.log("❌ 이제 object 없는데 왜 옴?", data[obj]);
      } else {
      }
      if (data[obj]) {
        data[obj] = await translateText(data[obj]);
      } else {
        console.log(
          "❌❌ ? data[obj]",
          data[obj],
          `${data[obj]}`,
          JSON.stringify(data[obj])
        );
      }
    } catch (error) {
      console.log(
        "❌❌ catch ? data[obj]",
        data[obj],
        `${data[obj]}`,
        JSON.stringify(data[obj])
      );
    }
  }
  return data;
};

function isObject(val) {
  return val instanceof Object;
}

const translateText = async (text) => {
  if (!text || text.length <= 0) return;
  if (isObject(text)) return text;
  const request = {
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    contents: [text],
    mimeType: "text/plain", // mime types: text/plain, text/html
    sourceLanguageCode: ORIGIN_LANG, // 번역할 언어
    targetLanguageCode: TARGET_LANG, // 번역 후 언어
  };

  const [response] = await translationClient.translateText(request);
  const res = response.translations[0].translatedText;

  bar1.update(++nowBarLength);
  return res;
};

const run = async () => {
  console.log("translate start");

  // 번역할 단어의 개수
  
  const rtn = await convertDateInfo2(jsonData1);

  barLength = Object.keys(rtn).length;
  bar1.start(barLength, 0);

  fs.writeFileSync(RES_FILE_NAME, JSON.stringify(rtn));
};

run();