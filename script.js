import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const canvas = document.getElementById("bg3d");
const priceGrid = document.getElementById("price-grid");
const reviewCards = Array.from(document.querySelectorAll(".review-card"));
const reserveForm = document.querySelector(".reserve-form");
const reserveButton = document.querySelector(".reserve-btn");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 8;

const keyLight = new THREE.PointLight(0xffd8a4, 1.35);
keyLight.position.set(4, 6, 4);
scene.add(keyLight);
scene.add(new THREE.AmbientLight(0x9a6a2e, 0.62));

const mandalaGroup = new THREE.Group();
scene.add(mandalaGroup);

const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0xd6a95a,
  emissive: 0x40240d,
  metalness: 0.68,
  roughness: 0.24
});

for (let i = 0; i < 3; i += 1) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.25 + i * 0.45, 0.05, 20, 120),
    ringMaterial
  );
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = i * 0.45;
  mandalaGroup.add(ring);
}

const petalMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd9a1,
  emissive: 0x3b1f09,
  metalness: 0.35,
  roughness: 0.35
});
const petalGeometry = new THREE.SphereGeometry(0.16, 24, 24);
for (let i = 0; i < 18; i += 1) {
  const angle = (i / 18) * Math.PI * 2;
  const petal = new THREE.Mesh(petalGeometry, petalMaterial);
  petal.position.set(Math.cos(angle) * 2.15, Math.sin(angle) * 2.15, 0);
  mandalaGroup.add(petal);
}
mandalaGroup.position.set(-2.4, 1.2, -1.3);

const diya = new THREE.Mesh(
  new THREE.ConeGeometry(0.8, 1.55, 36, 1, true),
  new THREE.MeshStandardMaterial({
    color: 0xb57630,
    emissive: 0x2e1608,
    metalness: 0.55,
    roughness: 0.32
  })
);
diya.rotation.x = Math.PI;
diya.position.set(2.6, -1.2, -1.5);
scene.add(diya);

const flame = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 20, 20),
  new THREE.MeshStandardMaterial({
    color: 0xffc04b,
    emissive: 0xff6f20,
    emissiveIntensity: 1.2
  })
);
flame.scale.set(0.65, 1.2, 0.65);
flame.position.set(2.6, -0.35, -1.35);
scene.add(flame);

const dustGeometry = new THREE.BufferGeometry();
const dustCount = 800;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount * 3; i += 3) {
  dustPositions[i] = (Math.random() - 0.5) * 28;
  dustPositions[i + 1] = (Math.random() - 0.5) * 18;
  dustPositions[i + 2] = (Math.random() - 0.5) * 28;
}
dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(
  dustGeometry,
  new THREE.PointsMaterial({
    color: 0xffdfac,
    size: 0.05,
    transparent: true,
    opacity: 0.72
  })
);
scene.add(dust);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

function renderPrices() {
  if (!priceGrid) return;
  const prices = Array.isArray(window.HAVELI_PRICES) ? window.HAVELI_PRICES : [];
  if (prices.length === 0) {
    priceGrid.innerHTML = '<article class="glass price-card"><h4>Menu update soon</h4></article>';
    return;
  }

  priceGrid.innerHTML = prices
    .map(
      (entry) => `
        <article class="glass price-card">
          <h4>${entry.item}</h4>
          <p class="price-value">Rs. ${entry.price}</p>
          <p class="price-unit">${entry.unit}</p>
        </article>
      `
    )
    .join("");
}

function runReviewSlider() {
  if (reviewCards.length <= 1) return;
  let current = 0;
  setInterval(() => {
    reviewCards[current].classList.remove("active");
    current = (current + 1) % reviewCards.length;
    reviewCards[current].classList.add("active");
  }, 2600);
}

function setupWhatsAppReservation() {
  if (!reserveForm || !reserveButton) return;

  reserveButton.addEventListener("click", () => {
    const formData = new FormData(reserveForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const slot = String(formData.get("bookingSlot") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const message = String(formData.get("message") || "").trim() || "I want to book now.";

    if (!name || !phone) {
      window.alert("Please enter your full name and phone number.");
      return;
    }

    const requestText =
      "Hello Highway Haveli, I want to make a reservation.%0A%0A" +
      `Name: ${encodeURIComponent(name)}%0A` +
      `Phone: ${encodeURIComponent(phone)}%0A` +
      `Booking Slot: ${encodeURIComponent(slot)}%0A` +
      `Preferred Date: ${encodeURIComponent(date || "Not selected")}%0A` +
      `Message: ${encodeURIComponent(message)}`;

    window.open(`https://wa.me/919060552261?text=${requestText}`, "_blank");
  });
}

function animate() {
  requestAnimationFrame(animate);
  mandalaGroup.rotation.z += 0.0026;
  mandalaGroup.rotation.y += 0.0018;
  diya.rotation.y -= 0.006;
  flame.scale.y = 1.06 + Math.sin(Date.now() * 0.01) * 0.22;
  dust.rotation.y += 0.0006;

  camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.03;
  camera.position.y += (-pointer.y * 0.5 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();
renderPrices();
runReviewSlider();
setupWhatsAppReservation();
