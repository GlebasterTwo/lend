const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");

const pointer = {
  x: 0,
  y: 0,
};

let stars = [];
let width = 0;
let height = 0;
let pixelRatio = 1;

function resize() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const starCount = Math.floor((width * height) / 7800);
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.25,
    speed: Math.random() * 0.18 + 0.03,
    alpha: Math.random() * 0.55 + 0.25,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.speed;
    star.x += pointer.x * 0.002 * star.speed;

    if (star.y > height + 4) {
      star.y = -4;
      star.x = Math.random() * width;
    }

    if (star.x > width + 4) star.x = -4;
    if (star.x < -4) star.x = width + 4;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / width - 0.5) * 2;
  pointer.y = (event.clientY / height - 0.5) * 2;
});

resize();
draw();

const contactWidget = document.querySelector("#contacts-widget");
const contactToggle = document.querySelector(".contact-toggle");
const contactMenu = document.querySelector("#contact-menu");

function setContactMenu(open) {
  contactWidget.classList.toggle("is-open", open);
  contactToggle.setAttribute("aria-expanded", String(open));
  contactMenu.setAttribute("aria-hidden", String(!open));
}

contactToggle.addEventListener("click", () => {
  setContactMenu(!contactWidget.classList.contains("is-open"));
});

document.addEventListener("click", (event) => {
  if (!contactWidget.contains(event.target)) {
    setContactMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setContactMenu(false);
    contactToggle.focus();
  }
});
