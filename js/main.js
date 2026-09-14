// ============================================
// Khalequzzaman Likhon — Portfolio JavaScript
// ============================================

// ----- Theme -----
// The initial theme is set by an inline script in <head> to avoid a flash.
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#f5f3ee');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// ----- Mobile menu -----
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.menu-btn');
  if (!menu) return;
  menu.hidden = !menu.hidden;
  if (btn) btn.setAttribute('aria-expanded', String(!menu.hidden));
}

// ----- Chip filters (news, projects, writing) -----
// <div data-filter-for="listId"> containing <button class="chip" data-filter="x">
// List children carry data-type="a b c".
function initFilters() {
  document.querySelectorAll('[data-filter-for]').forEach(bar => {
    const list = document.getElementById(bar.dataset.filterFor);
    if (!list) return;
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      bar.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      const f = chip.dataset.filter;
      list.querySelectorAll('[data-type]').forEach(item => {
        const types = item.dataset.type.split(' ');
        item.hidden = !(f === 'all' || types.includes(f));
      });
    });
  });
}

// ----- News sort -----
function initNewsSort() {
  const select = document.getElementById('newsSort');
  const list = document.getElementById('newsList');
  if (!select || !list) return;
  select.addEventListener('change', () => {
    const items = Array.from(list.children);
    items.sort((a, b) => {
      const d = new Date(b.dataset.date) - new Date(a.dataset.date);
      return select.value === 'newest' ? d : -d;
    });
    items.forEach(i => list.appendChild(i));
  });
}

// ----- Scroll reveal -----
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

// ----- Chat: "Ask Likhon" -----
// Replies are written in my own voice. Each topic has a short answer, an optional deeper
// follow-up ("tell me more"), and suggested next questions. Runs fully in the browser.
const EMAIL = 'khalequzzamanlikhon@gmail.com';

