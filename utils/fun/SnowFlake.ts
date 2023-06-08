import next from 'next/types';

export const snowflakeCursor = () => {
  const possibleEmoji = ['🎉'];

  let width = window.innerWidth;
  let height = window.innerHeight;

  let cursor = { x: width / 2, y: width / 2 };
  let particles = [];

  const init = () => {
    bindEvents();
    loop();
  };

  // Bind events that are needed
  const bindEvents = () => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchstart', onTouchMove);
    window.addEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
  };

  const onTouchMove = (e: any) => {
    if (e.touches.length > 0) {
      for (var i = 0; i < e.touches.length; i++) {
        addParticle(
          e.touches[i].clientX,
          e.touches[i].clientY,
          possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)],
        );
      }
    }
  };

  const onMouseMove = (e: any) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;

    addParticle(
      cursor.x,
      cursor.y,
      possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)],
    );
  };

  const addParticle = (x, y, character) => {
    var particle = new Particle();
    particle.init(x, y, character);
    particles.push(particle);
  };

  const updateParticles = () => {
    // Updated
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
    }

    // Remove dead particles
    for (var i = particles.length - 1; i >= 0; i--) {
      if (particles[i].lifeSpan < 0) {
        particles[i].die();
        particles.splice(i, 1);
      }
    }
  };

  const loop = () => {
    requestAnimationFrame(loop);
    updateParticles();
  };

  /**
   * Particles
   */

  class Particle {
    initialStyles: any;
    velocity: any;
    lifeSpan: number;
    position: any;
    element: any;

    constructor() {
      this.initialStyles = {
        position: 'absolute',
        display: 'block',
        pointerEvents: 'none',
        'z-index': '10000000',
        fontSize: '16px',
        'will-change': 'transform',
      };
    }

    init = (x, y, character) => {
      this.velocity = {
        x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
        y: 1 + Math.random(),
      };

      this.lifeSpan = 120 + Math.floor(Math.random() * 60); //ms

      this.position = { x: x - 20, y: y - 20 };

      this.element = document.createElement('span');
      this.element.innerHTML = character;
      applyProperties(this.element, this.initialStyles);
      this.update();

      var nextRoot = document.getElementById('__next');
      nextRoot.insertBefore(this.element, nextRoot.firstChild);
    };

    update = () => {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
      this.velocity.y -= Math.random() / 400;

      this.lifeSpan--;

      this.element.style.transform =
        'translate3d(' +
        this.position.x +
        'px,' +
        this.position.y +
        'px,0) scale(' +
        this.lifeSpan / 180 +
        ') rotate(' +
        2 * this.lifeSpan +
        'deg)';
    };

    die = () => {
      this.element.parentNode.removeChild(this.element);
    };
  }

  const applyProperties = (target: any, properties: any) => {
    for (var key in properties) {
      target.style[key] = properties[key];
    }
  };
  init();
};
