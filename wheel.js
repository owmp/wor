const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const nextBtn = document.getElementById("nextBtn");
const wheelTitle = document.getElementById("wheel-title");
const tickSound = document.getElementById("tickSound");
const winSound = document.getElementById("winSound");
const resetBtnBottom = document.getElementById("resetBtnBottom");

let currentWheel = 0;
let rotation = 0;
let spinning = false;
let results = [];
let lastSlice = -1;
let hasSpunCurrentWheel = false;

const wheels = [
  {
    title: "SPIN FOR CASES",
    options: ["1 Case","2 Cases","3 Cases","4 Cases","5 Cases","6 Cases","7 Cases","8 Cases","9 Cases","10 Cases"]
  },
  {
    title: "SPIN FOR CASE PRICES",
    options: ["$0.50 - $5.00","$5.00 - $10.00","$10.00 - $25.00","$25.00 - $100.00","$100.00 - $250.00","$250.00 - $500.00","$500+"]
  },
  {
    title: "SPIN FOR BATTLE RULES",
    options: [
      "RICKASHAYS CHOICE","Standard (3v3)","Standard (1v1v1)","Standard (2v2)","4 Way Standard",
      "Crazy (3v3)","Crazy (1v1v1)","Crazy (2v2)","4 Way Crazy",
      "Standard Jackpot (3v3)","Standard Jackpot (1v1v1)","Standard Jackpot (2v2)","4 Way Standard Jackpot",
      "Crazy Jackpot (3v3)","Crazy Jackpot (1v1v1)","Crazy Jackpot (2v2)","4 Way Crazy Jackpot",
      "Standard Terminal (3v3)","Standard Terminal (1v1v1)","Standard Terminal (2v2)","4 Way Standard Terminal",
      "Crazy Terminal (3v3)","Crazy Terminal (1v1v1)","Crazy Terminal (2v2)","4 Way Crazy Terminal",
      "Standard Jackpot Terminal (3v3)","Standard Jackpot Terminal (1v1v1)","Standard Jackpot Terminal (2v2)","Standard Jackpot Terminal 4 Way"
    ]
  }
];

nextBtn.disabled = true;
nextBtn.classList.add("disabled");
nextBtn.style.display = "inline-block";

function drawWheel() {
  const options = wheels[currentWheel].options;
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2;
  const sliceAngle = (2 * Math.PI) / options.length;

  ctx.clearRect(0, 0, size, size);

  options.forEach((option, i) => {
    const angle = i * sliceAngle + rotation;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + sliceAngle);
    ctx.fillStyle = i % 2 === 0 ? "#00eaff" : "#004c66";
    ctx.fill();
    ctx.strokeStyle = "#001b24";
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle + sliceAngle / 2);

    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Dynamic font size based on slice size
    let fontSize = Math.min(18, (sliceAngle * 180 / Math.PI) * 0.6);
    fontSize = Math.max(fontSize, 10);

    ctx.font = `bold ${fontSize}px Nexa Heavy`;

    const textRadius = radius * 0.65;

    wrapText(
      ctx,
      option,
      textRadius,
      0,
      radius * 0.35,
      fontSize + 2
    );

    ctx.restore();
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lines.forEach((l, index) => {
    ctx.fillText(
      l.trim(),
      x,
      y + index * lineHeight - ((lines.length - 1) * lineHeight) / 2
    );
  });
}

function spinWheel() {
  if (spinning) return;

  spinning = true;

  const options = wheels[currentWheel].options;
  const sliceAngle = (2 * Math.PI) / options.length;

  const winningIndex = Math.floor(Math.random() * options.length);

  const pointerAngle = -Math.PI / 2; // pointer at top

  const targetAngle =
    (2 * Math.PI - (winningIndex * sliceAngle + sliceAngle / 2)) + pointerAngle;

  const spins = 6;
  const finalRotation = spins * 2 * Math.PI + targetAngle;

  const duration = 4500;
  const start = performance.now();

  function animate(time) {
    const progress = (time - start) / duration;

    if (progress < 1) {
      const ease = 1 - Math.pow(1 - progress, 4);
      rotation = finalRotation * ease;
      drawWheel();
      requestAnimationFrame(animate);
    } else {
      rotation = finalRotation;
      drawWheel();
      spinning = false;
      finalizeSpin(winningIndex);
    }
  }

  requestAnimationFrame(animate);
}

