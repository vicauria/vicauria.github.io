// Vicauria 資產配置工作台 — 主題色系設定
// 每套主題定義同一組變數名稱，只是色碼不同，確保切換時每個角落都能正確套用。
// positive／negative（正負向指標色）刻意跨主題固定，避免客戶誤判數字好壞。

const JK_THEMES = {
  free: {
    label: '經典藍綠（預設）',
    tier: 'free',
    navy:'#16323F', tealDeep:'#1F5C73', teal:'#2E7391', tealTint:'#E6F0F2', tealLightText:'#BFE0EA',
    warm:'#C97B3D', warmDeep:'#A85F27', warmTint:'#FBEFE2',
    paper:'#F5F7F6', card:'#FFFFFF', ink:'#182226', inkSoft:'#5B6B70', line:'#E1E7E7'
  },
  bordeaux: {
    label: '酒紅穩重 Bordeaux',
    tier: 'pro',
    navy:'#3D1220', tealDeep:'#5C1F2B', teal:'#7A2E3D', tealTint:'#F5E6E9', tealLightText:'#E3B9C1',
    warm:'#C9975A', warmDeep:'#A67840', warmTint:'#FBF0E0',
    paper:'#FAF6F5', card:'#FFFFFF', ink:'#241014', inkSoft:'#6B5459', line:'#EBDBDE'
  },
  forest: {
    label: '森林穩健 Forest',
    tier: 'pro',
    navy:'#17301F', tealDeep:'#274A34', teal:'#3A6B4A', tealTint:'#E8F0EA', tealLightText:'#BFE0C8',
    warm:'#C9973D', warmDeep:'#A87A27', warmTint:'#FBF3E2',
    paper:'#F6F7F5', card:'#FFFFFF', ink:'#18221C', inkSoft:'#5B6B60', line:'#E1E7E2'
  },
  graphite: {
    label: '石墨現代 Graphite',
    tier: 'pro',
    navy:'#24272B', tealDeep:'#35516B', teal:'#4A6B8A', tealTint:'#E8EDF2', tealLightText:'#C3D3E0',
    warm:'#B8845A', warmDeep:'#96683F', warmTint:'#F7EEE4',
    paper:'#F6F6F7', card:'#FFFFFF', ink:'#1E2124', inkSoft:'#5C6066', line:'#E3E4E6'
  },
  plum: {
    label: '墨紫尊爵 Plum',
    tier: 'master',
    navy:'#2B1B33', tealDeep:'#4E3352', teal:'#6B4670', tealTint:'#F0E8F1', tealLightText:'#D9C0DC',
    warm:'#C9975A', warmDeep:'#A67840', warmTint:'#FBF0E0',
    paper:'#F8F6F8', card:'#FFFFFF', ink:'#201820', inkSoft:'#6B5D6E', line:'#EAE1EB'
  },
  onyx: {
    label: '黑金尊爵 Onyx & Gold',
    tier: 'master',
    navy:'#1A1A1A', tealDeep:'#96763E', teal:'#B8935A', tealTint:'#F5EDE0', tealLightText:'#E3D2AE',
    warm:'#8B7355', warmDeep:'#6B5940', warmTint:'#F0E9DE',
    paper:'#FAFAF8', card:'#FFFFFF', ink:'#1A1A1A', inkSoft:'#6B6B6B', line:'#E7E3DC'
  }
};

// 跨主題固定不變的語意色（正向／負向），避免客戶誤判數字好壞
const JK_THEME_FIXED = { positive:'#2E7D5B', negative:'#B3492F' };

// 把某一套主題實際套用到一個 document 上（可以是自己，也可以是同源 iframe 裡的頁面）
function jkApplyTheme(themeKey, doc){
  doc = doc || document;
  const t = JK_THEMES[themeKey] || JK_THEMES.free;
  const root = doc.documentElement.style;
  root.setProperty('--navy', t.navy);
  root.setProperty('--teal-deep', t.tealDeep);
  root.setProperty('--teal', t.teal);
  root.setProperty('--teal-tint', t.tealTint);
  root.setProperty('--teal-light-text', t.tealLightText);
  root.setProperty('--warm', t.warm);
  root.setProperty('--warm-deep', t.warmDeep);
  root.setProperty('--warm-tint', t.warmTint);
  root.setProperty('--paper', t.paper);
  root.setProperty('--card', t.card);
  root.setProperty('--ink', t.ink);
  root.setProperty('--ink-soft', t.inkSoft);
  root.setProperty('--line', t.line);
  root.setProperty('--positive', JK_THEME_FIXED.positive);
  root.setProperty('--negative', JK_THEME_FIXED.negative);
  // 部分頁面用的是 --brass／--ink-deep 這種舊命名（例如登入頁、貸款試算室），一併對應套用
  root.setProperty('--brass', t.teal);
  root.setProperty('--brass-light', t.tealLightText);
  root.setProperty('--ink-deep', t.navy);
}

// 每個頁面自己讀 localStorage 套用主題（處理「不是被工作台包住、而是獨立開新分頁」的情況，例如財富地圖報告）
function jkApplySavedTheme(){
  try{
    const saved = localStorage.getItem('jk_theme') || 'free';
    jkApplyTheme(saved);
  }catch(e){}
}
