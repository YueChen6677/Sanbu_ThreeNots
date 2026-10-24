// ===== 视频文件路径（按你的实际文件名修改） =====
const introSrc = 'videos/INTRO.mp4';

const bgList = [
  'videos/BG-EYE.mp4',    // 目
  'videos/BG-EAR.mp4',    // 耳
  'videos/BG-MOUTH.mp4'   // 口
];

const clips = [
  { src: 'videos/LISTEN.mp4',      zh: '听个明白。', en: 'Hear it all.' },
  { src: 'videos/SAY.mp4',         zh: '大声开口。', en: 'Speak out.' },
  { src: 'videos/WATCH.mp4',       zh: '睁大眼睛。', en: 'Look it in the face.' },
  { src: 'videos/DONT-LISTEN.mp4', zh: '勿听。',     en: 'Hear nothing.' },
  { src: 'videos/DONT-SAY.mp4',    zh: '勿说。',     en: 'Swallow your word.' },
  { src: 'videos/DONT-WATCH.mp4',  zh: '勿看。',     en: 'Look away.' }
];

// ===== 元素 =====
const mainVideo = document.getElementById('main-video');
const bgVideo = document.getElementById('bg-video');
const enterScreen = document.getElementById('enter');
const home = document.getElementById('home');
const again = document.getElementById('again');
const skipBtn = document.getElementById('skip-btn');

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

// ===== 背景素材：随机顺序，一个播完播下一个 =====
let lastBg = -1;

function playNextBg() {
  let i;
  do {
    i = Math.floor(Math.random() * bgList.length);
  } while (i === lastBg && bgList.length > 1);
  lastBg = i;
  bgVideo.src = bgList[i];
  bgVideo.play();
}

bgVideo.addEventListener('ended', playNextBg);

// ===== 显示主页 =====
function showHome() {
  playNextBg();
  bgVideo.classList.remove('hidden');
  home.classList.remove('hidden');
  typeAll(home);
}

// ===== 1. 进入页：打字机 + 点击进入 =====
typeAll(enterScreen);

document.getElementById('enter-btn').addEventListener('click', () => {
  enterScreen.classList.add('hidden');
  mainVideo.src = introSrc;
  mainVideo.classList.remove('hidden');
  skipBtn.classList.remove('hidden');
  mainVideo.play();
});

// 开场动画结束后，淡入主页
// 6段动画结束后，弹窗并显示 Again 按钮
let currentClip = null;

// 点击 Skip：停止当前视频，直接走"播放结束"的流程
skipBtn.addEventListener('click', () => {
  mainVideo.pause();
  mainVideo.dispatchEvent(new Event('ended'));
});

mainVideo.addEventListener('ended', () => {
  skipBtn.classList.add('hidden');
  if (currentClip === null) {
    // 开场动画结束
    mainVideo.classList.add('hidden');
    showHome();
  } else {
    // 结果动画结束，稍等一下再弹窗，让最后一帧先显示
    setTimeout(() => {
      alert(currentClip.zh + '\n' + currentClip.en);
      again.classList.remove('hidden');
    }, 300);
  }
});

// ===== 2. 点击抽签：随机播放6段之一 =====
document.getElementById('draw-btn').addEventListener('click', () => {
  home.classList.add('hidden');
  bgVideo.classList.add('hidden');
  bgVideo.pause();

  currentClip = clips[Math.floor(Math.random() * clips.length)];
  mainVideo.src = currentClip.src;
  mainVideo.classList.remove('hidden');
  skipBtn.classList.remove('hidden');
  mainVideo.play();
});

// ===== 3. 再抽一次：回主页，不重播开场 =====
document.getElementById('again-btn').addEventListener('click', () => {
  again.classList.add('hidden');
  mainVideo.classList.add('hidden');
  currentClip = null;
  showHome();
});