function playTick() {
  const options = wheels[currentWheel].options;
  const sliceAngle = (2 * Math.PI) / options.length;
  const index = Math.floor(((2 * Math.PI - (rotation % (2 * Math.PI))) / sliceAngle)) % options.length;

  if (index !== lastSlice) {
    tickSound.currentTime = 0;
    tickSound.play();
    lastSlice = index;
  }
}

function finalizeSpin(index) {
  const result = wheels[currentWheel].options[index];

  results[currentWheel] = result;

  if (currentWheel === 0) {
    document.getElementById("summaryCases").textContent = result;
  }

  if (currentWheel === 1) {
    document.getElementById("summaryPrice").textContent = result;
  }

  if (currentWheel === 2) {
    document.getElementById("summaryRules").textContent = result;
  }

  spinBtn.textContent = "RESPIN";

  hasSpunCurrentWheel = true;

 if (currentWheel < wheels.length - 1) {
  nextBtn.disabled = false;
  nextBtn.classList.remove("disabled");
  nextBtn.style.display = "inline-block";

  resetBtnBottom.style.display = "none";
} else {
  nextBtn.style.display = "none";
}
}


function showFinalSummary() {
  const overlay = document.getElementById("summaryOverlay");
  const content = document.getElementById("summaryContent");

  content.innerHTML = `
    Cases: ${results[0] || "-"} <br><br>
    Price Range: ${results[1] || "-"} <br><br>
    Rules: ${results[2] || "-"}
  `;

  overlay.classList.add("active");
}

spinBtn.addEventListener("click", spinWheel);

nextBtn.addEventListener("click", () => {
  if (spinning || !hasSpunCurrentWheel) return;

  currentWheel++;

  if (currentWheel >= wheels.length) return;

  wheelTitle.textContent = wheels[currentWheel].title;

  rotation = 0;
  drawWheel();

  spinBtn.textContent = "SPIN";
  hasSpunCurrentWheel = false;

  // 🔥 CONTROL RESET VISIBILITY HERE
  if (currentWheel === wheels.length - 1) {
    nextBtn.style.display = "none";
    resetBtnBottom.style.display = "inline-block"; // show immediately
  } else {
    nextBtn.disabled = true;
    nextBtn.classList.add("disabled");
    nextBtn.style.display = "inline-block";
    resetBtnBottom.style.display = "none"; // hide on other wheels
  }
});

window.addEventListener("load", () => {
  document.fonts.ready.then(() => {
    drawWheel();
  });
});

const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {

  // Go back to first wheel
  currentWheel = 0;

  // Reset wheel visuals
  rotation = 0;
  drawWheel();

  wheelTitle.textContent = wheels[currentWheel].title;

  // Clear results array
  results = [];

  document.getElementById("summaryCases").textContent = "";
  document.getElementById("summaryPrice").textContent = "";
  document.getElementById("summaryRules").textContent = "";

  // Reset spin state
  spinning = false;
  hasSpunCurrentWheel = false;

  // Reset spin button
  spinBtn.textContent = "SPIN";

  // 🔥 IMPORTANT PART
  // Show NEXT but keep it disabled
  nextBtn.style.display = "inline-block";
  nextBtn.disabled = true;
  nextBtn.classList.add("disabled");
  resetBtnBottom.style.display = "none";

});

resetBtnBottom.addEventListener("click", () => {
  resetBtn.click(); // triggers your existing reset logic
});