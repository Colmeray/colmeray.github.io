const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${(index % 3) * 80}ms`;
  observer.observe(element);
});

document.getElementById('year').textContent = new Date().getFullYear();

const surpriseButton = document.querySelector('.surprise-button');
const hiddenWish = document.querySelector('.hidden-wish');
const confettiLayer = document.querySelector('.confetti-layer');
const colors = ['#ff625f', '#ffd84d', '#2f5bea', '#ffffff', '#ff9bac'];

function launchConfetti(amount = 90) {
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2.6 + Math.random() * 2.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 5500);
  }
}

surpriseButton.addEventListener('click', () => {
  hiddenWish.classList.add('show');
  surpriseButton.textContent = 'Hurra! 🎉';
  launchConfetti();
});

window.addEventListener('load', () => window.setTimeout(() => launchConfetti(35), 350));
