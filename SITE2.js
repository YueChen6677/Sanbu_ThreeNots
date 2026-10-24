const introSrc = [
  'videos/目.mp4',    // 目
  'videos/耳.mp4',    // 耳
  'videos/口.mp4'   // 口
];

const bgList = [
  'videos/目.mp4',    // 目
  'videos/耳.mp4',    // 耳
  'videos/口.mp4'   // 口
];

const clips = [
  { src: 'videos/LISTEN.mp4',      zh: '听个明白。', en: 'Hear it all.' },
  { src: 'videos/SAY.mp4',         zh: '大声开口。', en: 'Speak out.' },
  { src: 'videos/WATCH.mp4',       zh: '睁大眼睛。', en: 'Look it in the face.' },
  { src: 'videos/DONT LISTEN.mp4', zh: '勿听。',     en: 'Hear nothing.' },
  { src: 'videos/DONT SAY.mp4',    zh: '勿说。',     en: 'Swallow your word.' },
  { src: 'videos/DONT WATCH.mp4',  zh: '勿看。',     en: 'Look away.' }
];

// ===== 元素 =====
const mainVideo = document.getElementById('main-video');
const bgVideo = document.getElementById('bg-video');
const enterScreen = document.getElementById('enter');
const home = document.getElementById('home');
const again = document.getElementById('again');
const skipBtn = document.getElementById('skip-btn');

bgVideo.muted = true; // 背景静音，避免浏览器拦截自动播放

// ===== 状态 =====
let phase = 'enter';        // enter | intro | home | clip | result
let currentClip = null;
let lastClipIndex = -1;
let lastBg = -1;
let mainDone = null;        // 主视频播完（或出错/跳过）后要执行的函数

// ===== 打字机效果（英文） =====
function typeText(el) {
  const text = el.dataset.text;
  if (!text) return;
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(timer);
  }, 50);
}

function typeAll(parent) {
  parent.querySelectorAll('.en[data-text]').forEach(typeText);
}

// ===== 通用：换源并播放 =====
function playVideo(video, src) {
  video.src = src;
  video.load();
  const p = video.play();
  if (p && p.catch) p.catch(err => console.warn('播放失败：' + src, err));
}

// ===== 主视频：开场 / 6段结果共用 =====
function playMain(src, done) {
  mainDone = done;
  mainVideo.classList.remove('hidden');
  playVideo(mainVideo, src);
}

function finishMain() {
  const f = mainDone;
  mainDone = null;        // 保证每次只触发一次
  if (f) f();
}

mainVideo.addEventListener('ended', finishMain);
mainVideo.addEventListener('error', () => {
  console.error('视频加载失败：' + mainVideo.src);
  finishMain();           // 文件缺失时也不卡死，直接进入下一步
});

// ===== 背景素材：随机顺序，一个播完播下一个 =====
function playNextBg() {
  // 第一次随机选一个起点，之后按 目 → 耳 → 口 顺序轮换
  lastBg = (lastBg === -1)
    ? Math.floor(Math.random() * bgList.length)
    : (lastBg + 1) % bgList.length;
  playVideo(bgVideo, bgList[lastBg]);
}

bgVideo.addEventListener('ended', () => {
  if (phase === 'home') playNextBg();
});
bgVideo.addEventListener('error', () => console.error('视频加载失败：' + bgVideo.src));

// ===== 显示主页 =====
function showHome() {
  phase = 'home';
  mainVideo.pause();
  mainVideo.classList.add('hidden');
  playNextBg();
  bgVideo.classList.remove('hidden');
  home.classList.remove('hidden');
  skipBtn.classList.remove('hidden');
  typeAll(home);
}

// ===== 1. 进入页：打字机 + 点击进入 =====
typeAll(enterScreen);

document.getElementById('enter-btn').addEventListener('click', () => {
  phase = 'intro';
  enterScreen.classList.add('hidden');
  skipBtn.classList.remove('hidden');
  playMain(introSrc, () => {
    skipBtn.classList.add('hidden');
    showHome();
  });
});

// Skip：开场动画 -> 直接进主页；主页 -> 换下一个背景素材
skipBtn.addEventListener('click', () => {
  if (phase === 'intro') {
    mainVideo.pause();
    finishMain();
  } else if (phase === 'home') {
    playNextBg();
  }
});

// ===== 2. 点击抽签：随机播放6段之一（不连续抽到同一个） =====
function pickClip() {
  let i;
  do {
    i = Math.floor(Math.random() * clips.length);
  } while (i === lastClipIndex && clips.length > 1);
  lastClipIndex = i;
  return clips[i];
}

document.getElementById('draw-btn').addEventListener('click', () => {
  if (phase !== 'home') return;   // 防止连点
  phase = 'clip';

  home.classList.add('hidden');
  bgVideo.classList.add('hidden');
  bgVideo.pause();
  skipBtn.classList.add('hidden');

  currentClip = pickClip();
  console.log('抽到：', currentClip.src);

  playMain(currentClip.src, () => {
    phase = 'result';
    // 稍等一下再弹窗，让最后一帧先显示
    setTimeout(() => {
      alert(currentClip.zh + '\n' + currentClip.en);
      again.classList.remove('hidden');
    }, 300);
  });
});

// ===== 3. 再抽一次：回主页，不重播开场 =====
document.getElementById('again-btn').addEventListener('click', () => {
  again.classList.add('hidden');
  showHome();
});
