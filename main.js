/**
 * ============================================================================
 * MAIN APPLICATION SCRIPT - CHET DANYEL C. ANAVE PORTFOLIO
 * ============================================================================
 * Features:
 * 1. Custom Smooth Magnetic Cursor with Trailing Ring
 * 2. 3D Card Tilt with Dynamic Specular Glare
 * 3. Role Typewriter & Cyber Scrambler
 * 4. Web Audio API Futuristic UI Synthesizer (Optional soundscapes/clicks)
 * 5. Scroll Spy & Scroll Progress Indicator
 * 6. Skills & Featured Engineering Projects Filtering Logic
 * 7. Interactive Project Architecture Modal
 * 8. Live Academic Telemetry Clock & Toast System
 * 9. Scroll-Triggered Reveal Animations
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 01. AUDIO SYNTHESIZER (Web Audio API)
  // --------------------------------------------------------------------------
  const AudioController = (function () {
    let audioCtx = null;
    let isMuted = true; // Default muted for clean, non-intrusive experience
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioOnIcon = audioBtn ? audioBtn.querySelector('.audio-on-icon') : null;
    const audioOffIcon = audioBtn ? audioBtn.querySelector('.audio-off-icon') : null;

    function initAudio() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playTone(freq, type, duration, gainLevel) {
      if (isMuted) return;
      initAudio();
      if (!audioCtx) return;

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const now = audioCtx.currentTime;
        const vol = gainLevel || 0.05;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Audio error suppression
      }
    }

    function playHoverSound() {
      playTone(880, 'triangle', 0.04, 0.02);
    }

    function playClickSound() {
      playTone(1320, 'sine', 0.06, 0.04);
      setTimeout(() => playTone(1760, 'sine', 0.07, 0.03), 40);
    }

    function playSuccessSound() {
      playTone(523.25, 'sine', 0.08, 0.04);
      setTimeout(() => playTone(659.25, 'sine', 0.08, 0.04), 80);
      setTimeout(() => playTone(783.99, 'sine', 0.12, 0.05), 160);
      setTimeout(() => playTone(1046.50, 'sine', 0.2, 0.05), 240);
    }

    function updateIcons() {
      if (audioOnIcon && audioOffIcon) {
        if (isMuted) {
          audioOnIcon.classList.add('hidden');
          audioOffIcon.classList.remove('hidden');
          if (audioBtn) audioBtn.setAttribute('title', 'Unmute Futuristic UI Audio');
        } else {
          audioOnIcon.classList.remove('hidden');
          audioOffIcon.classList.add('hidden');
          if (audioBtn) audioBtn.setAttribute('title', 'Mute Futuristic UI Audio');
        }
      }
    }

    if (audioBtn) {
      audioBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        updateIcons();
        if (!isMuted) {
          initAudio();
          playSuccessSound();
          showToast('Cyber Audio Activated 🔊');
        } else {
          showToast('Audio Muted 🔇');
        }
      });
    }

    updateIcons();

    return {
      playHover: playHoverSound,
      playClick: playClickSound,
      playSuccess: playSuccessSound,
    };
  })();

  // --------------------------------------------------------------------------
  // 02. CUSTOM CURSOR
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing) {
    let mousePos = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };

    window.addEventListener('mousemove', function (e) {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      cursorDot.style.left = `${mousePos.x}px`;
      cursorDot.style.top = `${mousePos.y}px`;
    });

    function renderCursor() {
      ringPos.x += (mousePos.x - ringPos.x) * 0.2;
      ringPos.y += (mousePos.y - ringPos.y) * 0.2;
      cursorRing.style.left = `${ringPos.x}px`;
      cursorRing.style.top = `${ringPos.y}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    const interactiveSelectors = 'a, button, input, textarea, .tilt-card, .skill-filter-btn, .project-filter-btn';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        AudioController.playHover();
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
      el.addEventListener('click', () => {
        AudioController.playClick();
      });
    });
  }

  // --------------------------------------------------------------------------
  // 03. 3D CARD TILT WITH DYNAMIC GLARE
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    const intensity = parseFloat(card.getAttribute('data-tilt-intensity')) || 8;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -intensity;
      const rotateY = ((x - centerX) / centerX) * intensity;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

      const glare = card.querySelector('.card-glow');
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.15), transparent 70%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.4s ease';

      const glare = card.querySelector('.card-glow');
      if (glare) {
        glare.style.background = 'transparent';
      }
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  // --------------------------------------------------------------------------
  // 04. HERO ROLE TYPEWRITER & CYBER SCRAMBLER
  // --------------------------------------------------------------------------
  const typewriterEl = document.getElementById('typewriter-text');
  if (typewriterEl) {
    const roles = [
      'First Year BSIT Student',
      'Aspiring Software Engineer',
      'Roblox Lua Game Developer',
      'Java & Java Swing Developer',
      'Modern Web Developer',
      'IETI College of Science & Tech INC.',
    ];

    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 75;

    function typeWriterLoop() {
      const currentRole = roles[currentRoleIndex];

      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 35;
      } else {
        typewriterEl.textContent = currentRole.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 85;
      }

      if (!isDeleting && currentCharIndex === currentRole.length) {
        typingSpeed = 2200;
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentRoleIndex = (currentRoleIndex + 1) % roles.length;
        typingSpeed = 400;
      }

      setTimeout(typeWriterLoop, typingSpeed);
    }

    typeWriterLoop();
  }

  // --------------------------------------------------------------------------
  // 05. SCROLL PROGRESS BAR & SCROLL SPY NAVIGATION
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress-bar');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.pageYOffset / totalHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll spy for active link
    let currentSectionId = '';
    const scrollPos = window.pageYOffset + 240;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        if (link.getAttribute('data-nav') === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 06. MOBILE NAVIGATION DRAWER
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileClose = document.getElementById('mobile-close-btn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileNav() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      AudioController.playClick();
    }
  }

  function closeMobileNav() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      AudioController.playClick();
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  mobileLinks.forEach((link) => link.addEventListener('click', closeMobileNav));

  // --------------------------------------------------------------------------
  // 07. SKILLS FILTERING & METER ANIMATION
  // --------------------------------------------------------------------------
  const skillFilterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      skillFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      AudioController.playClick();

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach((card) => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('is-hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.classList.add('is-hidden');
          }, 250);
        }
      });
    });
  });

  // Skill meters fill animation on intersection
  const skillMeterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.meter-fill');
          fills.forEach((fill) => {
            const target = fill.style.getPropertyValue('--target-width');
            if (target) {
              fill.style.width = target;
            }
          });
          skillMeterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    skillMeterObserver.observe(skillsSection);
  }

  // --------------------------------------------------------------------------
  // 08. FEATURED ENGINEERING PROJECTS FILTERING & SPECS MODAL
  // Exclusively: 1. Roblox Lua Game Dev, 2. Web Dev, 3. Java Swing
  // --------------------------------------------------------------------------
  const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  projectFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      projectFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      AudioController.playClick();

      const filter = btn.getAttribute('data-pfilter');

      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-pcat');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('is-hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.classList.add('is-hidden');
          }, 250);
        }
      });
    });
  });

  // Project Specs Database for the 3 Featured Engineering Projects
  const projectData = {
    roblox_nexus: {
      tag: 'ROBLOX LUA // GAME SYSTEM ARCHITECTURE',
      title: 'NexusEngine: Roblox Modular RPG & Combat Framework (Lua)',
      overview:
        'A comprehensive multiplayer RPG and combat framework developed in Roblox Studio with Lua/Luau. Implements client-server remote event synchronization, hit registration, dynamic inventory state tables, and fluid UI tweening.',
      keyFeatures: [
        'Client-Server Replication: RemoteEvents and RemoteFunctions validated with sanity checks against exploiting.',
        'Object-Oriented Metatables: Custom Character, Weapon, and Inventory classes leveraging Lua metatables (__index).',
        'Combat & Hitbox Registration: Raycast hitbox detection synchronized with physics velocity.',
        'Fluid UI HUD: Custom health, stamina, and cooldown meters animated via TweenService.',
      ],
      codeSample: `-- Sample Lua Network Signal & Replication Wrapper
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local CombatService = {}
CombatService.__index = CombatService

function CombatService.new(player)
    local self = setmetatable({}, CombatService)
    self.Player = player
    self.ComboCount = 0
    self.LastAttackTime = 0
    return self
end

function CombatService:ExecuteAttack(targetHitbox)
    local currentTime = os.clock()
    if currentTime - self.LastAttackTime < 0.25 then return end
    
    self.ComboCount = (self.ComboCount % 4) + 1
    self.LastAttackTime = currentTime
    
    -- Fire RemoteEvent to client for localized sound and visual VFX
    ReplicatedStorage.Events.AttackReplication:FireAllClients(self.Player, self.ComboCount)
end

return CombatService`,
      tech: ['Roblox Studio', 'Lua 5.1 / Luau', 'RemoteEvents', 'Metatables', 'TweenService'],
    },
    web_novaspace: {
      tag: 'WEB DEVELOPMENT // 3D INTERACTIVE ARCHITECTURE',
      title: 'NovaSpace: Interactive 3D Web Environment',
      overview:
        'A cutting-edge responsive web platform engineered using semantic HTML5, modern CSS3 layout modules, and ES6+ JavaScript. Features interactive 3D WebGL scenes, custom cursor physics, and responsive UI components.',
      keyFeatures: [
        '3D Canvas Integration: Three.js WebGL scene with real-time mouse tracking and procedural particle constellation.',
        'Interactive 3D Tilt: Perspective card tilt physics with dynamic lighting and specular glare.',
        'Responsive Layouts: Mobile-first fluid CSS grid and flexbox architecture across all screen breakpoints.',
        'Custom UI Synthesizer: Web Audio API integration producing futuristic interactive audio feedback.',
      ],
      codeSample: `// Interactive 3D Web Tilt Physics Algorithm
function applyCardTilt(card, mouseEvent, intensity = 8) {
    const rect = card.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    
    card.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) translateY(-4px)\`;
    
    const glare = card.querySelector('.card-glow');
    if (glare) {
        glare.style.background = \`radial-gradient(circle at \${x}px \${y}px, rgba(0, 240, 255, 0.15), transparent 70%)\`;
    }
}`,
      tech: ['HTML5', 'CSS3 / Grid & Flex', 'JavaScript ES6+', 'Three.js / WebGL', 'Responsive UI'],
    },
    java_apexdesk: {
      tag: 'JAVA SWING // DESKTOP OOP ARCHITECTURE',
      title: 'ApexDesk: Academic & Inventory System (Java Swing)',
      overview:
        'A robust desktop GUI application developed using Java, Java Swing, and AWT. Structured with clean Model-View-Controller (MVC) architectural separation, custom table models, event listener queues, and local file I/O persistence.',
      keyFeatures: [
        'Swing GUI Architecture: Modular JFrame container utilizing JPanel layouts (BorderLayout, GridBagLayout, FlowLayout).',
        'MVC Architecture: Decoupled Data Models, GUI Views, and Action Controllers for clean code maintainability.',
        'Interactive JTable: Custom DefaultTableModel with dynamic row sorting, filtering, and cell renderers.',
        'Local File Persistence: Serialization and structured file I/O saving academic records and inventory.',
      ],
      codeSample: `// Java Swing MVC Controller & EventQueue Listener
public class InventoryController implements ActionListener {
    private final InventoryView view;
    private final InventoryModel model;

    public InventoryController(InventoryView view, InventoryModel model) {
        this.view = view;
        this.model = model;
        this.view.getSaveButton().addActionListener(this);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == view.getSaveButton()) {
            String name = view.getItemNameInput().getText().trim();
            int quantity = Integer.parseInt(view.getQuantityInput().getText().trim());
            
            Item item = new Item(name, quantity);
            model.addItem(item);
            
            // Update Swing DefaultTableModel on the Event Dispatch Thread (EDT)
            SwingUtilities.invokeLater(() -> view.getTableModel().addRow(item.toRowData()));
        }
    }
}`,
      tech: ['Java', 'Java Swing', 'AWT', 'OOP & MVC', 'File I/O'],
    },
  };

  const projectModal = document.getElementById('project-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTag = document.getElementById('modal-tag');
  const modalBody = document.getElementById('modal-body');

  function openProjectModal(projectId) {
    const data = projectData[projectId];
    if (!data || !projectModal || !modalBody) return;

    modalTag.textContent = data.tag;
    modalBody.innerHTML = `
      <h2 style="font-family: var(--font-display); font-size: 1.6rem; color: #ffffff; margin-bottom: 0.75rem;">
        ${data.title}
      </h2>
      <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
        ${data.overview}
      </p>
      
      <h4 style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--cyan-neon); margin-bottom: 0.6rem;">
        KEY ENGINEERING HIGHLIGHTS:
      </h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;">
        ${data.keyFeatures
          .map(
            (feat) => `
          <li style="display: flex; gap: 0.5rem; font-size: 0.88rem; color: var(--text-primary); line-height: 1.5;">
            <span style="color: var(--cyan-neon);">▹</span>
            <span>${feat}</span>
          </li>
        `
          )
          .join('')}
      </ul>

      <h4 style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--cyan-neon); margin-bottom: 0.4rem;">
        ARCHITECTURE CODE EXTRACT:
      </h4>
      <pre class="modal-code-block"><code>${escapeHtml(data.codeSample)}</code></pre>

      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1.25rem;">
        ${data.tech
          .map(
            (t) => `
          <span style="font-family: var(--font-mono); font-size: 0.72rem; padding: 0.25rem 0.65rem; background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 4px; color: var(--cyan-neon);">
            ${t}
          </span>
        `
          )
          .join('')}
      </div>
    `;

    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    AudioController.playClick();
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('active');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      AudioController.playClick();
    }
  }

  function escapeHtml(string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(string).replace(/[&<>"']/g, (s) => entityMap[s]);
  }

  // Attach modal trigger buttons
  document.querySelectorAll('[data-project]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-project');
      openProjectModal(pId);
    });
  });

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
      closeProjectModal();
    }
  });

  // --------------------------------------------------------------------------
  // 09. LIVE UTC CLOCK & TOAST NOTIFICATION
  // --------------------------------------------------------------------------
  const utcClockEl = document.getElementById('live-utc-clock');
  function updateClock() {
    if (utcClockEl) {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      utcClockEl.textContent = `${h}:${m}:${s} UTC`;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Dynamic Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Toast Function
  const toastContainer = document.getElementById('toast-container');
  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="color: var(--cyan-neon);">⚡</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3200);
  }
  window.showToast = showToast;

  // --------------------------------------------------------------------------
  // 10. SCROLL REVEAL OBSERVER
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-fade');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });
})();
