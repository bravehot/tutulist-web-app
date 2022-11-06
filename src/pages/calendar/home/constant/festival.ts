type FestivalType = Record<string, Record<"title", string>>;

// 公历节日数据
const festival: FestivalType = {
  "1-1": {
    title: "元旦节",
  },
  "2-14": {
    title: "情人节",
  },
  "5-1": {
    title: "劳动节",
  },
  "5-4": {
    title: "青年节",
  },
  "6-1": {
    title: "儿童节",
  },
  "9-10": {
    title: "教师节",
  },
  "10-1": {
    title: "国庆节",
  },
  "12-25": {
    title: "圣诞节",
  },

  "3-8": {
    title: "妇女节",
  },
  "3-12": {
    title: "植树节",
  },
  "4-1": {
    title: "愚人节",
  },
  "4-4": {
    title: "清明节",
  },
  "5-12": {
    title: "护士节",
  },
  "7-1": {
    title: "建党节",
  },
  "8-1": {
    title: "建军节",
  },
  "12-24": {
    title: "平安夜",
  },
};

// 阴历节日数据
const lFestival: FestivalType = {
  "12-30": {
    title: "除夕",
  },
  "1-1": {
    title: "春节",
  },
  "1-15": {
    title: "元宵节",
  },
  "2-2": {
    title: "龙抬头",
  },
  "5-5": {
    title: "端午节",
  },
  "7-7": {
    title: "七夕节",
  },
  "7-15": {
    title: "中元节",
  },
  "8-15": {
    title: "中秋节",
  },
  "9-9": {
    title: "重阳节",
  },
  "10-1": {
    title: "寒衣节",
  },
  "10-15": {
    title: "下元节",
  },
  "12-8": {
    title: "腊八节",
  },
  "12-23": {
    title: "北方小年",
  },
  "12-24": {
    title: "南方小年",
  },
};

export { festival, lFestival };