const topics = [
  {
    id: 'hello',
    keys: ['hi', 'hello', 'hey', 'salam', 'assalamu', 'good morning', 'good evening'],
    reply: () => `Hey! 👋 I'm Likhon. Happy to chat about my research, projects, or background. What are you curious about?`,
    next: ['What do you research?', 'Show me your projects', 'Are you looking for a PhD?']
  },
  {
    id: 'who',
    keys: ['who are you', 'about yourself', 'introduce yourself', 'your background', 'who is likhon', 'tell me about you'],
    reply: () => `I'm a machine learning engineer at Accelx Inc. in Dhaka. I build vision, video, and language systems for safety-critical use, and I spend a lot of my time on one question: do these models still work once they leave the benchmark?`,
    more: () => `Before Accelx, I did my B.Sc. in CSE at AUST, with a thesis on arrhythmia classification using 2-D CNNs. I also tutored high-school students for about five years and solved 100+ competitive programming problems along the way.`,
    next: ['What do you research?', 'Tell me about Accelx', 'Are you looking for a PhD?']
  },
  {
    id: 'research',
    keys: ['research', 'interest', 'focus', 'area', 'working on', 'study'],
    reply: () => `My interests are computer vision, real-time video understanding, large language models, generative AI, multimodal learning, and human-centered computing. What ties them together is reliability: how models behave under real-world shift, when they should abstain, and whether their outputs stay grounded in real evidence.`,
    more: () => `A few questions I keep coming back to: for fight detection, do pose dynamics beat appearance features? Can small local LLMs be trusted for high-stakes decisions? And when a detector hits 0.998 F1, has it learned the task or just a shortcut in the benchmark?`,
    next: ['Tell me about your papers', 'How do you keep LLMs grounded?', 'Video work?']
  },
  {
    id: 'phd',
    keys: ['phd', 'graduate', 'masters', 'grad school', 'admission', 'supervisor', 'professor', 'student'],
    reply: () => `Yes, I'm looking for PhD opportunities in multimodal learning and reliable video understanding. If you're recruiting or know a lab that would be a good fit, I'd really appreciate an email at ${EMAIL}.`,
    next: ['What do you research?', 'Tell me about your papers', 'Can I see your CV?']
  },
  {
    id: 'papers',
    keys: ['paper', 'publication', 'manuscript', 'publish', 'journal', 'under review', 'negative result'],
    reply: () => `I have three manuscripts right now. One is under review at Applied AI Letters (Wiley): a feature-tokenizer Transformer that predicts several concrete properties at once from partially labelled data. The other two are in preparation, and both are basically me poking holes in benchmark results.`,
    more: () => `In "Out-of-Focus Is Not Obliteration," I show that fingerprint alteration detectors scoring 0.998 macro-F1 on SOCOFing are learning editing traces, not alteration. In "Does Geometry Help?", adding geometry to post-earthquake damage classification did no better than a shuffled-geometry control. I think negative results like these are worth publishing.`,
    next: ['What do you research?', 'Are you looking for a PhD?']
  },
  {
    id: 'accelx',
    keys: ['accelx', 'job', 'work', 'company', 'experience', 'industry', 'engineer', 'weapon'],
    reply: () => `I've been at Accelx Inc. since January 2025, working on safety-critical perception and language systems: real-time weapon, violence, and fall detection on live multi-camera video at under 100 ms, plus a risk-assessment platform that writes grounded, cited alerts.`,
    more: () => `The part I enjoy most is the research that deployment forces on you. For example, I compared an R(2+1)D-18 network, a Transformer over YOLO11-Pose dynamics, and a pose–RGB cross-attention model on RWF-2000 to figure out what actually works for violence recognition.`,
    next: ['Video work?', 'How do you keep LLMs grounded?', 'What tools do you use?']
  },
  {
    id: 'video',
    keys: ['video', 'violence', 'fight', 'pose', 'rwf', 'surveillance', 'anomaly', 'action', 'sentinel'],
    reply: () => `Video is probably my favourite area. At work, I compared appearance-based and pose-based models for fight detection on RWF-2000. On my own, I built Sentinel, a multi-camera anomaly detector: YOLOv8 + BoT-SORT tracking feeds rules for falls, loitering, abandoned objects, and wrong-way motion, and an LSTM autoencoder catches what the rules miss.`,
    more: () => `One thing I learned: video-level labels are noisy when only a few seconds of a clip actually show the event. So I experimented with motion-aware clip mining, using optical flow plus pose heuristics, to pick out the parts that matter.`,
    next: ['Show me your projects', 'What do you research?']
  },
  {
    id: 'llm',
    keys: ['llm', 'language model', 'rag', 'retriev', 'ground', 'hallucinat', 'citation', 'docuroute', 'sentinelrag', 'agent', 'research2code', 'research→code'],
    reply: () => `My rule with LLMs is simple: the model shouldn't be trusted to know facts. In one pipeline, the LLM only writes prose from facts computed in Python, and a word-overlap test checks every citation. Wrong citations shared about 17% of their words with the source, and correct ones close to 100%, so the threshold was easy to set.`,
    more: () => `On the side, I built DocuRoute, which routes financial questions to hybrid retrieval or sandboxed text-to-SQL. Its evaluation surprised me: a general-domain reranker dropped faithfulness from 0.93 to 0.77. I also built Research→Code, where LangGraph agents write code, test it in a sandbox, and wait for a human to approve it.`,
    next: ['Show me your projects', 'Tell me about your papers']
  },
  {
    id: 'projects',
    keys: ['project', 'built', 'portfolio', 'github', 'repo', 'code'],
    reply: () => `Some favourites: Sentinel (video anomaly detection), DocuRoute (agentic retrieval over 10-K filings), Research→Code (multi-agent code synthesis), DepthCraft (measurable 3D from a single image), and voice-dub (dubbing in the speaker's own cloned voice). They're all on the Projects page, with code on GitHub.`,
    more: () => `Some less obvious ones: DocuVision parses document layouts and tables with classical CV, and my Phone Support Agent books appointments over real phone calls, handling interruptions and handing off to a human when it should.`,
    next: ['Video work?', 'How do you keep LLMs grounded?', 'Voice projects?']
  },
  {
    id: 'voice',
    keys: ['voice', 'speech', 'dub', 'audio', 'phone', 'whisper', 'tts', 'generative'],
    reply: () => `I've had a lot of fun with speech. voice-dub translates a video and dubs it in the original speaker's cloned voice, using pyannote diarization, Whisper, NLLB, and XTTS-v2, all time-aligned. The Phone Support Agent is a real-time voice bot that books appointments, handles barge-in, and escalates to a human.`,
    next: ['Show me your projects', 'What do you research?']
  },
  {
    id: 'depth',
    keys: ['depth', 'depthcraft', '3d', 'mesh'],
    reply: () => `DepthCraft takes a single image, estimates metric depth, and fuses it into a 3D mesh so you can actually measure distances. It also reports uncertainty, because a measurement without error bars isn't very useful.`,
    next: ['Show me your projects']
  },
  {
    id: 'skills',
    keys: ['skill', 'tool', 'stack', 'framework', 'tech', 'pytorch', 'language do you', 'programming'],
    reply: () => `Mostly PyTorch, plus TensorFlow/Keras, Hugging Face, Ultralytics, scikit-learn, OpenCV, and W&B. For shipping: Python, C/C++, SQL, FastAPI, Docker, TorchServe, Redis, Qdrant, and Linux. Method-wise, I work on detection, pose and tracking, video classification, transformer fine-tuning, RAG and agents, and evaluation design.`,
    next: ['Show me your projects', 'Tell me about Accelx']
  },
  {
    id: 'education',
    keys: ['educat', 'degree', 'university', 'aust', 'bsc', 'b.sc', 'thesis', 'undergrad', 'cgpa'],
    reply: () => `I studied Computer Science and Engineering at Ahsanullah University of Science and Technology (2016–2021). My thesis designed an arrhythmia classification algorithm using 2-D convolutional neural networks. That was my first taste of research.`,
    next: ['What do you research?', 'Are you looking for a PhD?']
  },
  {
    id: 'cv',
    keys: ['cv', 'resume', 'résumé'],
    reply: () => `Sure! There's a "CV" button at the top of every page, or you can open khalequzzamanlikhon_cv.pdf directly.`,
    next: ['Are you looking for a PhD?', 'How can I contact you?']
  },
  {
    id: 'personal',
    keys: ['hobby', 'hobbies', 'free time', 'outside work', 'fun', 'tutor', 'teach', 'olympiad', 'competitive'],
    reply: () => `Outside ML, I tutored secondary and higher-secondary students for about five years (2017–2022), which taught me a lot about explaining things simply. I've also solved 100+ competitive programming problems, and back in 2010 I placed third in a district astronomy olympiad.`,
    next: ['Who are you?', 'What do you research?']
  },
  {
    id: 'contact',
    keys: ['contact', 'email', 'reach', 'hire', 'collab', 'mail', 'linkedin', 'orcid', 'connect', 'talk'],
    reply: () => `Email is best: ${EMAIL}. I usually reply within a day or two. You can also find me on LinkedIn (khalequzzaman-likhon), GitHub (khalequzzamanlikhon), and ORCID (0009-0002-7048-0727).`,
    next: ['Are you looking for a PhD?', 'What do you research?']
  },
  {
    id: 'thanks',
    keys: ['thank', 'thanks', 'great', 'awesome', 'cool', 'nice'],
    reply: () => `Glad that helped! Anything else you'd like to know?`,
    next: ['Show me your projects', 'How can I contact you?']
  },
  {
    id: 'bye',
    keys: ['bye', 'goodbye', 'see you', 'later'],
    reply: () => `Thanks for stopping by! If you ever want to talk research, I'm at ${EMAIL}.`,
    next: []
  }
];

