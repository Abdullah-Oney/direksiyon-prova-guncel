/* Direksiyon Provası — original educational driving simulation. No car brand or third-party game assets are used. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const startScreen = $('#start-screen');
  const gameScreen = $('#game-screen');
  const stageContent = $('#stage-content');
  const driveScreen = $('#drive-screen');
  const modalRoot = $('#modal-root');
  const toastEl = $('#toast');
  const scoreEl = $('#score-value');
  const stageLabel = $('#stage-label');
  const driveToastEl = $('#drive-toast');

  const state = {
    score: 0,
    completedStages: new Set(),
    quizStage: 'trunk',
    selected: new Set(),
    targets: [],
    cabinIndex: 0,
    cabinTargets: [],
    penaltyEvents: new Set(),
    driveStarted: false,
    finalScore: 0,
    driveOnlyMode: false,
    driveBaseScore: 0,
  };

  const trunkItems = [
    { id: 'spare', name: 'Stepne', art: 'assets/objects/spare.svg', short: 'Yedek lastik', note: 'Lastik kullanılamadığında yedeği.' },
    { id: 'jack', name: 'Kriko', art: 'assets/objects/jack.svg', short: 'Aracı kaldırır', note: 'Lastik değişiminde aracı kaldırır.' },
    { id: 'wrench', name: 'Bijon anahtarı', art: 'assets/objects/wrench.svg', short: 'Bijonları söker', note: 'Bijonları gevşetip sıkar.' },
    { id: 'triangle', name: 'Reflektör', art: 'assets/objects/triangle.svg', short: 'Uyarı işareti', note: 'Duran aracı diğer sürücülere bildirir.' },
    { id: 'firstaid', name: 'İlk yardım çantası', art: 'assets/objects/firstaid.svg', short: 'Acil malzeme', note: 'Temel ilk yardım malzemelerini içerir.' },
    { id: 'tools', name: 'Araç takımı', art: 'assets/objects/tools.svg', short: 'Temel araçlar', note: 'Araçta bulunabilen temel takımlar.' },
    { id: 'rope', name: 'Çekme halatı', art: 'assets/objects/rope.svg', short: 'Çekme desteği', note: 'Uygun koşullarda çekme için kullanılır.' },
    { id: 'flashlight', name: 'El feneri', art: 'assets/objects/flashlight.svg', short: 'Aydınlatma', note: 'Karanlıkta çevreyi aydınlatır.' },
    { id: 'sealant', name: 'Lastik tamir kiti', art: 'assets/objects/sealant.svg', short: 'Geçici tamir', note: 'Bazı araçlarda stepne yerine bulunur.' },
  ];

  const hoodItems = [
    { id: 'engine', name: 'Motor', art: 'assets/objects/engine.svg', short: 'Araca güç üretir', note: 'Yakıt/enerjiyi hareket için güce dönüştürür.' },
    { id: 'battery', name: 'Akü', art: 'assets/objects/battery.svg', short: 'Elektrik enerjisi', note: 'Marş ve elektrik sistemini besler.' },
    { id: 'oilcap', name: 'Yağ dolum kapağı', art: 'assets/objects/oilcap.svg', short: 'Yağ ekleme', note: 'Motor yağı buradan eklenir.' },
    { id: 'dipstick', name: 'Yağ ölçüm çubuğu', art: 'assets/objects/dipstick.svg', short: 'Yağ seviyesi', note: 'Motor yağı seviyesini kontrol eder.' },
    { id: 'coolant', name: 'Soğutma sıvısı', art: 'assets/objects/coolant.svg', short: 'Isı kontrolü', note: 'Motorun çalışma sıcaklığını düzenler.' },
    { id: 'washer', name: 'Cam yıkama suyu', art: 'assets/objects/washer.svg', short: 'Camı temizler', note: 'Cama yıkama sıvısı gönderir.' },
    { id: 'brakefluid', name: 'Fren hidroliği', art: 'assets/objects/brakefluid.svg', short: 'Fren sistemi', note: 'Fren pedalındaki kuvveti iletir.' },
    { id: 'airfilter', name: 'Hava filtresi', art: 'assets/objects/airfilter.svg', short: 'Havayı süzer', note: 'Motora giren havadaki parçacıkları süzer.' },
  ];

  const cabinItems = [
    { id: 'signalRight', name: 'Sağ sinyal', art: 'assets/cabin/signalRight.svg', question: 'Sağa dönüş için sinyal kolunu hangi yönde hareket ettirirsin?', note: 'Yaygın düzende kolu yukarı it.' },
    { id: 'signalLeft', name: 'Sol sinyal', art: 'assets/cabin/signalLeft.svg', question: 'Sola dönüş için sinyal kolunu hangi yönde hareket ettirirsin?', note: 'Yaygın düzende kolu aşağı çek.' },
    { id: 'wiperStalk', name: 'Silecek kolu', art: 'assets/cabin/wiperStalk.svg', question: 'Ön cam sileceklerini çalıştıran kumandayı bul.', note: 'Genellikle direksiyonun yanında bir koldur.' },
    { id: 'fogSwitch', name: 'Sis lambası kumandası', art: 'assets/cabin/fogSwitch.svg', question: 'Sis lambalarını açan kumandayı bul.', note: 'Düğmenin yeri araca göre değişebilir.' },
    { id: 'hazard', name: 'Dörtlü ikaz düğmesi', art: 'assets/cabin/hazard.svg', question: 'Dörtlü ikaz lambalarını hangi düğme açar?', note: 'Genellikle kırmızı üçgen sembolüdür.' },
    { id: 'oilWarning', name: 'Yağ basıncı uyarısı', art: 'assets/cabin/oilWarning.svg', question: 'Motor yağ basıncı sorunu hangi uyarı sembolüyle gösterilir?', note: 'Kırmızı yağdanlık sembolü.' },
    { id: 'seatbeltWarning', name: 'Kemer uyarısı', art: 'assets/cabin/seatbeltWarning.svg', question: 'Emniyet kemeri uyarı göstergesini bul.', note: 'Kemer takılmadığında yanabilir.' },
    { id: 'brakeWarning', name: 'Fren / park freni uyarısı', art: 'assets/cabin/brakeWarning.svg', question: 'Fren veya park freni uyarı sembolünü bul.', note: 'Araçta genellikle kırmızı daire içinde ünlem.' },
    { id: 'speedometer', name: 'Hız göstergesi', art: 'assets/cabin/speedometer.svg', question: 'Aracın km/sa cinsinden hızını gösteren bölümü bul.', note: 'Gösterge panelindedir.' },
    { id: 'headlights', name: 'Far kumandası', art: 'assets/cabin/headlights.svg', question: 'Kısa farları açan kumandayı bul.', note: 'Düğme veya kol biçiminde olabilir.' },
    { id: 'handbrake', name: 'El freni', art: 'assets/cabin/handbrake.svg', question: 'Park hâlinde aracı sabitlemeye yarayan kumandayı bul.', note: 'Mekanik kol veya elektronik düğme olabilir.' },
  ];

  const driveMissions = [
    { id: 'departure', title: 'Güvenli kalkış', short: 'Kalkış', desc: "Kemerini tak, vitesi 1'e al ve kontrollü hareket et.", hint: 'İpucu: Emniyet kemeri takılmadan araç hareket etmez.' },
    { id: 'parallel', title: 'Paralel geri park', short: 'Paralel park', desc: 'Park alanına geri viteste gir; dubalara ve sınırlara temas etme.', hint: 'İpucu: R vitesini seç, aynaları kontrol et ve dubalara temas etme.' },
    { id: 'reverse25', title: '25 metre geri gitme', short: '25 m geri', desc: 'Başlangıç çizgisinde dur, R vitesini seç ve şerit içinde 25 m geri git.', hint: 'İpucu: Çok yavaş ilerle; iki sınır çizgisini de takip et.' },
    { id: 'lreverse', title: 'Geri giderken sağa L dönüş', short: 'L dönüşü', desc: 'L alanına geri manevrayla sağa dön ve tek hamlede yerleş.', hint: 'İpucu: Geri giderken aracın önü ters yöne açılır.' },
    { id: 'uturn', title: 'Dar alanda U dönüşü', short: 'U dönüşü', desc: 'Alan içinde ileri → geri → ileri sırasıyla dönüşü tamamla.', hint: 'İpucu: Alan dışına çıkma; en fazla üç hamle kullan.' },
    { id: 'hill', title: 'Yokuşta kalkış', short: 'Yokuş', desc: "Eğim başlamadan dur. Freni tut, 1. vitese al ve geri kaçmadan kalk.", hint: 'İpucu: Gaza basmadan önce vitesin 1 olduğundan emin ol.' },
    { id: 'finish', title: 'Güvenli bitiş', short: 'Bitiş', desc: 'Yol kurallarına uyarak ilerle ve bitiş alanında kontrollü dur.', hint: 'İpucu: Hızı düşür, aynaları kontrol et ve güvenli biçimde dur.' },
  ];

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  function setScore(value) {
    state.score = Math.max(0, Math.min(100, Math.round(value)));
    scoreEl.textContent = String(state.score);
  }
  function addScore(amount, message) {
    setScore(state.score + amount);
    if (message) showToast(message);
  }
  function deductScore(amount, message) {
    setScore(state.score - amount);
    if (message) showToast(`${message}  −${amount} puan`, 'warn');
  }
  let toastTimer = null;
  function showToast(text, type = '') {
    toastEl.textContent = text;
    toastEl.className = `toast visible ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2450);
  }
  let driveToastTimer = null;
  function showDriveToast(text, type = '') {
    driveToastEl.textContent = text;
    driveToastEl.className = `drive-toast visible ${type}`;
    clearTimeout(driveToastTimer);
    driveToastTimer = setTimeout(() => driveToastEl.classList.remove('visible'), 2500);
  }

  function resetGame() {
    state.score = 0;
    state.completedStages = new Set();
    state.quizStage = 'trunk';
    state.selected = new Set();
    state.targets = [];
    state.cabinIndex = 0;
    state.cabinTargets = [];
    state.penaltyEvents = new Set();
    state.driveStarted = false;
    setScore(0);
    modalRoot.innerHTML = '';
    driveScreen.hidden = true;
    stageContent.hidden = false;
    gameScreen.hidden = true;
    gameScreen.classList.remove('is-driving');
    startScreen.hidden = false;
    disposeDrive();
  }

  function startFullExam() {
    state.driveOnlyMode = false;
    startScreen.hidden = true;
    gameScreen.classList.remove('is-driving');
    gameScreen.hidden = false;
    beginObjectQuiz('trunk');
    updateHeader('trunk');
  }
  function startParkPractice() {
    state.driveOnlyMode = true;
    state.score = 0;
    state.completedStages = new Set();
    setScore(0);
    startScreen.hidden = true;
    gameScreen.hidden = false;
    startDrive();
  }
  $('#start-btn').addEventListener('click', startFullExam);
  $('#park-only-btn')?.addEventListener('click', startParkPractice);
  $('#restart-btn').addEventListener('click', () => {
    modal('Baştan başlatılsın mı?', 'Mevcut puanın ve ilerlemen sıfırlanır. Yeni oyunda araç bilgisi soruları yeniden karıştırılır.', [
      { label: 'Devam et', cls: 'secondary-small', action: closeModal },
      { label: 'Baştan başlat', cls: 'primary-small', action: () => { closeModal(); resetGame(); startScreen.hidden = true; gameScreen.hidden = false; beginObjectQuiz('trunk'); updateHeader('trunk'); } },
    ]);
  });

  function updateHeader(stage) {
    let label = 'AŞAMA 1 / 10';
    if (stage === 'hood') label = 'AŞAMA 2 / 10';
    if (stage === 'cabin') label = 'AŞAMA 3 / 10';
    if (stage === 'drive') label = 'AŞAMA 4 / 10';
    stageLabel.textContent = label;
    scoreEl.textContent = String(state.score);
  }
  function stepDots(current) {
    const stages = ['trunk', 'hood', 'cabin', 'drive'];
    return `<div class="stage-dots">${stages.map((s, i) => `<i class="${state.completedStages.has(s) ? 'done' : ''} ${s === current ? 'current' : ''}"></i>`).join('')}</div>`;
  }

  const mapArtwork = {
    trunk: `<svg class="map-art" viewBox="0 0 1000 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#41515b"/><stop offset="1" stop-color="#18262f"/></linearGradient><pattern id="trunkDots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#83949a" opacity=".15"/></pattern></defs><rect width="1000" height="540" fill="#1c2c35"/><path d="M0 0H1000V540H0Z" fill="url(#trunkDots)"/><path d="M75 60Q75 25 120 25H880Q925 25 925 60L958 458Q960 500 910 500H90Q40 500 42 458Z" fill="#0f1b23" stroke="#6e828b" stroke-width="9"/><path d="M103 76H897L922 440Q924 466 894 466H106Q76 466 78 440Z" fill="url(#trunkGrad)" stroke="#41545e" stroke-width="5"/><path d="M121 94H879L896 430H104Z" fill="#23343e" stroke="#344953" stroke-width="3"/><path d="M120 105L175 455M880 105L825 455" stroke="#617680" stroke-width="5" opacity=".38"/><path d="M140 122H860M130 420H870" stroke="#8fa3aa" stroke-width="3" opacity=".15"/><path d="M420 65Q500 35 580 65" fill="none" stroke="#91a5ad" stroke-width="7" opacity=".3"/></svg>`,
    hood: `<svg class="map-art" viewBox="0 0 1000 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hoodGrad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#52626a"/><stop offset="1" stop-color="#1a2932"/></linearGradient><pattern id="hoodGrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#9aabb0" stroke-width=".8" opacity=".08"/></pattern></defs><rect width="1000" height="540" fill="#1a2932"/><rect width="1000" height="540" fill="url(#hoodGrid)"/><path d="M240 35Q190 55 165 105L110 440Q106 480 155 493H845Q894 480 890 440L835 105Q810 55 760 35Z" fill="url(#hoodGrad)" stroke="#788c94" stroke-width="9"/><path d="M270 74H730Q766 76 782 120L815 418Q818 448 788 452H212Q182 448 185 418L218 120Q234 76 270 74Z" fill="#17262f" stroke="#475a63" stroke-width="5"/><path d="M270 90H730L754 145H246Z" fill="#334651"/><path d="M245 168L300 146M755 168L700 146" stroke="#8ca2a9" stroke-width="6" opacity=".3"/><circle cx="500" cy="280" r="146" fill="#253740" stroke="#526772" stroke-width="5" opacity=".7"/><path d="M390 230Q500 160 610 230L645 343Q500 400 355 343Z" fill="#202f38" stroke="#536872" stroke-width="5" opacity=".75"/><path d="M315 405H685" stroke="#92a8ae" stroke-width="4" opacity=".25"/></svg>`,
    cabin: `<svg class="map-art" viewBox="0 0 1000 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#52636b"/><stop offset="1" stop-color="#15242d"/></linearGradient></defs><rect width="1000" height="540" fill="#192933"/><path d="M40 350Q65 192 180 112Q280 42 500 40Q720 42 820 112Q935 192 960 350L920 450Q500 520 80 450Z" fill="url(#dashGrad)" stroke="#687e87" stroke-width="8"/><path d="M105 346Q135 218 220 163Q320 108 500 106Q680 108 780 163Q865 218 895 346L850 405Q500 455 150 405Z" fill="#182831" stroke="#374f5a" stroke-width="5"/><path d="M160 205Q500 132 840 205" stroke="#91a6ac" stroke-width="5" opacity=".2"/><path d="M170 360Q500 406 830 360" stroke="#779099" stroke-width="3" opacity=".28"/><circle cx="250" cy="310" r="92" fill="#101b22" stroke="#73878f" stroke-width="14"/><circle cx="250" cy="310" r="65" fill="#263c47" stroke="#425965" stroke-width="7"/><circle cx="250" cy="310" r="19" fill="#91a5ad"/><path d="M250 294L250 252M236 319L206 357M264 319L294 357" stroke="#8298a0" stroke-width="13" stroke-linecap="round"/><rect x="370" y="190" width="260" height="125" rx="18" fill="#0f1c24" stroke="#536974" stroke-width="6"/><rect x="394" y="210" width="212" height="85" rx="9" fill="#29414b"/><path d="M418 268L457 244L487 258L525 225L577 250" fill="none" stroke="#8bd9e2" stroke-width="4" opacity=".75"/><rect x="670" y="216" width="180" height="100" rx="12" fill="#101b22" stroke="#667d85" stroke-width="5"/><circle cx="714" cy="266" r="25" fill="#263943" stroke="#8ba0a7" stroke-width="4"/><circle cx="792" cy="266" r="25" fill="#263943" stroke="#8ba0a7" stroke-width="4"/><rect x="420" y="347" width="160" height="65" rx="14" fill="#101d25" stroke="#58707a" stroke-width="5"/><path d="M453 365H547M453 382H547M453 399H510" stroke="#81969c" stroke-width="4" opacity=".6"/><circle cx="500" cy="390" r="19" fill="#273d46" stroke="#a2b3b7" stroke-width="4"/><path d="M490 390H510M500 380V400" stroke="#a2b3b7" stroke-width="3"/></svg>`,
  };

  function beginObjectQuiz(type) {
    state.quizStage = type;
    state.selected = new Set();
    state.targets = [];
    updateHeader(type);
    stageContent.hidden = false;
    driveScreen.hidden = true;
    if (type === 'trunk') {
      state.targets = shuffle(trunkItems).slice(0, 3).map(x => x.id);
      renderObjectSelection({
        type, label: 'BAGAJ KONTROLÜ', title: 'Bagajdaki ekipmanları tanı',
        desc: 'Bagajda bulunan temel güvenlik ve lastik değiştirme ekipmanlarını seçerek sınava hazırlan.',
        prompt: 'İstenen 3 malzemeyi bul ve seç.',
        targets: trunkItems.filter(x => state.targets.includes(x.id)), items: trunkItems,
        note: 'Araç donanımı modele göre değişebilir. Bu provada sınavda öğretilen temel ekipmanlar çalıştırılır.',
      });
    } else if (type === 'hood') {
      state.targets = shuffle(hoodItems).slice(0, 3).map(x => x.id);
      renderObjectSelection({
        type, label: 'KAPUT KONTROLÜ', title: 'Motor bölümünü tanı',
        desc: 'Kaput açıkken temel parçaları bul. Sıcak motorda soğutma sistemi kapağını açma.',
        prompt: 'İstenen 3 parçaya dokun.',
        targets: hoodItems.filter(x => state.targets.includes(x.id)), items: hoodItems,
        note: 'Parça konumları temsili çizimdir. Gerçek araçta depo ve kapakların yerini öğren.',
      });
    } else if (type === 'cabin') {
      state.cabinTargets = shuffle(cabinItems).slice(0, 3);
      state.cabinIndex = 0;
      renderCabinQuiz();
    }
  }

  function targetListHtml(targets) {
    return `<div class="target-list">${targets.map(t => `<span class="target-chip">${escapeHtml(t.name)}</span>`).join('')}</div>`;
  }
  function renderObjectSelection(cfg) {
    const count = state.selected.size;
    const mapClass = cfg.type === 'hood' ? 'hood-map' : 'trunk-map';
    stageContent.innerHTML = `
      <div class="lesson-heading"><div><div class="step-kicker">${cfg.label}</div><h2>${cfg.title}</h2><p>${cfg.desc}</p></div><div class="lesson-status">${count} / 3 SEÇİLDİ</div></div>
      <div class="instruction-strip"><div class="instruction-icon">⌖</div><div class="instruction-copy"><b>${cfg.prompt}</b><p>Ekrandaki çizimlerden istenen üç öğeyi seç.</p><div class="target-list-label">ARADIĞIN ÖĞELER</div>${targetListHtml(cfg.targets)}</div></div>
      <div class="part-map ${mapClass}">${mapArtwork[cfg.type]}<div class="map-overlay">${cfg.items.map((item, i) => `<button class="hotspot ${state.selected.has(item.id) ? 'selected' : ''}" data-item="${item.id}" aria-label="${escapeHtml(item.name)}" title="Nesne ${i + 1}" aria-pressed="${state.selected.has(item.id)}"><img class="hotspot-art" src="${item.art}" alt="" draggable="false"><span class="mini-number">${String(i + 1).padStart(2, '0')}</span></button>`).join('')}</div></div>
      <div id="quiz-feedback" class="quiz-feedback" hidden></div>
      <div class="map-footer"><span class="helper-text">${cfg.note}</span><button id="check-selection" class="primary-small">Seçimleri kontrol et <span class="arr">→</span></button></div>
      <div class="foot-meta"><span>ÖĞRENME MODU · RESİMDEN TANIMA</span>${stepDots(cfg.type)}</div>`;

    let passed = false;
    $$('.hotspot', stageContent).forEach(button => {
      button.addEventListener('click', () => {
        if (passed) return;
        const id = button.dataset.item;
        if (state.selected.has(id)) state.selected.delete(id); else state.selected.add(id);
        button.classList.remove('incorrect', 'correct');
        button.classList.toggle('selected', state.selected.has(id));
        button.setAttribute('aria-pressed', String(state.selected.has(id)));
        $('.lesson-status', stageContent).textContent = `${state.selected.size} / 3 SEÇİLDİ`;
        const feedback = $('#quiz-feedback');
        if (!feedback.hidden) feedback.hidden = true;
      });
    });
    $('#check-selection', stageContent).addEventListener('click', () => {
      if (passed) {
        if (cfg.type === 'trunk') beginObjectQuiz('hood');
        else beginObjectQuiz('cabin');
        return;
      }
      passed = checkObjectSelection(cfg);
    });
  }

  function checkObjectSelection(cfg) {
    const targetSet = new Set(state.targets);
    const correct = [...state.selected].filter(id => targetSet.has(id));
    const extra = [...state.selected].filter(id => !targetSet.has(id));
    const missing = state.targets.filter(id => !state.selected.has(id));
    const feedback = $('#quiz-feedback', stageContent);
    if (extra.length === 0 && missing.length === 0) {
      state.completedStages.add(cfg.type);
      addScore(10, 'Harika! +10 puan');
      feedback.hidden = false;
      feedback.className = 'quiz-feedback good';
      feedback.innerHTML = `Doğru seçim! Bu aşamayı tamamladın. <b>+10 puan</b> kazandın.`;
      $$('.hotspot', stageContent).forEach(b => { b.disabled = true; if (targetSet.has(b.dataset.item)) b.classList.add('correct'); });
      const btn = $('#check-selection', stageContent);
      btn.textContent = 'Sonraki aşama →';
      $('.lesson-status', stageContent).textContent = 'TAMAMLANDI ✓';
      return true;
    } else {
      const penalty = Math.min(6, Math.max(2, extra.length * 2 + missing.length));
      deductScore(penalty, 'Seçimleri tekrar kontrol et.');
      feedback.hidden = false;
      feedback.className = 'quiz-feedback';
      const missingNames = cfg.items.filter(x => missing.includes(x.id)).map(x => x.name);
      const extraNames = cfg.items.filter(x => extra.includes(x.id)).map(x => x.name);
      feedback.innerHTML = `<b>Henüz doğru değil.</b> ${missingNames.length ? `Eksik: ${missingNames.map(escapeHtml).join(', ')}. ` : ''}${extraNames.length ? `Fazladan seçilen: ${extraNames.map(escapeHtml).join(', ')}. ` : ''}Seçimini düzeltip yeniden kontrol et. <b>−${penalty} puan</b>.`;
      $$('.hotspot', stageContent).forEach(b => {
        b.classList.remove('correct', 'incorrect');
        if (targetSet.has(b.dataset.item) && state.selected.has(b.dataset.item)) b.classList.add('correct');
        if (!targetSet.has(b.dataset.item) && state.selected.has(b.dataset.item)) b.classList.add('incorrect');
      });
      return false;
    }
  }

  function renderCabinQuiz() {
    const target = state.cabinTargets[state.cabinIndex];
    const currentNum = state.cabinIndex + 1;
    stageContent.innerHTML = `
      <div class="lesson-heading"><div><div class="step-kicker">KOKPİT VE GÖSTERGELER</div><h2>Kumandayı ve uyarıları tanı</h2><p>Sana sorulan işlevi, aşağıdaki çizimli semboller arasından bul.</p></div><div class="lesson-status">SORU ${currentNum} / 3</div></div>
      <div class="instruction-strip"><div class="instruction-icon">?</div><div class="instruction-copy"><b>${escapeHtml(target.question)}</b><p>Resimlerden doğru kumandayı veya uyarı sembolünü seç.</p></div></div>
      <div class="part-map cabin-map">${mapArtwork.cabin}<div class="map-overlay">${cabinItems.map((item, i) => `<button class="hotspot cabin-hotspot" data-cabin-item="${item.id}" aria-label="${escapeHtml(item.name)}" title="Sembol ${i + 1}"><img class="hotspot-art" src="${item.art}" alt="" draggable="false"><span class="mini-number">${String(i + 1).padStart(2, '0')}</span></button>`).join('')}</div></div>
      <div id="cabin-feedback" class="quiz-feedback" hidden></div>
      <div class="map-footer"><span class="helper-text">Kumanda ve gösterge yerleşimi araç modeline göre değişebilir.</span><span class="lesson-status">${currentNum === 3 ? 'SON SORU' : 'DEVAM ET'}</span></div>
      <div class="foot-meta"><span>RESİMDEN BUL · KISA GERİ BİLDİRİM</span>${stepDots('cabin')}</div>`;
    $$('.hotspot', stageContent).forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.cabinItem === target.id) {
          button.classList.add('correct');
          const feedback = $('#cabin-feedback');
          feedback.hidden = false; feedback.className = 'quiz-feedback good';
          feedback.innerHTML = `<b>Doğru!</b> ${escapeHtml(target.note)}`;
          $$('.hotspot', stageContent).forEach(b => b.disabled = true);
          addScore(1, 'Doğru cevap');
          setTimeout(() => {
            state.cabinIndex++;
            if (state.cabinIndex >= 3) {
              state.completedStages.add('cabin');
              addScore(7, 'Kokpit tamamlandı! +7 puan');
              modal('Araç bilgisi tamamlandı!', 'Bagaj, kaput ve kokpit aşamalarını bitirdin. Şimdi emniyet kemeri, vites ve pedallarla parkura geçiyorsun.', [
                { label: 'Parkura geç', cls: 'primary-small', action: () => { closeModal(); startDrive(); } },
              ]);
            } else {
              renderCabinQuiz();
            }
          }, 650);
        } else {
          button.classList.add('incorrect');
          deductScore(2, 'Bu değil, tekrar dene.');
          const feedback = $('#cabin-feedback');
          feedback.hidden = false; feedback.className = 'quiz-feedback';
          feedback.innerHTML = `Yanlış seçim. <b>−2 puan.</b> Doğru sembolü bulup tekrar dene.`;
          setTimeout(() => button.classList.remove('incorrect'), 450);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function modal(title, description, actions) {
    modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal-card"><div class="modal-symbol">✦</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><div class="modal-actions">${actions.map((a, i) => `<button class="${a.cls || 'primary-small'}" data-modal-action="${i}">${escapeHtml(a.label)}</button>`).join('')}</div></div></div>`;
    actions.forEach((action, i) => $(`[data-modal-action="${i}"]`, modalRoot).addEventListener('click', action.action));
  }
  function closeModal() { modalRoot.innerHTML = ''; }

  // -------------------- Three.js driving practice --------------------
  let renderer = null, scene = null, camera = null, car = null, carParts = null;
  let animationId = null, lastFrame = 0, elapsed = 0, hudClock = 0;
  let speed = 0, gear = 'N', steering = 0, throttleDown = false, brakeDown = false;
  let hazards = false, headlights = false, seatbelt = false;
  let reverseDistance = 0, reverseReady = false, reverseStartZ = null, reverseLastZ = null;
  let lUsedReverse = false, uturnPhase = 0, uturnGearChanges = 0, lastUturnGear = '1', hillStopped = false, hillStartZ = null, hillPenalty = false;
  let previousZ = 18, previousX = 0, lastGear = 'N';
  let sceneObjects = [], coneObjects = [], markerMeshes = [], wheelMeshes = [], frontWheelPivots = [];
  let missionMarkers = { parallel: [], reverse25: [], lreverse: [], uturn: [], hill: [] };
  let completedPopTimer = null, overspeedActive = false, lastCollisionAt = -10;
  let isSceneReady = false;
  const roadWidth = 8;
  const missionState = { index: 0, flags: {}, started: false, parallelApproach: false, parallelSeenReverse: false, parallelExitCheck: false, lApproach: false, lSeenReverse: false, uturnEntered: false, finishWarned: false };
  const vehicleConfig = { accel: 4.8, brake: 10.5, maxSpeed: 17.6, steerRate: 0.67 };

  function startDrive() {
    gameScreen.classList.add('is-driving');
    updateHeader('drive');
    stageContent.hidden = true;
    driveScreen.hidden = false;
    if (!state.driveStarted) state.driveBaseScore = state.score;
    state.driveStarted = true;
    speed = 0; gear = 'N'; steering = 0; throttleDown = false; brakeDown = false;
    hazards = false; headlights = false; seatbelt = false;
    reverseDistance = 0; reverseReady = false; reverseStartZ = null; reverseLastZ = null;
    lUsedReverse = false; uturnPhase = 0; uturnGearChanges = 0; lastUturnGear = '1'; hillStopped = false; hillStartZ = null; hillPenalty = false;
    previousZ = 18; previousX = 0; lastGear = 'N';
    overspeedActive = false; lastCollisionAt = -10;
    Object.assign(missionState, { index: 0, flags: {}, started: false, parallelApproach: false, parallelSeenReverse: false, parallelExitCheck: false, lApproach: false, lSeenReverse: false, uturnEntered: false, finishWarned: false });
    renderTaskStrip();
    configureDriveControls();
    $('#control-layout-btn').textContent = driveScreen.classList.contains('right-handed') ? 'DİREKSİYON SAĞDA' : 'DİREKSİYON SOLDA';
    if (!isSceneReady) initThree(); else resetThreeWorld();
    updateMissionHud();
  }

  function renderTaskStrip() {
    const el = $('#task-strip');
    el.innerHTML = driveMissions.map((m, i) => `<div class="task-chip ${i === missionState.index ? 'current' : ''}" data-task="${m.id}"><span>${state.completedStages.has(m.id) ? '✓' : String(i + 1).padStart(2, '0')}</span>${escapeHtml(m.short)}</div>`).join('');
  }
  function updateMissionHud() {
    const mission = driveMissions[missionState.index];
    if (!mission) return;
    $('#mission-index').textContent = `GÖREV ${missionState.index + 1} / ${driveMissions.length}`;
    $('#mission-title').textContent = mission.title;
    $('#mission-desc').textContent = mission.desc;
    $('#mission-hint').textContent = mission.hint;
    $('#mission-progress').style.width = `${(missionState.index / driveMissions.length) * 100}%`;
    $('#distance-pill').hidden = mission.id !== 'reverse25';
    if (mission.id === 'reverse25') $('#distance-pill').innerHTML = `GERİ: <b>${reverseDistance.toFixed(1)} / 25 m</b>`;
    $$('.task-chip', $('#task-strip')).forEach((chip, i) => {
      chip.classList.toggle('current', i === missionState.index);
      chip.classList.toggle('done', state.completedStages.has(driveMissions[i].id));
      const badge = $('span', chip);
      badge.textContent = state.completedStages.has(driveMissions[i].id) ? '✓' : String(i + 1).padStart(2, '0');
    });
  }

  function highlightMission(id) {
    const markers = missionMarkers[id] || [];
    markers.forEach(marker => {
      if (marker && marker.material && marker.material.color) {
        marker.material.color.set(0x71ee9c);
        marker.material.needsUpdate = true;
        if (marker.material.emissive) marker.material.emissive.set(0x123c25);
      }
    });
  }

  function completeMission(id, message) {
    const mission = driveMissions[missionState.index];
    if (!mission || mission.id !== id || state.completedStages.has(id)) return;
    state.completedStages.add(id);
    highlightMission(id);
    const points = state.driveOnlyMode ? (missionState.index === driveMissions.length - 1 ? 16 : 14) : 10;
    addScore(points, message || `${mission.title} tamamlandı! +${points} puan`);
    const pop = $('#completed-pop');
    pop.hidden = false;
    clearTimeout(completedPopTimer);
    completedPopTimer = setTimeout(() => { pop.hidden = true; }, 1250);
    missionState.index++;
    if (missionState.index >= driveMissions.length) {
      $('#mission-progress').style.width = '100%';
      setTimeout(finishGame, 1100);
    } else {
      updateMissionHud();
    }
    renderTaskStrip();
  }

  function penaltyOnce(key, amount, message) {
    if (missionState.flags[key]) return;
    missionState.flags[key] = true;
    deductScore(amount, message);
  }

  function configureDriveControls() {
    $('#belt-btn').onclick = toggleBelt;
    $('#belt-warning-btn').onclick = toggleBelt;
    $('#hazard-btn').onclick = () => { hazards = !hazards; updateControlUi(); showDriveToast(hazards ? 'Dörtlü ikaz açık' : 'Dörtlü ikaz kapalı'); };
    $('#headlamp-btn').onclick = () => { headlights = !headlights; updateControlUi(); showDriveToast(headlights ? 'Kısa farlar açık' : 'Farlar kapalı'); };
    $$('.gear-selector button').forEach(btn => btn.onclick = () => selectGear(btn.dataset.gear));
    bindSteeringWheel($('#steer-wheel'));
    $('#control-layout-btn').onclick = () => {
      driveScreen.classList.toggle('right-handed');
      const right = driveScreen.classList.contains('right-handed');
      $('#control-layout-btn').textContent = right ? 'DİREKSİYON SAĞDA' : 'DİREKSİYON SOLDA';
      showDriveToast(right ? 'Direksiyon sağda, pedallar solda' : 'Direksiyon solda, pedallar sağda');
    };
    $('#fullscreen-btn').onclick = async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch (_) { showDriveToast('Tam ekran bu tarayıcıda kullanılamıyor.'); }
    };
    $('#drive-restart-btn').onclick = () => modal('Parkur yeniden başlasın mı?', 'Sürüş puanın ve görev ilerlemen sıfırlanır.', [
      { label: 'Devam et', cls: 'secondary-small', action: closeModal },
      { label: 'Yeniden başlat', cls: 'primary-small', action: () => { closeModal(); const only = state.driveOnlyMode; state.score = only ? 0 : state.driveBaseScore; setScore(state.score); state.completedStages = only ? new Set() : new Set(['trunk','hood','cabin']); state.driveStarted = false; startDrive(); } },
    ]);
    bindHold($('#gas-btn'), () => throttleDown = true, () => throttleDown = false);
    bindHold($('#brake-btn'), () => brakeDown = true, () => brakeDown = false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    updateControlUi();
  }

  function bindSteeringWheel(el) {
    if (!el) return;
    let startAngle = 0;
    let startValue = 0;
    let pointerId = null;
    const angleAt = e => {
      const r = el.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    };
    const normalize = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
    el.onpointerdown = e => {
      e.preventDefault();
      pointerId = e.pointerId;
      startAngle = angleAt(e);
      startValue = steering;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add('dragging');
    };
    el.onpointermove = e => {
      if (pointerId !== e.pointerId) return;
      e.preventDefault();
      const delta = normalize(angleAt(e) - startAngle);
      steering = Math.max(-1, Math.min(1, startValue + delta / 0.92));
      el.style.transform = `rotate(${steering * 155}deg)`;
    };
    const release = e => {
      if (pointerId === null || (e && e.pointerId !== pointerId)) return;
      if (e) e.preventDefault();
      pointerId = null;
      el.classList.remove('dragging');
      steering = 0;
      el.style.transform = 'rotate(0deg)';
    };
    el.onpointerup = release;
    el.onpointercancel = release;
    el.onlostpointercapture = release;
    el.oncontextmenu = e => e.preventDefault();
  }

  function bindHold(el, down, up) {
    el.onpointerdown = e => { e.preventDefault(); el.setPointerCapture?.(e.pointerId); el.classList.add('pressed'); down(); };
    const release = e => { if (e) e.preventDefault(); el.classList.remove('pressed'); up(); };
    el.onpointerup = release; el.onpointercancel = release; el.onlostpointercapture = release;
    el.oncontextmenu = e => e.preventDefault();
  }
  const heldKeys = new Set();
  function onKeyDown(e) {
    if (driveScreen.hidden) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    const k = e.key.toLowerCase(); heldKeys.add(k);
    if (k === 'b') toggleBelt();
    if (k === 'h') { hazards = !hazards; updateControlUi(); }
    if (k === 'f') { headlights = !headlights; updateControlUi(); }
    if (['1','n','r'].includes(k)) selectGear(k.toUpperCase());
    if (k === 'arrowleft' || k === 'a') steering = -1;
    if (k === 'arrowright' || k === 'd') steering = 1;
    if (k === 'arrowup' || k === 'w') throttleDown = true;
    if (k === 'arrowdown' || k === 's' || k === ' ') brakeDown = true;
  }
  function onKeyUp(e) {
    const k = e.key.toLowerCase(); heldKeys.delete(k);
    if (k === 'arrowleft' || k === 'a') { if (!(heldKeys.has('arrowright') || heldKeys.has('d'))) steering = 0; }
    if (k === 'arrowright' || k === 'd') { if (!(heldKeys.has('arrowleft') || heldKeys.has('a'))) steering = 0; }
    if (k === 'arrowup' || k === 'w') throttleDown = false;
    if (k === 'arrowdown' || k === 's' || k === ' ') brakeDown = false;
  }
  function toggleBelt() {
    seatbelt = !seatbelt;
    updateControlUi();
    $('#belt-warning').hidden = seatbelt;
    showDriveToast(seatbelt ? 'Emniyet kemeri takıldı ✓' : 'Kemerini takmadan hareket etme', seatbelt ? '' : 'warn');
  }
  function selectGear(nextGear) {
    if (nextGear === gear) return;
    if (Math.abs(speed) > 0.65) {
      if (!missionState.flags.gearWhileMoving) {
        missionState.flags.gearWhileMoving = true;
        deductScore(3, 'Vites değiştirmeden önce aracı durdur.');
      } else showDriveToast('Vites için araç tamamen durmalı.', 'warn');
      return;
    }
    gear = nextGear;
    missionState.flags.gearWhileMoving = false;
    if (missionState.index === 3 && gear === 'R') lUsedReverse = true;
    if (missionState.index === 4 && gear !== 'N' && gear !== lastUturnGear && (uturnPhase > 0 || missionState.uturnEntered)) {
      uturnGearChanges++;
      lastUturnGear = gear;
    }
    if (missionState.index === 5 && gear === '1') $('#gear-help').textContent = 'Yokuş kalkışı için hazır';
    updateControlUi();
    showDriveToast(`Vites: ${gear}`);
  }
  function updateControlUi() {
    $('#belt-btn').classList.toggle('active', seatbelt);
    $('.belt-btn small').textContent = seatbelt ? 'Takılı ✓' : 'Takılı değil';
    $('#belt-btn .tool-icon').textContent = seatbelt ? '✓' : '♧';
    $('#hazard-btn').classList.toggle('active', hazards);
    $('#headlamp-btn').classList.toggle('active', headlights);
    $$('.gear-selector button').forEach(btn => btn.classList.toggle('selected', btn.dataset.gear === gear));
    $('#gear-readout').textContent = gear;
  }

  function initThree() {
    if (!window.THREE) {
      showDriveToast('3B motor yüklenemedi. GitHub Pages bağlantısını kontrol et.', 'warn');
      return;
    }
    const canvas = $('#game-canvas');
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (error) {
      showDriveToast('Bu tarayıcı WebGL 3B çizimini desteklemiyor. Güncel bir tarayıcıyla tekrar dene.', 'warn');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 450, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa8c6cf);
    scene.fog = new THREE.Fog(0xa8c6cf, 44, 155);
    camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
    const hemi = new THREE.HemisphereLight(0xdff4ff, 0x3b4938, 2.0); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d6, 2.25); sun.position.set(-20, 35, 20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -40; sun.shadow.camera.right = 40; sun.shadow.camera.top = 50; sun.shadow.camera.bottom = -50; sun.shadow.bias = -0.0004; scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9ad9e7, .6); fill.position.set(16, 10, -35); scene.add(fill);
    buildEnvironment();
    carParts = buildCar(); scene.add(carParts.group); car = carParts.group;
    resetThreeWorld();
    isSceneReady = true;
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);
    if (animationId) cancelAnimationFrame(animationId);
    lastFrame = performance.now(); elapsed = 0;
    const frame = now => {
      if (driveScreen.hidden || !renderer || !scene) { animationId = null; return; }
      const dt = Math.min(.04, Math.max(.001, (now - lastFrame) / 1000));
      lastFrame = now; elapsed += dt; hudClock += dt;
      updateDriving(dt);
      updateCarVisuals(dt);
      updateCamera(dt);
      if (hudClock > .12) { refreshDriveHud(); hudClock = 0; }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(frame);
    };
    animationId = requestAnimationFrame(frame);
  }

  function resetThreeWorld() {
    if (!car || !scene) return;
    car.position.set(0, roadHeight(18), 18);
    car.rotation.y = 0;
    speed = 0; gear = 'N'; steering = 0; seatbelt = false;
    if (carParts) carParts.wheels.forEach(w => { w.rotation.x = 0; });
    updateControlUi();
    previousZ = 18; previousX = 0;
    updateCamera(.1);
  }

  function boxMesh(w, h, d, color, x, y, z, options = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: options.roughness ?? .8, metalness: options.metalness ?? 0, transparent: options.transparent || false, opacity: options.opacity ?? 1 }));
    mesh.position.set(x, y, z); mesh.castShadow = options.castShadow !== false; mesh.receiveShadow = true;
    scene.add(mesh); sceneObjects.push(mesh); return mesh;
  }
  function addRoadSection(x, z, width, length, level, tilt = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, .12, length), new THREE.MeshStandardMaterial({ color: 0x343d42, roughness: .95 }));
    mesh.position.set(x, level, z); mesh.rotation.x = tilt; mesh.receiveShadow = true; mesh.castShadow = false; scene.add(mesh); sceneObjects.push(mesh);
  }
  function roadHeight(z) {
    if (z <= -54) return -1;
    if (z < -44) return (z + 54) * .1 - 1;
    return 0;
  }
  function addPaint(x, z, width, length, color = 0xe6eee9, y = null, tilt = 0, opacity = 1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, .025, length), new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity }));
    mesh.position.set(x, y === null ? roadHeight(z) + .09 : y, z); mesh.rotation.x = tilt; scene.add(mesh); sceneObjects.push(mesh); markerMeshes.push(mesh); return mesh;
  }
  function addLine(x1, z1, x2, z2, color, width = .1, yOffset = .095) {
    const points = [new THREE.Vector3(x1, roadHeight(z1) + yOffset, z1), new THREE.Vector3(x2, roadHeight(z2) + yOffset, z2)];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, linewidth: width })); scene.add(line); sceneObjects.push(line); return line;
  }
  function addTree(x, z, scale = 1) {
    const base = roadHeight(z) - .32;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.13 * scale, .2 * scale, 1.2 * scale, 7), new THREE.MeshStandardMaterial({ color: 0x675341, roughness: 1 }));
    trunk.position.set(x, base + .55 * scale, z); trunk.castShadow = true; scene.add(trunk); sceneObjects.push(trunk);
    const crownMat = new THREE.MeshStandardMaterial({ color: [0x3b654d,0x477653,0x5b805a][Math.floor(Math.random()*3)], roughness: 1 });
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.9 * scale, 1), crownMat); crown.position.set(x, base + 1.65 * scale, z); crown.castShadow = true; scene.add(crown); sceneObjects.push(crown);
    const crown2 = new THREE.Mesh(new THREE.IcosahedronGeometry(.67 * scale, 1), crownMat); crown2.position.set(x + .35*scale, base + 2.15*scale, z - .08*scale); crown2.castShadow = true; scene.add(crown2); sceneObjects.push(crown2);
  }
  function addCone(x, z, id) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.31,.34,.1,14), new THREE.MeshStandardMaterial({ color: 0xd7dfe0, roughness:.85 })); base.position.y=.05; group.add(base);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(.06,.27,.65,14), new THREE.MeshStandardMaterial({ color: 0xf27a42, roughness:.7 })); cone.position.y=.41; cone.castShadow=true; group.add(cone);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(.115,.175,.11,14), new THREE.MeshStandardMaterial({ color: 0xf7f4e9, roughness:.7 })); stripe.position.y=.39; group.add(stripe);
    group.position.set(x, roadHeight(z), z); scene.add(group); sceneObjects.push(group); coneObjects.push({ id, group, x, z });
  }
  function makeSignTexture(text, bg = '#f7f6ef', fg = '#de554d') {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(128,128,111,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = fg; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(128,128,111,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#17242a'; ctx.font = 'bold 88px Manrope, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,128,132);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
  }
  function addSpeedSign(x,z) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,2.0,8), new THREE.MeshStandardMaterial({ color:0x87969a, metalness:.25, roughness:.55 })); post.position.set(x,1,z); scene.add(post); sceneObjects.push(post);
    const face = new THREE.Mesh(new THREE.CircleGeometry(.58,32), new THREE.MeshStandardMaterial({ map:makeSignTexture('50'), roughness:.5 })); face.position.set(x,2.15,z); scene.add(face); sceneObjects.push(face);
  }
  function addBoardSign(label, x, z, rotation = 0) {
    const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=180; const ctx=canvas.getContext('2d');
    ctx.fillStyle='#12232b'; ctx.fillRect(0,0,512,180); ctx.strokeStyle='#b7f36b'; ctx.lineWidth=10; ctx.strokeRect(5,5,502,170);
    ctx.fillStyle='#f2f7f8'; ctx.font='800 58px Manrope, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,256,92);
    const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
    const baseY=roadHeight(z);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.65,8),new THREE.MeshStandardMaterial({color:0x8b9a9c}));pole.position.set(x,baseY+.82,z);scene.add(pole);sceneObjects.push(pole);
    const board=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.76),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));board.position.set(x,baseY+1.75,z);board.rotation.y=rotation;scene.add(board);sceneObjects.push(board);
  }

  function buildEnvironment() {
    sceneObjects = []; coneObjects = []; markerMeshes = [];
    missionMarkers = { parallel: [], reverse25: [], lreverse: [], uturn: [], hill: [] };
    // Terrain follows the road grade so the course looks like a small driving-school route, not a floating road.
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x65836b, roughness: 1 });
    const lowGrass = new THREE.Mesh(new THREE.PlaneGeometry(260,76), grassMat); lowGrass.rotation.x=-Math.PI/2; lowGrass.position.set(0,-1.32,-92); lowGrass.receiveShadow=true; scene.add(lowGrass); sceneObjects.push(lowGrass);
    const highGrass = new THREE.Mesh(new THREE.PlaneGeometry(260,79), grassMat); highGrass.rotation.x=-Math.PI/2; highGrass.position.set(0,-.32,-4.5); highGrass.receiveShadow=true; scene.add(highGrass); sceneObjects.push(highGrass);
    const grassRamp = new THREE.Mesh(new THREE.BoxGeometry(260,.08,10),grassMat); grassRamp.position.set(0,-.82,-49); grassRamp.rotation.x=-Math.atan(.1); grassRamp.receiveShadow=true; scene.add(grassRamp); sceneObjects.push(grassRamp);
    // Low road, grade transition, and raised stretch. The car returns uphill after the U-turn.
    addRoadSection(0,-92,8,76,-1.0);
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(8,.12,10),new THREE.MeshStandardMaterial({color:0x343d42,roughness:.95}));ramp.position.set(0,-.5,-49);ramp.rotation.x=-Math.atan(.1);ramp.receiveShadow=true;scene.add(ramp);sceneObjects.push(ramp);
    addRoadSection(0,-4.5,8,79,0.0);
    // Edge markings
    for (const x of [-3.65,3.65]) {
      addPaint(x,-92,.11,75,0xe6ece7,-.91,0,.95);
      const edgeHigh = new THREE.Mesh(new THREE.BoxGeometry(.11,.025,78),new THREE.MeshBasicMaterial({color:0xe6ece7})); edgeHigh.position.set(x,.09,-5);scene.add(edgeHigh);sceneObjects.push(edgeHigh);markerMeshes.push(edgeHigh);
      const rampEdge = new THREE.Mesh(new THREE.BoxGeometry(.11,.025,10),new THREE.MeshBasicMaterial({color:0xe6ece7}));rampEdge.position.set(x,-.41,-49);rampEdge.rotation.x=-Math.atan(.1);scene.add(rampEdge);sceneObjects.push(rampEdge);markerMeshes.push(rampEdge);
    }
    // Dashed centre line split across slope / flat sections
    for (let z=-128; z<=-55; z+=4.4) addPaint(0,z,.13,2.1,0xe4e9e4,-.91);
    for (let z=-43; z<=34; z+=4.4) addPaint(0,z,.13,2.1,0xe4e9e4,.09);
    for (let z=-53; z<=-45; z+=3) addPaint(0,z,.13,1.6,0xe4e9e4,roadHeight(z)+.11,-Math.atan(.1));
    // Grass/verge strips and road side poles
    for (let z=-120;z<=24;z+=18) {
      addTree(-9.2,z, .75 + Math.random()*.25); addTree(9.1,z-6,.72+Math.random()*.3);
      if (z%36===0) {
        const pole= new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,3.4,8),new THREE.MeshStandardMaterial({color:0x64757a,metalness:.2,roughness:.65})); pole.position.set(5.5,roadHeight(z)+1.7,z);scene.add(pole);sceneObjects.push(pole);
        const lamp=new THREE.Mesh(new THREE.BoxGeometry(.7,.12,.18),new THREE.MeshStandardMaterial({color:0x9aabad,emissive:0x334850}));lamp.position.set(5.8,roadHeight(z)+3.35,z);scene.add(lamp);sceneObjects.push(lamp);
      }
    }
    addSpeedSign(-5.7,3);
    // Parallel parking station to the right side
    missionMarkers.parallel.push(addLine(3.7,-14.2,6.7,-14.2,0xf3f4ec,.12), addLine(3.7,-23.8,6.7,-23.8,0xf3f4ec,.12));
    missionMarkers.parallel.push(addLine(3.7,-14.2,3.7,-23.8,0xf3f4ec,.12), addLine(6.7,-14.2,6.7,-23.8,0xf3f4ec,.12));
    missionMarkers.parallel.push(addLine(3.8,-15,6.6,-15,0xe9d27b,.08), addLine(3.8,-23,6.6,-23,0xe9d27b,.08));
    addCone(3.65,-14.2,'p1'); addCone(6.75,-14.2,'p2'); addCone(3.65,-23.8,'p3'); addCone(6.75,-23.8,'p4');
    addBoardSign('PARALEL PARK',-5.65,-18,0);
    // 25 m reverse corridor
    for (const x of [-1.75,1.75]) { missionMarkers.reverse25.push(addLine(x,-17.5,x,-44.5,0xffd77d,.10)); }
    addBoardSign('25 m GERİ',-5.7,-40,0);
    // Reverse L bay: connected to main lane at the corner, sized with generous allowance
    missionMarkers.lreverse.push(addLine(3.6,-61.4,9.4,-61.4,0xf3f4ec,.12), addLine(9.4,-61.4,9.4,-68.6,0xf3f4ec,.12), addLine(9.4,-68.6,3.6,-68.6,0xf3f4ec,.12));
    missionMarkers.lreverse.push(addLine(3.6,-68.6,3.6,-64.6,0xf3f4ec,.12), addLine(3.6,-64.6,0,-64.6,0xf3f4ec,.12));
    missionMarkers.lreverse.push(addLine(3.8,-61.8,8.9,-61.8,0xe8d17c,.07), addLine(3.8,-68.2,8.9,-68.2,0xe8d17c,.07));
    addCone(9.45,-61.4,'l1'); addCone(9.45,-68.6,'l2'); addCone(3.55,-61.4,'l3'); addCone(3.55,-68.6,'l4');
    addBoardSign('L PARK',-5.7,-65,0);
    // U-turn area; double line outline and three-step arrow hints
    missionMarkers.uturn.push(addLine(-6.2,-78.2,6.2,-78.2,0xf3f4ec,.13), addLine(-6.2,-92,6.2,-92,0xf3f4ec,.13), addLine(-6.2,-78.2,-6.2,-92,0xf3f4ec,.13), addLine(6.2,-78.2,6.2,-92,0xf3f4ec,.13));
    addPaint(-2,-83.8,.14,3.1,0xb7f36b,-.89); addPaint(0,-87.2,.14,2.4,0xb7f36b,-.89); addPaint(2,-83.8,.14,3.1,0xb7f36b,-.89);
    addBoardSign('U DÖNÜŞÜ',-8,-85,0);
    // Hill start line on the lower side of the grade; a visual reminder for the return journey.
    missionMarkers.hill.push(addPaint(0,-55.7,7.4,.16,0xffcf70,-.89));
    addBoardSign('YOKUŞ',-5.7,-52,0);
    // Finish arch
    boxMesh(.2,3.5,.2,0x243941,-4.3,1.75,28,{roughness:.5}); boxMesh(.2,3.5,.2,0x243941,4.3,1.75,28,{roughness:.5});
    boxMesh(8.8,.3,.25,0xb7f36b,0,3.35,28,{roughness:.6});
    const finishSign = new THREE.Mesh(new THREE.BoxGeometry(3.1,.8,.12),new THREE.MeshStandardMaterial({color:0x17262d,roughness:.5}));finishSign.position.set(0,3.35,27.82);scene.add(finishSign);sceneObjects.push(finishSign);
    // Add a few low buildings at the horizon, as distant context rather than a top-down board.
    const buildingColors=[0x9ba9a5,0xc0b8a4,0x80969b,0xadb9b0];
    for (let i=0;i<8;i++) {
      const side=i%2===0?-1:1; const z= -112 + i*19; const h=4+Math.random()*3;
      const building=new THREE.Mesh(new THREE.BoxGeometry(3+Math.random()*2,h,6+Math.random()*3),new THREE.MeshStandardMaterial({color:buildingColors[i%buildingColors.length],roughness:.96}));
      building.position.set(side*(15+Math.random()*4),roadHeight(z)-.32+h/2,z); building.castShadow=true;scene.add(building);sceneObjects.push(building);
      for(let w=0;w<3;w++) { const win=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,.45),new THREE.MeshStandardMaterial({color:0x526e78,roughness:.6,emissive:0x111d21}));win.position.set(side*(15+Math.random()*4)+side*1.55,roadHeight(z)-.32+1.2+w*.9,z-1+w*.6);scene.add(win);sceneObjects.push(win); }
    }
  }

  function buildCar() {
    const group = new THREE.Group();
    const wheels = [], frontPivots = [];
    const bodyMat = new THREE.MeshStandardMaterial({color:0x93c5c9,metalness:.35,roughness:.34});
    const trimMat = new THREE.MeshStandardMaterial({color:0x253942,metalness:.3,roughness:.4});
    const glassMat = new THREE.MeshStandardMaterial({color:0x274b5b,metalness:.25,roughness:.18,transparent:true,opacity:.92});
    const chromeMat = new THREE.MeshStandardMaterial({color:0xd7e2df,metalness:.55,roughness:.25});
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9,.5,4.15),bodyMat); body.position.set(0,.57,0);body.castShadow=true;body.receiveShadow=true;group.add(body);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.72,.18,1.05),bodyMat); hood.position.set(0,.82,-1.34);hood.castShadow=true;group.add(hood);
    const rear = new THREE.Mesh(new THREE.BoxGeometry(1.76,.18,.77),bodyMat); rear.position.set(0,.79,1.62);group.add(rear);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.46,.53,2.07),trimMat); cabin.position.set(0,1.02,.02);cabin.castShadow=true;group.add(cabin);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.35,.11,1.76),bodyMat); roof.position.set(0,1.34,.1);roof.castShadow=true;group.add(roof);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.34,.4,.055),glassMat); windshield.position.set(0,1.07,-.88);windshield.rotation.x=-.13;group.add(windshield);
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.3,.38,.055),glassMat); rearGlass.position.set(0,1.07,.96);rearGlass.rotation.x=.14;group.add(rearGlass);
    for (const side of [-1,1]) {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(.04,.34,1.53),glassMat); sideGlass.position.set(side*.74,1.08,.08);group.add(sideGlass);
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(.18,.13,.25),trimMat);mirror.position.set(side*1.03,.94,-.72);group.add(mirror);
    }
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.85,.16,.16),trimMat);frontBumper.position.set(0,.38,-2.1);group.add(frontBumper);
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.85,.16,.16),trimMat);rearBumper.position.set(0,.38,2.1);group.add(rearBumper);
    const lightMat = new THREE.MeshStandardMaterial({color:0xe7f4e8,emissive:0x273f37,roughness:.25});
    const tailMat = new THREE.MeshStandardMaterial({color:0xff665e,emissive:0x6e120d,roughness:.35});
    const indicatorMat = new THREE.MeshStandardMaterial({color:0xffb64d,emissive:0x472300,roughness:.3});
    const frontLights=[]; const rearLights=[]; const indicatorLights=[];
    for (const side of [-1,1]) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(.42,.16,.07),lightMat);head.position.set(side*.56,.63,-2.105);group.add(head);frontLights.push(head);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.39,.17,.07),tailMat);tail.position.set(side*.58,.65,2.105);group.add(tail);rearLights.push(tail);
      const ind = new THREE.Mesh(new THREE.BoxGeometry(.2,.13,.08),indicatorMat);ind.position.set(side*.83,.64,-2.10);group.add(ind);indicatorLights.push(ind);
    }
    // Subtle rear hatch glass highlight, roof antenna, and undercarriage.
    const under = new THREE.Mesh(new THREE.BoxGeometry(1.76,.18,3.65),new THREE.MeshStandardMaterial({color:0x11191d,roughness:.8}));under.position.set(0,.34,.03);group.add(under);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.015,.025,.35,6),chromeMat);antenna.position.set(.36,1.43,.62);antenna.rotation.z=-.2;group.add(antenna);
    for (const side of [-1,1]) {
      for (const z of [-1.3,1.32]) {
        const pivot = new THREE.Group(); pivot.position.set(side*.94,.41,z); group.add(pivot);
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.23,20),new THREE.MeshStandardMaterial({color:0x15191b,roughness:.95})); tire.rotation.z=Math.PI/2; tire.castShadow=true;pivot.add(tire);
        const sidewall = new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.238,18),new THREE.MeshStandardMaterial({color:0x82969b,metalness:.65,roughness:.33}));sidewall.rotation.z=Math.PI/2;sidewall.position.x=side*.01;pivot.add(sidewall);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.247,12),new THREE.MeshStandardMaterial({color:0x253841,metalness:.65,roughness:.28}));hub.rotation.z=Math.PI/2;hub.position.x=side*.015;pivot.add(hub);
        wheels.push(tire);
        if (z<0) frontPivots.push(pivot);
      }
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5,32),new THREE.MeshBasicMaterial({color:0x0a171b,transparent:true,opacity:.22}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(1,1.8,1);shadow.position.set(0,.075,0);group.add(shadow);
    return {group,wheels,frontPivots,frontLights,rearLights,indicatorLights};
  }

  function resizeRenderer() {
    if (!renderer || !camera) return;
    const wrap = $('#scene-wrap'); if (!wrap) return;
    const width = Math.max(1, wrap.clientWidth), height = Math.max(1, wrap.clientHeight);
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
  }

  function updateCamera(dt) {
    if (!car || !camera) return;
    const yaw = car.rotation.y;
    const backX = Math.sin(yaw), backZ = Math.cos(yaw);
    const target = new THREE.Vector3(car.position.x + backX*8.7, car.position.y + 5.4, car.position.z + backZ*8.7);
    const look = new THREE.Vector3(car.position.x - Math.sin(yaw)*3.5, car.position.y + 1.1, car.position.z - Math.cos(yaw)*3.5);
    const smooth = 1 - Math.pow(.001, dt);
    camera.position.lerp(target, smooth);
    camera.lookAt(look);
  }
  function updateCarVisuals(dt) {
    if (!carParts) return;
    carParts.frontPivots.forEach(p => { p.rotation.y = -steering * .33; });
    const wheelUi = $('#steer-wheel'); if (wheelUi && !wheelUi.classList.contains('dragging')) wheelUi.style.transform = `rotate(${steering * 155}deg)`;
    carParts.wheels.forEach(w => { w.rotation.x += speed * dt * 1.7; });
    const blink = Math.floor(elapsed * 3.1) % 2 === 0;
    const leftOn = hazards && blink;
    const rightOn = hazards && blink;
    carParts.indicatorLights.forEach((lamp, i) => {
      const on = i % 2 === 0 ? leftOn : rightOn;
      lamp.material.emissive.setHex(on ? 0xff8a1f : 0x472300);
      lamp.material.color.setHex(on ? 0xffbd53 : 0xffb64d);
    });
    carParts.frontLights.forEach(l => { l.material.emissive.setHex(headlights ? 0xcceeff : 0x273f37); });
  }

  function roadHeightAtZ(z) { return roadHeight(z); }
  function updateDriving(dt) {
    if (!car) return;
    // Make sure a belt and forward gear are selected before the first controlled move.
    if (throttleDown && !seatbelt && !missionState.flags.noBelt) {
      missionState.flags.noBelt = true; $('#belt-warning').hidden = false; deductScore(5, 'Emniyet kemeri takılmadan kalkış yapılamaz.');
    }
    if (seatbelt) $('#belt-warning').hidden = true;
    if (throttleDown && seatbelt && gear === 'N' && !missionState.flags.neutralThrottle) {
      missionState.flags.neutralThrottle = true; showDriveToast("Vites N'de; aracı hareket ettirmek için 1 veya R seç.", 'warn'); deductScore(2, 'Boş viteste gaz vermek aracı hareket ettirmez.');
    }
    const absSpeed = Math.abs(speed);
    if (brakeDown) {
      if (speed > 0) speed = Math.max(0, speed - vehicleConfig.brake*dt);
      else if (speed < 0) speed = Math.min(0, speed + vehicleConfig.brake*dt);
    } else if (throttleDown && seatbelt && gear !== 'N') {
      const direction = gear === 'R' ? -1 : 1;
      speed += direction * vehicleConfig.accel * dt;
      speed = Math.max(-vehicleConfig.maxSpeed, Math.min(vehicleConfig.maxSpeed, speed));
      if (missionState.index === 5 && hillStopped && gear === '1' && speed > 0) hillPenalty = false;
    } else {
      // Rolling resistance when the throttle is released.
      if (speed > 0) speed = Math.max(0, speed - .95*dt);
      else if (speed < 0) speed = Math.min(0, speed + .95*dt);
    }

    // Gravity on the hill: a stopped car can roll back if it is not held safely.
    if (missionState.index === 5 && car.position.z > -57 && car.position.z < -44 && Math.abs(speed) < 1.8 && !brakeDown && !(throttleDown && seatbelt && gear === '1')) {
      speed = Math.max(-2.1, speed - .8*dt);
      if (!hillPenalty && hillStopped) { deductScore(5, 'Yokuşta araç geri kaçtı. Freni tut ve doğru vitesle kalk.'); hillPenalty = true; }
    }

    const signedSpeed = speed;
    const steerMagnitude = Math.min(1, Math.abs(signedSpeed) / 2.2);
    car.rotation.y -= steering * vehicleConfig.steerRate * steerMagnitude * dt * (signedSpeed >= 0 ? 1 : -1);
    car.position.x -= Math.sin(car.rotation.y) * signedSpeed * dt;
    car.position.z -= Math.cos(car.rotation.y) * signedSpeed * dt;
    car.position.y = roadHeightAtZ(car.position.z) + Math.sin(car.rotation.y) * 0.0;

    if (Math.abs(speed) * 3.6 > 50) {
      if (!overspeedActive) { deductScore(5, 'Hız sınırı aşıldı. Hızını 50 km/sa altında tut.'); overspeedActive = true; }
    } else overspeedActive = false;

    checkConeCollision();
    processMission(dt);
    previousX = car.position.x; previousZ = car.position.z; lastGear = gear;
  }

  function checkConeCollision() {
    if (!car || elapsed - lastCollisionAt < 1.3) return;
    for (const c of coneObjects) {
      const dx = car.position.x - c.x, dz = car.position.z - c.z;
      if (Math.sqrt(dx*dx + dz*dz) < 1.05) {
        lastCollisionAt = elapsed;
        deductScore(5, 'Dubaya temas ettin. Biraz daha kontrollü manevra yap.');
        showDriveToast('Duba teması: manevra puanı düşürüldü.', 'warn');
        return;
      }
    }
  }

  function processMission(dt) {
    if (!car) return;
    const id = driveMissions[missionState.index]?.id;
    const x = car.position.x, z = car.position.z, yaw = normalizeAngle(car.rotation.y), absSpeed = Math.abs(speed);


    if (id === 'departure') {
      if (throttleDown && !seatbelt) return;
      if (z < -5.5) {
        if (!seatbelt) penaltyOnce('departureBelt', 5, 'Kalkış sırasında emniyet kemeri takılı olmalı.');
        if (gear !== '1') penaltyOnce('departureGear', 4, "Kalkış için 1. vitesi seç.");
        if (x < 3.4 && x > -3.4 && absSpeed < 13.9 && seatbelt && gear === '1') completeMission('departure', 'Güvenli kalkış ✓ +10');
        else if (Math.abs(x) > 4.0) penaltyOnce('departureLane', 4, 'Kalkışta şerit içinde kal.');
      }
    }
    else if (id === 'parallel') {
      if (z < -26.4) missionState.parallelApproach = true;
      if (missionState.parallelApproach && gear === 'R' && absSpeed > .15) {
        missionState.parallelSeenReverse = true;

      }
      if (missionState.parallelApproach && Math.abs(speed) < .55 && gear === 'R' && missionState.parallelSeenReverse && x > 4.0 && x < 6.5 && z > -24.5 && z < -13.4 && Math.abs(yaw) < .25) {
        completeMission('parallel', 'Paralel park tamamlandı ✓ +10');
        missionState.parallelExitCheck = true;
        missionState.flags.awaitingParallelExit = true;
      }
    }
    else if (id === 'reverse25') {
      if (!reverseReady && z < -41.5 && x > -1.45 && x < 1.45 && absSpeed < .55) {
        reverseReady = true; reverseStartZ = z; reverseLastZ = z; reverseDistance = 0;
        showDriveToast('Başlangıç çizgisi: R vitesine al ve düz geri git.'); updateMissionHud();
      }
      if (reverseReady && gear === 'R' && speed < -.05) {
        if (Math.abs(x) < 1.52) {
          if (reverseLastZ !== null) reverseDistance += Math.max(0, z - reverseLastZ);
        } else {
          penaltyOnce('reverseLane', 5, 'Geri giderken şerit çizgisini aştın. Aracı yeniden ortala.');
        }
        reverseLastZ = z;
        if (reverseDistance >= 25 && Math.abs(x) < 1.52 && absSpeed < 1.2) {
          completeMission('reverse25', '25 metre geri gidiş ✓ +10'); reverseReady = false; reverseDistance = 25;
        }
      } else if (reverseReady && gear !== 'R') reverseLastZ = z;
    }
    else if (id === 'lreverse') {
      if (z < -70.8) missionState.lApproach = true;
      if (missionState.lApproach && gear === 'R' && absSpeed > .15) {
        lUsedReverse = true;

      }
      if (missionState.lApproach && lUsedReverse && Math.abs(speed) < .55 && gear === 'R' && x > 4.6 && x < 7.3 && z > -67.4 && z < -62.7 && Math.abs(normalizeAngle(yaw - Math.PI/2)) < .34) {
        completeMission('lreverse', 'L dönüşü tamamlandı ✓ +10');
      }
    }
    else if (id === 'uturn') {
      const inBox = x > -5.65 && x < 5.65 && z > -91.4 && z < -78.7;
      if (inBox) missionState.uturnEntered = true;
      if (missionState.uturnEntered && inBox && gear === '1' && speed > .4 && uturnPhase === 0) uturnPhase = 1;
      if (missionState.uturnEntered && inBox && gear === 'R' && speed < -.2 && uturnPhase === 1) uturnPhase = 2;
      if (missionState.uturnEntered && inBox && gear === '1' && speed > .4 && uturnPhase === 2) {
        const facingBack = Math.abs(Math.abs(yaw) - Math.PI) < .45;
        if (facingBack && uturnGearChanges <= 2) completeMission('uturn', 'U dönüşü tamamlandı ✓ +10');
      }
      if (missionState.uturnEntered && !inBox && !state.completedStages.has('uturn')) penaltyOnce('uturnBoundary', 5, 'U dönüşü alanının dışına çıktın. Alan içinde kal.');
      if (uturnGearChanges > 2) penaltyOnce('uturnGearChanges', 5, 'U dönüşünde izin verilen hamle sayısını aştın.');
    }
    else if (id === 'hill') {
      const inHillStart = z > -57 && z < -52 && x > -3.1 && x < 3.1;
      if (inHillStart && absSpeed < .22 && brakeDown) {
        hillStopped = true; hillStartZ = z; $('#gear-help').textContent = 'Durdu: 1. vites seç';
      }
      if (z > -57 && z < -52 && absSpeed < .22 && gear === 'N' && !brakeDown) {
        // A neutral car on a slope is not held safely; the gravity simulation below demonstrates rollback.
      }
      if (hillStopped && gear === '1' && throttleDown && seatbelt && z > -44.6 && speed > 0 && !hillPenalty) {
        completeMission('hill', 'Yokuş kalkışı tamamlandı ✓ +10');
      }
      if (!hillStopped && z > -51.5 && !missionState.flags.missedHillStop) {
        penaltyOnce('missedHillStop', 5, 'Yokuşta kalkış provası için önce durmalıydın. Güvenli şekilde geri dönüp dene.');
      }
    }
    else if (id === 'finish') {
      if (z > 22.5 && Math.abs(x) < 3.8 && absSpeed < 2.2) {
        completeMission('finish', 'Parkur tamamlandı ✓ +10');
      }
      if (z > 25 && absSpeed >= 2.2 && !missionState.finishWarned) {
        missionState.finishWarned = true; showDriveToast('Bitiş alanında hızını düşür ve güvenli dur.', 'warn');
      }
      if (Math.abs(x) > 4.1) penaltyOnce('finishLane', 4, 'Bitiş alanında şerit içinde kal.');
    }

    // Clear one-time gear warning when the driver has stopped.
    if (absSpeed < .1) missionState.flags.gearWhileMoving = false;
  }

  function refreshDriveHud() {
    $('#speed-value').textContent = String(Math.round(Math.abs(speed) * 3.6));
    $('#gear-readout').textContent = gear;
    const driveScore = $('#drive-score'); if (driveScore) driveScore.textContent = String(state.score);
    if (missionState.index === 2 && reverseReady) {
      $('#distance-pill').hidden = false;
      $('#distance-pill').innerHTML = `GERİ: <b>${Math.min(25, reverseDistance).toFixed(1)} / 25 m</b>`;
    } else $('#distance-pill').hidden = driveMissions[missionState.index]?.id !== 'reverse25';
  }

  function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function finishGame() {
    state.finalScore = state.score;
    gameScreen.classList.remove('is-driving');
    stageContent.hidden = false;
    driveScreen.hidden = true;
    stageContent.innerHTML = `
      <div class="final-screen"><div class="final-medal">${state.score >= 85 ? '🏆' : state.score >= 65 ? '✓' : '↻'}</div><div class="step-kicker">SİMÜLASYON TAMAMLANDI</div><h2>${state.score >= 85 ? 'Harika sürüş!' : state.score >= 65 ? 'Parkuru tamamladın!' : 'İyi bir prova yaptın!'}</h2><p>${state.score >= 85 ? 'Çok az hata yaptın. Bu dikkati gerçek araçta da koru.' : state.score >= 65 ? 'Tüm aşamalardan geçtin. Puan kaybettiğin davranışları tekrar çalış.' : 'Parkuru bitirdin. Şimdi puan düşen bölümleri eğitmeninle tekrar çalışabilirsin.'}</p><div class="final-score">${state.score}<small> / 100</small></div><div class="final-breakdown"><div class="final-stat"><b>${Math.min(10,state.completedStages.size)}</b><small>Tamamlanan aşama</small></div><div class="final-stat"><b>${100-state.score}</b><small>Puan kaybı</small></div><div class="final-stat"><b>${state.score >= 85 ? 'İyi' : state.score >= 65 ? 'Orta' : 'Tekrar'}</b><small>Prova sonucu</small></div></div><button id="play-again" class="primary-btn">Yeniden oyna <span class="button-arrow">↗</span></button><div class="start-disclaimer">Bu skor resmî sınav sonucu değildir. Gerçek sınav kuralları ve araç donanımı esas alınır.</div></div>`;
    $('#play-again').addEventListener('click', () => { const wasParkOnly = state.driveOnlyMode; resetGame(); startScreen.hidden = true; gameScreen.hidden = false; state.driveOnlyMode = wasParkOnly; if (wasParkOnly) startDrive(); else { beginObjectQuiz('trunk'); updateHeader('trunk'); } });
    disposeDrive();
  }

  function disposeDrive() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    if (renderer) { try { renderer.dispose(); } catch (_) {} }
    renderer = null; scene = null; camera = null; car = null; carParts = null; isSceneReady = false;
    sceneObjects = []; coneObjects = []; markerMeshes = []; wheelMeshes = []; frontWheelPivots = [];
    window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('resize', resizeRenderer);
  }

  // On narrow screens the browser can start a pull-to-refresh gesture on touch devices;
  // controls explicitly opt into pointer handling instead.
  document.addEventListener('contextmenu', e => { if (e.target.closest('.drive-screen')) e.preventDefault(); });
})();
