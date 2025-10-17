// Breathe animation logic
const breatheBtn = document.getElementById('breathe-btn');
const breatheAnim = document.getElementById('breathe-animation');
const breatheCircle = document.querySelector('.breathe-circle');
const breatheText = document.querySelector('.breathe-text');

breatheBtn.addEventListener('click', () => {
    breatheAnim.style.display = 'flex';
    breatheBtn.disabled = true;
    breatheText.textContent = 'Breathe in...';
    breatheCircle.style.width = '80px';
    breatheCircle.style.height = '80px';

    setTimeout(() => {
        breatheCircle.style.width = '160px';
        breatheCircle.style.height = '160px';
        breatheText.textContent = '...and out';
    }, 100);

    setTimeout(() => {
        breatheCircle.style.width = '80px';
        breatheCircle.style.height = '80px';
        breatheText.textContent = 'Relax';
    }, 4100);

    setTimeout(() => {
        breatheAnim.style.display = 'none';
        breatheBtn.disabled = false;
        breatheText.textContent = '';
    }, 6000);
});