const moreKeys = ['more', 'tell me more', 'go on', 'details', 'elaborate', 'explain', 'and then', 'why'];
const defaultNext = ['What do you research?', 'Show me your projects', 'Are you looking for a PhD?', 'How can I contact you?'];

function scoreTopic(q, topic) {
  return topic.keys.reduce((s, k) => {
    const re = new RegExp('(^|[^a-z])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return s + (re.test(q) ? k.length : 0);
  }, 0);
}

function createAgent() {
  let lastTopic = null;
  let visitorName = null;

  return function respond(raw) {
    const q = raw.toLowerCase().trim();

    const nameMatch = raw.match(/(?:my name is|i am|i'm)\s+([A-Z][a-z]+)/);
    if (nameMatch && !/looking|interested|a |an /i.test(nameMatch[1])) {
      visitorName = nameMatch[1];
      return { text: `Nice to meet you, ${visitorName}! What would you like to know about my work?`, next: defaultNext };
    }

    const ranked = topics
      .map(t => ({ t, s: scoreTopic(q, t) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    const wantsMore = moreKeys.some(k => q === k || q.startsWith(k + ' ') || q.includes('tell me more'));
    if (wantsMore && !ranked.length) {
      if (lastTopic && lastTopic.more) {
        const t = lastTopic;
        lastTopic = { ...t, more: null };
        return { text: t.more(), next: t.next };
      }
      return {
        text: `That's pretty much the short version! My CV has the full details, and I'm always happy to go deeper over email at ${EMAIL}.`,
        next: lastTopic ? lastTopic.next : defaultNext
      };
    }

    if (!ranked.length) {
      return {
        text: `Hmm, that's not something I can answer well here. Send me a quick email at ${EMAIL} and I'll get back to you personally. In the meantime, you could ask about my research, projects, or papers.`,
        next: defaultNext
      };
    }

    const primary = ranked[0].t;
    let text = primary.reply();
    if (visitorName && primary.id === 'hello') text = text.replace('Hey!', `Hey ${visitorName}!`);

    // Two distinct topics in one question ("research and projects")
    const second = ranked[1] && ranked[1].t;
    if (second && /\band\b|&|,/.test(q) && !['hello', 'thanks', 'bye'].includes(second.id) && !['hello', 'thanks', 'bye'].includes(primary.id)) {
      text += '\n\n' + second.reply();
    }

    lastTopic = primary;
    const next = [...(primary.more ? ['Tell me more'] : []), ...primary.next].slice(0, 4);
    return { text, next };
  };
}

function mountChat() {
  const widget = document.createElement('div');
  widget.className = 'chat-widget';
  widget.innerHTML = `
    <div class="chat-panel" id="chatPanel" role="dialog" aria-label="Chat with Likhon" hidden>
      <div class="chat-header">
        <div class="chat-id">
          <img class="chat-avatar" src="assets/profile.jpg" alt="">
          <div>
            <h4>Chat with Likhon</h4>
            <p>Replies I've written ahead of time</p>
          </div>
        </div>
        <button class="chat-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="chat-messages" aria-live="polite"></div>
      <div class="quick"></div>
      <form class="chat-form">
        <input type="text" aria-label="Type your message" placeholder="Ask me anything…" autocomplete="off">
        <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
      </form>
    </div>
    <button class="chat-toggle" type="button" aria-label="Chat with Likhon" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
    </button>`;
  document.body.appendChild(widget);

  // Pages in subfolders (e.g. 404) still resolve the avatar.
  const avatar = widget.querySelector('.chat-avatar');
  avatar.addEventListener('error', () => { avatar.src = '/assets/profile.jpg'; }, { once: true });

  const panel = widget.querySelector('.chat-panel');
  const toggle = widget.querySelector('.chat-toggle');
  const messages = widget.querySelector('.chat-messages');
  const quick = widget.querySelector('.quick');
  const form = widget.querySelector('.chat-form');
  const input = form.querySelector('input');
  const respond = createAgent();
  let busy = false;
  let greeted = false;

  const scroll = () => { messages.scrollTop = messages.scrollHeight; };

  const add = (text, who) => {
    const el = document.createElement('div');
    el.className = 'msg ' + who;
    el.textContent = text;
    messages.appendChild(el);
    scroll();
    return el;
  };

  const setSuggestions = list => {
    quick.innerHTML = '';
    list.forEach(label => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => ask(label));
      quick.appendChild(b);
    });
  };

  const botSay = (text, next) => {
    busy = true;
    setSuggestions([]);
    const typing = document.createElement('div');
    typing.className = 'msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    scroll();
    const delay = Math.min(1600, 450 + text.length * 4);
    setTimeout(() => {
      typing.remove();
      add(text, 'bot');
      setSuggestions(next || []);
      busy = false;
    }, delay);
  };

  function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    add(q, 'user');
    const { text, next } = respond(q);
    botSay(text, next);
  }

  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus();
      if (!greeted) {
        greeted = true;
        botSay(`Hi, I'm Likhon 👋 Ask me about my research, projects, papers, or whether I'm looking for a PhD. I'll answer the way I would in person.`, defaultNext);
      }
    }
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  widget.querySelector('.chat-close').addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });

  document.addEventListener('mousedown', e => {
    if (!panel.hidden && !widget.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
  });
}

// ----- Init -----
document.addEventListener('DOMContentLoaded', () => {
  setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  document.querySelectorAll('.theme-toggle').forEach(b => b.addEventListener('click', toggleTheme));
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  initFilters();
  initNewsSort();
  initReveal();
  mountChat();
});
