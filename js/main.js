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

// ----- List filters (projects, publications, writing, news) -----
// Topic chips: <div data-filter-for="listId"> containing <button class="chip" data-filter="x">
// Dropdowns:   <select data-filter-list="listId">
// Search:      <input data-search-for="listId">, plus an optional <p data-empty-for="listId">
// Items carry data-type="a b c" (or are .pub entries). Groups (.project-group,
// [data-search-group]) hide when none of their items are showing.
const ITEM_SEL = '[data-type], .pub';

function applyListFilter(list) {
  const f = list.dataset.filter || 'all';
  const query = list.dataset.query || '';
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const items = [...list.querySelectorAll(ITEM_SEL)].filter(el => !el.querySelector(ITEM_SEL));
  let shown = 0;
  items.forEach(item => {
    const types = (item.dataset.type || '').split(' ');
    const text = item.textContent.toLowerCase();
    item.hidden = !((f === 'all' || types.includes(f)) && terms.every(t => text.includes(t)));
    if (!item.hidden) shown++;
  });
  list.querySelectorAll('.project-group, [data-search-group]').forEach(group => {
    group.hidden = !items.some(item => !item.hidden && group.contains(item));
  });
  const empty = document.querySelector(`[data-empty-for="${list.id}"]`);
  if (empty) {
    empty.hidden = shown > 0 || !terms.length;
    const term = empty.querySelector('.search-term');
    if (term) term.textContent = query;
  }
}

function initFilters() {
  document.querySelectorAll('[data-filter-for]').forEach(bar => {
    const list = document.getElementById(bar.dataset.filterFor);
    if (!list) return;
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      bar.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      list.dataset.filter = chip.dataset.filter;
      applyListFilter(list);
    });
  });

  document.querySelectorAll('select[data-filter-list]').forEach(select => {
    const list = document.getElementById(select.dataset.filterList);
    if (!list) return;
    select.addEventListener('change', () => {
      list.dataset.filter = select.value;
      applyListFilter(list);
    });
  });

  document.querySelectorAll('input[data-search-for]').forEach(input => {
    const list = document.getElementById(input.dataset.searchFor);
    if (!list) return;
    const update = () => {
      list.dataset.query = input.value.trim();
      applyListFilter(list);
    };
    input.addEventListener('input', update);
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.value = ''; update(); }
    });
    const clear = document.querySelector(`[data-empty-for="${list.id}"] .search-clear`);
    if (clear) clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
    if (input.value) update(); // the browser may restore a typed query on back/forward
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

// =====================================================================
// Chat assistant — answers in my own voice.
// Runs entirely in the browser: intent scoring with typo tolerance,
// entity recognition (projects & papers), follow-ups ("link?", "tell me
// more", "what did you use?"), yes/no replies, and session memory.
// =====================================================================

const EMAIL = 'khalequzzamanlikhon@gmail.com';
const LINKS = {
  github: 'https://github.com/khalequzzamanlikhon',
  linkedin: 'https://linkedin.com/in/khalequzzaman-likhon',
  orcid: 'https://orcid.org/0009-0002-7048-0727'
};
const gh = repo => `${LINKS.github}/${repo}`;

// ---- Knowledge: projects & papers ----
const entities = [
  {
    id: 'sentinel', kind: 'project', name: 'Sentinel',
    aliases: ['sentinel', 'video anomaly', 'anomaly detection', 'video-anomaly', 'loitering', 'abandoned object'],
    summary: `Sentinel is my multi-camera, real-time video anomaly detector. YOLOv8 + BoT-SORT handle detection and tracking, and that feeds a rule engine for falls, loitering, abandoned objects, crowd density, and wrong-way motion.`,
    detail: `Alerts are deduplicated and stored in SQLite, with Prometheus metrics and a Streamlit dashboard. On an RTX A5000 the full pipeline runs at 19.7 FPS, and a soak test ran 3,268 steps with zero exceptions.`,
    tech: ['YOLOv8', 'BoT-SORT tracking', 'OpenCV', 'Prometheus', 'Streamlit'],
    link: gh('sentinel-video-anomaly-detection')
  },
  {
    id: 'overcooked', kind: 'project', name: 'Overcooked AAR',
    aliases: ['overcooked', 'overcooked aar', 'overcooked_aar', 'aar', 'after-action', 'after action', 'telemetry', 'gameplay'],
    summary: `Overcooked AAR asks what a model misses when it reads logs instead of watching. The same model (Qwen2.5-VL) writes an after-action review of real two-player Overcooked play twice — once from the event log, once from the gameplay video — and every claim it makes is checked against the log.`,
    detail: `Across 15 episodes and 1,140 claims, claims from the log held up 81% of the time and claims from the video 53%. The gap is timing rather than invention: 98% of the video model's timestamps landed on a 5-second grid, against 1% for the log, so it was pacing claims evenly instead of reading the clock on screen. It also under-counted deliveries in 41 of 45 minutes. A blind pairwise human rating is built but not yet run.`,
    tech: ['Qwen2.5-VL', 'the overcooked-ai StateVisualizer', 'claim-level verification against the log', 'blind pairwise rating'],
    link: gh('overcooked_AAR')
  },
  {
    id: 'depthcraft', kind: 'project', name: 'DepthCraft',
    aliases: ['depthcraft', 'depth craft', 'depth_craft', 'depth', '3d', 'point cloud', 'measure'],
    summary: `DepthCraft turns a single image into measurable 3D. Depth Anything V2 estimates metric depth, which is lifted into a cleaned point cloud so you can measure real distances.`,
    detail: `Every measurement comes with an uncertainty estimate (like 18.63 ± 0.29 m), because a distance without error bars isn't very trustworthy. It has a FastAPI backend and a React/Three.js viewer, and runs at about 330 ms per image.`,
    tech: ['Depth Anything V2', 'Open3D', 'FastAPI', 'React/Three.js'],
    link: gh('depthcraft-monocular-3d')
  },
  {
    id: 'docuroute', kind: 'project', name: 'DocuRoute',
    aliases: ['docuroute', 'docu route', 'financial', '10-k', '10k', 'sec filing', 'text-to-sql', 'text to sql'],
    summary: `DocuRoute is agentic retrieval for financial documents. An LLM router, grounded in the table schemas extracted from SEC 10-K filings, sends each question to either hybrid sparse–dense retrieval or sandboxed text-to-SQL, and answers carry citations.`,
    detail: `I implemented the evaluation metrics myself (context precision and recall, faithfulness, relevancy) and used them to choose the retrieval setup. The surprise was that a general-domain cross-encoder reranker lowered faithfulness from 0.93 to 0.77, so reranking seems sensitive to domain shift.`,
    tech: ['an LLM query router', 'hybrid sparse–dense retrieval', 'sandboxed text-to-SQL', 'a custom evaluation harness'],
    link: gh('DocuRoute')
  },
  {
    id: 'research2code', kind: 'project', name: 'Research→Code',
    aliases: ['research2code', 'research to code', 'research→code', 'research-to-code', 'researchcode', 'multi-agent', 'multi agent', 'program synthesis', 'coding agent'],
    summary: `Research→Code is a multi-agent program synthesis system: researcher, coder, and reviewer agents built with LangGraph, with tools served over MCP.`,
    detail: `Generated code is tested in a sandbox, deterministic routing caps the number of retries, and a human approves the result before anything is written.`,
    tech: ['LangGraph', 'MCP (Model Context Protocol)', 'sandboxed code execution', 'human-in-the-loop approval'],
    link: gh('research2code')
  },
  {
    id: 'sentinelrag', kind: 'project', name: 'SentinelRAG',
    aliases: ['sentinelrag', 'sentinel rag', 'sentinel-rag', 'self-correcting rag', 'self correcting rag', 'hallucination audit'],
    summary: `SentinelRAG is a self-correcting agentic RAG pipeline built with LangGraph. It grades its own retrievals, rewrites queries that fail, and audits answers for hallucinations before citing sources.`,
    detail: `Input guardrails catch prompt injection first. Retrieval is hybrid (Qdrant dense + BM25), a web-search fallback kicks in when local documents aren't enough, and a BGE cross-encoder reranks what survives grading.`,
    tech: ['LangGraph', 'Qdrant + BM25 hybrid search', 'a BGE cross-encoder reranker', 'Llama 3.3 on Groq'],
    link: gh('SentinelRAG')
  },
  {
    id: 'voicedub', kind: 'project', name: 'voice-dub',
    aliases: ['voice-dub', 'voice dub', 'voicedub', 'voice_dub', 'dubbing', 'dub', 'voice cloning', 'voice clone'],
    summary: `voice-dub dubs a video into another language in the original speaker's cloned voice, time-aligned to the video.`,
    detail: `The pipeline runs speaker diarization with pyannote, transcribes with Whisper, translates with NLLB, and clones each voice with XTTS-v2.`,
    tech: ['pyannote', 'Whisper', 'NLLB', 'XTTS-v2'],
    link: gh('voice-dub-ai-dubbing')
  },
  {
    id: 'phoneagent', kind: 'project', name: 'Phone Support Agent',
    aliases: ['phone support', 'phone agent', 'phone-support-agent', 'phone-support-voice-agent', 'support agent', 'appointment', 'voice agent', 'phone call'],
    summary: `Phone Support Agent is a real-time voice AI that books, reschedules, and cancels appointments over phone calls.`,
    detail: `Twilio streams call audio to Deepgram speech-to-text, an LLM drives a state-machine dialogue through tool calls, and ElevenLabs speaks back. Appointments are only confirmed after the backend succeeds, callers can interrupt (barge-in), and hard cases escalate to a human.`,
    tech: ['Twilio', 'Deepgram streaming STT', 'LLM tool calling', 'ElevenLabs TTS', 'FastAPI'],
    link: gh('phone-support-voice-agent')
  },
  {
    id: 'pneumonia', kind: 'project', name: 'Pneumonia detection',
    aliases: ['pneumonia', 'chest x-ray', 'chest xray', 'x-ray', 'xray', 'cxr', 'medical imaging'],
    summary: `An early vision project: pneumonia detection from chest X-rays using an attention-weighted ensemble of DenseNet121 and EfficientNet. It reached 95% accuracy.`,
    tech: ['DenseNet121', 'EfficientNet', 'attention-weighted ensembling'],
    link: gh('Pneumonia-Detection-CXR')
  },
  {
    id: 'camvid', kind: 'project', name: 'CamVid segmentation',
    aliases: ['camvid', 'segmentation', 'u-net', 'unet', 'deeplab'],
    summary: `On CamVid, I compared FCN, attention U-Net, and DeepLabV3+ for semantic segmentation.`,
    tech: ['FCN', 'attention U-Net', 'DeepLabV3+']
  },
  {
    id: 'voc', kind: 'project', name: 'PASCAL VOC detection',
    aliases: ['pascal', 'voc', 'faster r-cnn', 'faster rcnn', 'object detection'],
    summary: `Object detection on PASCAL VOC 2012 with Faster R-CNN, one of my earlier vision projects.`,
    tech: ['Faster R-CNN']
  },
  {
    id: 'fingerprint', kind: 'paper', name: 'Out-of-Focus Is Not Obliteration',
    aliases: ['fingerprint', 'socofing', 'out-of-focus', 'out of focus', 'obliteration', 'alteration'],
    summary: `That's "Out-of-Focus Is Not Obliteration: A Perturbation Analysis of Fingerprint Alteration Detectors on Synthetic Benchmarks," co-first-authored with M. M. Sarker. Detectors reach 0.998 macro-F1 on SOCOFing, but they learn editing traces, not alteration.`,
    detail: `It's a perturbation analysis: instead of trusting the benchmark score, it tests what the detectors actually respond to. I'd also done fingerprint forgery detection on SOCOFing as an earlier vision project.`,
    status: `It's a manuscript in preparation (2026).`,
    tech: ['perturbation analysis', 'the synthetic SOCOFing benchmark']
  },
  {
    id: 'uhpc', kind: 'paper', name: 'the UHPC paper',
    aliases: ['uhpc', 'concrete', 'feature-tokenizer', 'feature tokenizer', 'ft-transformer', 'applied ai letters', 'multi-task', 'multitask'],
    summary: `That's "Joint Prediction of Ultra-High-Performance Concrete Properties Using a Feature-Tokenizer Transformer with Masked Multi-Task Learning." R. Tanvir and I are equal-contribution authors. It predicts several concrete properties jointly, and masked multi-task learning lets it train on samples that are only partially labeled.`,
    status: `It was submitted to Applied AI Letters (Wiley) in 2026 and is currently under review.`,
    tech: ['a Feature-Tokenizer Transformer', 'masked multi-task learning']
  },
  {
    id: 'geometry', kind: 'paper', name: 'Does Geometry Help?',
    aliases: ['geometry', 'earthquake', 'damage', 'peer hub', 'taxonomy'],
    summary: `"Does Geometry Help?" is a leakage-audited, negative-result study on post-earthquake damage-type classification, co-first-authored with M. M. Sarker. Cross-attention geometry fusion performed no better than a shuffled-geometry control on PEER Hub ImageNet.`,
    status: `It's a manuscript in preparation (2026).`,
    tech: ['cross-attention fusion', 'a taxonomy-consistency loss', 'leakage auditing']
  },
  {
    id: 'thesis', kind: 'paper', name: 'my thesis',
    aliases: ['thesis', 'arrhythmia', 'ecg'],
    summary: `My B.Sc. thesis at AUST was "Design of an Arrhythmia Classification Algorithm Using 2-D Convolutional Neural Networks."`,
    status: `It was my undergraduate thesis, completed in 2021.`,
    tech: ['2-D convolutional neural networks']
  }
];

// ---- Knowledge: general topics ----
const topics = [
  { id: 'hello', social: "Hi!",
    keys: ['hi', 'hello', 'hey', 'hiya', 'salam', 'assalamu alaikum', 'good morning', 'good afternoon', 'good evening', 'greetings'],
    reply: [`Hey! 👋 What would you like to know: my research, projects, or something else?`,
            `Hi there! Ask me anything about my work. Research, projects, and papers are good places to start.`],
    next: ['What do you research?', 'Show me your projects', 'Tell me about your papers'] },

  { id: 'howareyou', social: "I'm doing well, thanks!",
    keys: ['how are you', 'how r u', 'how is it going', "how's it going", 'whats up', "what's up", 'how do you do'],
    reply: `I'm doing well, thanks for asking! Busy with papers and projects, as usual. What can I tell you about?`,
    next: ['What are you working on?', 'Show me your projects'] },

  { id: 'bot',
    keys: ['are you a bot', 'are you real', 'are you human', 'are you ai', 'is this ai', 'chatgpt', 'real person', 'automated', 'who made this', 'is this really you', 'am i talking to'],
    reply: `Fair question! This is a small automated assistant that answers with replies I wrote myself. It runs entirely in your browser, so it can't look things up or remember you after you leave. For a real conversation, email me at ${EMAIL} and I'll reply personally.`,
    next: ['How can I contact you?', 'What do you research?'] },

  { id: 'help',
    keys: ['help', 'what can you', 'what can i ask', 'what should i ask', 'options', 'menu'],
    reply: `You can ask me about my research interests, any of my projects (Sentinel, DocuRoute, DepthCraft…), my papers, my work at Accelx, my skills, my education, or how to get in touch. Follow-ups work too, like "what did you use to build it?" or "link?"`,
    next: ['What do you research?', 'Show me your projects', 'Tell me about your papers'] },

  { id: 'who',
    keys: ['who are you', 'about yourself', 'introduce yourself', 'your background', 'who is likhon', 'tell me about you', 'who is khalequzzaman', 'about likhon'],
    reply: `I'm Khalequzzaman Likhon, a machine learning engineer at Accelx Inc. in Dhaka, Bangladesh. I build vision, video, and language systems for safety-critical use, and I care a lot about whether models still work outside the benchmark.`,
    more: `Before Accelx, I did my B.Sc. in Computer Science and Engineering at AUST (2016–2021), with a thesis on arrhythmia classification using 2-D CNNs. These days I split my time between building systems and writing papers that test what models have really learned.`,
    next: ['Tell me more', 'What do you research?', 'Tell me about Accelx'] },

  { id: 'research',
    keys: ['research', 'interest', 'interests', 'focus', 'area', 'areas', 'working on', 'field', 'topics'],
    reply: `Three things, really: understanding human behaviour from video, Video LLMs, and getting models to give grounded explanations a person can check. The thread through all of it is whether a model still behaves once it leaves the benchmark.`,
    more: `Concretely, I've compared pose-based and appearance-based models for violence recognition, built LLM pipelines where every citation is checked, and written negative-result studies that test models for shortcuts.`,
    next: ['Tell me more', 'Tell me about your papers', 'Are you open to collaboration?'] },

  { id: 'collab',
    keys: ['collaborat', 'work together', 'work with you', 'open to', 'opportunit', 'phd', 'graduate', 'masters', 'grad school', 'supervisor', 'professor', 'hire', 'hiring', 'recruit', 'available'],
    reply: `Yes, I'm open to research collaborations, especially in computer vision, video understanding, and reliable LLM systems. If you have something in mind, email me at ${EMAIL} with a short note about the project and I'll get back to you.`,
    next: ['What do you research?', 'Can I see your CV?'] },

  { id: 'papers',
    keys: ['paper', 'papers', 'publication', 'publications', 'manuscript', 'manuscripts', 'publish', 'journal', 'negative result', 'preprint', 'article'],
    reply: `I have three manuscripts. One is under review at Applied AI Letters (Wiley): a Feature-Tokenizer Transformer that predicts several concrete properties jointly. The other two are in preparation, one on fingerprint alteration detectors and one on post-earthquake damage classification.`,
    more: `The two in preparation both ask what models really learn. Fingerprint detectors that hit 0.998 macro-F1 turn out to learn editing traces, and adding geometry to earthquake damage classification does no better than a shuffled control. Ask me about any of them by name!`,
    next: ['The concrete paper?', 'The fingerprint paper?', 'The earthquake paper?'] },

  { id: 'accelx',
    keys: ['accelx', 'job', 'work', 'company', 'experience', 'industry', 'employer', 'current role', 'day job', 'weapon', 'violence', 'fall detection', 'surveillance', 'safety'],
    reply: `I've been a machine learning engineer at Accelx Inc. since January 2025, working on safety-critical perception and language systems. That includes real-time weapon, violence, and fall detection on live multi-camera video at under 100 ms latency, plus a risk-assessment platform that writes grounded, cited alerts.`,
    more: `The research side is my favourite part. On RWF-2000, I compared a Kinetics-pretrained R(2+1)D-18, a Transformer over YOLO11-Pose dynamics, and a pose–RGB cross-attention model. On the LLM side, the model only writes from facts computed in Python, and a word-overlap test checks every citation. Wrong citations shared about 17% of their words with the source; correct ones shared close to 100%.`,
    next: ['Tell me more', 'How do you keep LLMs grounded?', 'What tools do you use?'] },

  { id: 'video',
    keys: ['video', 'action recognition', 'pose', 'rwf', 'rwf-2000', 'optical flow', 'spatiotemporal'],
    reply: `Video understanding is probably my favourite area. I compared appearance-based and pose-based models for fight detection on RWF-2000: R(2+1)D-18, a Transformer over YOLO11-Pose dynamics, and a two-stream cross-attention model. On my own, I built Sentinel, a multi-camera anomaly detector.`,
    more: `Video-level labels are noisy when only part of a clip shows the event, so I also investigated motion-aware clip mining, using dense optical flow plus pose heuristics, to reduce that label noise.`,
    next: ['Tell me more', 'Sentinel?'] },

  { id: 'llm',
    keys: ['llm', 'llms', 'language model', 'language models', 'rag', 'retrieval', 'grounding', 'grounded', 'hallucinat', 'citation', 'citations', 'agent', 'agents', 'small model'],
    reply: `My rule with LLMs: don't trust the model to know facts. In one pipeline, the LLM only writes prose from facts computed deterministically in Python, and a word-overlap test checks every citation. On the project side, there's DocuRoute (agentic retrieval over 10-K filings), SentinelRAG (self-correcting RAG), and Research→Code (multi-agent code synthesis).`,
    more: `One result I like: in DocuRoute, a general-domain reranker lowered faithfulness from 0.93 to 0.77 on financial filings. Even "safe" components can break under domain shift.`,
    next: ['Tell me more', 'DocuRoute?', 'Research→Code?'] },

  { id: 'projects',
    keys: ['project', 'projects', 'built', 'portfolio', 'what have you made', 'side project', 'showcase', 'what have you built'],
    reply: `Eight, roughly in the order I care about them: Overcooked AAR (do a model's claims about a team hold up?), Sentinel (real-time video anomaly detection), DepthCraft (measurable 3D from one photo), DocuRoute (agentic retrieval over 10-K filings), SentinelRAG (self-correcting RAG), Research→Code (multi-agent code synthesis), voice-dub (speaker-cloned dubbing) and the Phone Support Agent. Ask about any of them by name!`,
    next: ['Sentinel?', 'Overcooked AAR?', 'DocuRoute?', 'DepthCraft?'] },

  { id: 'speech',
    keys: ['voice', 'speech', 'audio', 'whisper', 'tts', 'text-to-speech'],
    reply: `I've built a few speech projects: voice-dub (translated dubbing in the original speaker's cloned voice), and a Phone Support Agent that books appointments over real calls.`,
    next: ['voice-dub?', 'Phone Support Agent?'] },

  { id: 'generative',
    keys: ['generative', 'genai', 'gen ai'],
    reply: `On the generative side, I care about keeping outputs faithful to their source. Research→Code tests generated code in a sandbox before a human approves it, and voice-dub keeps a dubbed voice true to the original speaker.`,
    next: ['Research→Code?', 'voice-dub?'] },

  { id: 'skills',
    keys: ['skill', 'skills', 'stack', 'tools', 'framework', 'frameworks', 'tech stack', 'technologies', 'pytorch', 'tensorflow', 'programming language', 'coding language'],
    reply: `Mostly PyTorch, plus TensorFlow/Keras, Hugging Face, Ultralytics, scikit-learn, OpenCV, and W&B. For engineering: Python, C/C++, SQL, and Bash, with FastAPI, Docker, TorchServe, Redis, Qdrant, Git, and Linux. Methods-wise, I work on detection, pose estimation and tracking, video classification, vision-language models, transformer fine-tuning, RAG and agents, and evaluation design.`,
    next: ['Show me your projects', 'Tell me about Accelx'] },

  { id: 'education',
    keys: ['education', 'educat', 'degree', 'university', 'aust', 'ahsanullah', 'bsc', 'b.sc', 'undergrad', 'bachelor', 'studied', 'college'],
    reply: `I did my B.Sc. in Computer Science and Engineering at Ahsanullah University of Science and Technology in Dhaka (2016–2021). My thesis designed an arrhythmia classification algorithm using 2-D convolutional neural networks.`,
    next: ['What do you research?', 'Tell me about your papers'] },

  { id: 'gpa',
    keys: ['cgpa', 'gpa', 'grades'],
    reply: `My CGPA was 2.74 out of 4.00. It's listed on my CV as well.`,
    next: ['What do you research?', 'Tell me about your papers'] },

  { id: 'cv',
    keys: ['cv', 'resume', 'résumé', 'curriculum vitae'],
    reply: `Sure! Here's my CV: khalequzzamanlikhon_cv.pdf. There's also a CV button at the top of every page.`,
    next: ['Are you open to collaboration?', 'How can I contact you?'] },

  { id: 'location',
    keys: ['where are you', 'where do you live', 'location', 'located', 'which country', 'bangladesh', 'dhaka', 'time zone', 'timezone'],
    reply: `I'm based in Dhaka, Bangladesh.`,
    next: ['How can I contact you?', 'Tell me about Accelx'] },

  { id: 'languages',
    keys: ['speak', 'spoken', 'bengali', 'bangla', 'english'],
    reply: `I speak Bengali natively and English at full professional proficiency.`,
    next: ['What do you research?'] },

  { id: 'awards',
    keys: ['award', 'awards', 'honor', 'honors', 'honour', 'scholarship', 'olympiad', 'achievement', 'achievements'],
    reply: `A few from my school days: Education Board Scholarships for my SSC (2012) and JSC (2009), and 3rd place in a district astro olympiad in 2010.`,
    next: ['Tell me about your papers', 'Education?'] },

  { id: 'certs',
    keys: ['certificat', 'coursera', 'course', 'courses', 'mooc'],
    reply: `I've completed Machine Learning (2023) and Neural Networks and Deep Learning (2021) on Coursera.`,
    next: ['What tools do you use?'] },

  { id: 'hobbies',
    keys: ['hobby', 'hobbies', 'free time', 'outside work', 'for fun', 'spare time', 'competitive programming', 'codeforces'],
    reply: `Outside ML, I've solved 100+ competitive programming problems on Beecrowd, Codeforces, and CodeChef. And back in school, I placed third in a district astro olympiad (2010).`,
    next: ['What do you research?', 'Show me your projects'] },

  { id: 'news',
    keys: ['news', 'latest', 'recent', 'update', 'updates', 'lately', 'currently'],
    reply: `Most recently, my paper on predicting ultra-high-performance concrete properties went to Applied AI Letters, and it's under review. I'm also writing two more manuscripts.`,
    next: ['Tell me about your papers', 'What do you research?'] },

  { id: 'contact',
    keys: ['contact', 'email', 'e-mail', 'reach', 'mail', 'linkedin', 'orcid', 'connect', 'get in touch', 'talk to you', 'message you', 'github profile'],
    reply: `Email is best: ${EMAIL}. You can also find me on LinkedIn (${LINKS.linkedin}), GitHub (${LINKS.github}), and ORCID (${LINKS.orcid}).`,
    next: ['Are you open to collaboration?', 'Can I see your CV?'] },

  { id: 'private',
    keys: ['age', 'how old', 'married', 'salary', 'religion', 'girlfriend', 'wife'],
    reply: `I'd rather keep this chat about my work 🙂 Happy to talk research, projects, or papers.`,
    next: ['What do you research?', 'Show me your projects'] },

  { id: 'thanks', social: 'Thanks!',
    keys: ['thank', 'thanks', 'thx', 'ty', 'appreciate', 'great', 'awesome', 'cool', 'nice', 'perfect', 'helpful'],
    reply: [`Glad that helped! Anything else?`, `Happy to help. Anything else you're curious about?`],
    next: ['Show me your projects', 'How can I contact you?'] },

  { id: 'bye',
    keys: ['bye', 'goodbye', 'see you', 'see ya', 'cya', 'take care', 'good night'],
    reply: `Thanks for stopping by! If you want to talk research, I'm at ${EMAIL}. 👋`,
    next: [] }
];

const attributes = [
  { id: 'link', keys: ['link', 'github', 'repo', 'repository', 'source code', 'code', 'url', 'where can i see', 'where can i find', 'open source'] },
  { id: 'tech', keys: ['tech', 'stack', 'built with', 'build it', 'tools', 'framework', 'library', 'libraries', 'what did you use', 'use', 'used', 'methods', 'method', 'models'] },
  { id: 'status', keys: ['status', 'published', 'accepted', 'under review', 'submitted', 'venue', 'where is it'] },
  { id: 'detail', keys: ['how does', 'how did', 'how it works', 'works', 'explain', 'detail', 'details', 'more', 'elaborate', 'deeper', 'why'] }
];

const DEFAULT_NEXT = ['What do you research?', 'Show me your projects', 'Tell me about your papers', 'How can I contact you?'];
const SOCIAL = ['hello', 'howareyou', 'thanks'];

// ---- Text utilities ----
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = s => s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9+→.'\-\s]/g, ' ').replace(/\s+/g, ' ').trim();
const pick = r => Array.isArray(r) ? r[Math.floor(Math.random() * r.length)] : r;
const joinList = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];

function hasKey(text, key) {
  const k = escRe(key);
  // Short single words must match as whole words (optionally plural); longer keys may be prefixes.
  const re = key.length <= 4 && !key.includes(' ')
    ? new RegExp(`(^|[^a-z0-9])${k}s?($|[^a-z0-9])`)
    : new RegExp(`(^|[^a-z0-9])${k}`);
  return re.test(text);
}

function levenshtein(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const STOP = new Set(['what', 'your', 'about', 'with', 'have', 'that', 'this', 'there', 'their', 'where', 'when', 'which', 'would', 'could', 'should', 'from', 'they', 'them', 'then', 'than', 'does', 'doing', 'done', 'tell', 'like', 'know', 'want', 'give', 'show', 'some', 'other', 'much', 'many', 'very', 'just', 'also', 'been', 'were', 'will', 'into', 'only', 'over', 'such', 'here', 'please', 'make', 'made', 'more', 'good', 'well', 'really', 'thing', 'things', 'about', 'these', 'those', 'being']);

const VOCAB = (() => {
  const words = new Set();
  const add = phrase => phrase.split(/[\s\-_]+/).forEach(w => { if (/^[a-z]{4,}$/.test(w)) words.add(w); });
  topics.forEach(t => t.keys.forEach(add));
  entities.forEach(e => e.aliases.forEach(add));
  attributes.forEach(a => a.keys.forEach(add));
  return [...words];
})();

function correctTypos(text) {
  return text.split(' ').map(tok => {
    if (tok.length < 4 || !/^[a-z]+$/.test(tok) || STOP.has(tok) || VOCAB.includes(tok)) return tok;
    const max = tok.length >= 7 ? 2 : 1;
    let best = null, bestD = max + 1;
    for (const w of VOCAB) {
      if (w[0] !== tok[0]) continue;
      const d = levenshtein(tok, w, max);
      if (d < bestD) { best = w; bestD = d; }
    }
    return best || tok;
  }).join(' ');
}

// ---- Agent ----
function createAgent() {
  const state = { entity: null, topic: null, moreUsed: false, pending: null, name: null };

  const findEntity = text => {
    let best = null;
    for (const e of entities) {
      for (const a of e.aliases) {
        if (hasKey(text, a) && (!best || a.length > best.alias.length)) best = { e, alias: a };
      }
    }
    if (!best) return null;
    return { e: best.e, rest: text.replace(new RegExp(escRe(best.alias), 'g'), ' ') };
  };

  const findAttr = text => {
    let best = null, bestLen = 0;
    for (const a of attributes) {
      for (const k of a.keys) if (hasKey(text, k) && k.length > bestLen) { best = a.id; bestLen = k.length; }
    }
    return best;
  };

  const rankTopics = text => topics
    .map(t => ({ t, s: t.keys.reduce((sum, k) => sum + (hasKey(text, k) ? k.length : 0), 0) }))
    .filter(x => x.s >= 2)
    .sort((a, b) => b.s - a.s);

  const entityNext = e => [
    ...(e.detail ? ['Tell me more'] : []),
    ...(e.kind === 'paper' ? (e.status ? ["What's its status?"] : []) : (e.tech ? ['What did you use to build it?'] : [])),
    ...(e.link ? ['Link?'] : []),
    e.kind === 'paper' ? 'Other papers?' : 'Other projects?'
  ].slice(0, 4);

  function answerEntity(e, attr) {
    state.entity = e; state.topic = null;
    const next = entityNext(e);
    switch (attr) {
      case 'link':
        return e.link
          ? { text: `Here's the code for ${e.name}: ${e.link}`, next: next.filter(n => n !== 'Link?') }
          : { text: e.kind === 'paper'
                ? `${e.name} isn't public yet. ${e.status || ''} Happy to share more over email: ${EMAIL}.`
                : `${e.name} doesn't have a public repo, but I'm happy to talk about it. Email me at ${EMAIL}.`, next };
      case 'tech':
        return e.tech
          ? { text: `For ${e.name}, I used ${joinList(e.tech)}.`, next: next.filter(n => n !== 'What did you use to build it?') }
          : { text: `I haven't written up the details for ${e.name} here yet. The repo is the best place to look: ${e.link}`, next };
      case 'status':
        return { text: e.status || `${e.name} is a project rather than a paper${e.link ? `, and it's open source on GitHub: ${e.link}` : '.'}`, next: next.filter(n => n !== "What's its status?") };
      case 'detail':
        if (e.detail) return { text: e.detail, next: next.filter(n => n !== 'Tell me more') };
        return { text: `That's the main idea! ${e.link ? `The repo has the full details: ${e.link}` : `Happy to go deeper over email: ${EMAIL}.`}`, next };
      default: {
        let text = e.summary;
        if (e.kind === 'paper' && e.status) text += ' ' + e.status;
        if (e.link) {
          text += ' Want the GitHub link?';
          state.pending = () => answerEntity(e, 'link');
        }
        return { text, next };
      }
    }
  }

  function answerTopic(t) {
    state.topic = t; state.entity = null; state.moreUsed = false;
    const next = t.more ? t.next : t.next.filter(n => n !== 'Tell me more');
    return { text: pick(t.reply), next };
  }

  return function respond(raw) {
    const original = raw.slice(0, 400);
    let text = correctTypos(normalize(original));
    if (!text) return { text: `Could you type that again? I didn't catch anything.`, next: DEFAULT_NEXT };

    // Yes / no to a question I just asked
    if (state.pending) {
      const pending = state.pending;
      state.pending = null;
      if (/^(y|yes|yeah|yep|yup|sure|ok|okay|please|yes please|go ahead|of course|definitely)\b/.test(text)) return pending();
      if (/^(no|nope|nah|not now|no thanks|maybe later)\b/.test(text)) return { text: `No problem! Anything else you'd like to know?`, next: DEFAULT_NEXT };
    }

    // Visitor introduces themselves
    let greetName = null;
    const nameMatch = original.match(/\b(?:my name is|i am|i'm|im|this is)\s+([A-Za-z]{2,})/i);
    const notNames = ['a', 'an', 'the', 'looking', 'interested', 'from', 'working', 'curious', 'here', 'just', 'not', 'good', 'fine', 'doing', 'trying', 'professor', 'student', 'researcher', 'recruiter', 'wondering', 'new', 'very', 'so', 'also', 'really', 'on', 'in', 'at', 'with', 'great', 'awesome', 'cool', 'nice', 'amazing', 'helpful', 'interesting', 'impressive', 'sure', 'okay', 'glad', 'happy', 'sorry', 'back', 'done', 'confused', 'impressed'];
    if (nameMatch && !notNames.includes(nameMatch[1].toLowerCase()) && /my name is|this is/i.test(nameMatch[0]) || (nameMatch && /^[A-Z]/.test(nameMatch[1]) && !notNames.includes(nameMatch[1].toLowerCase()))) {
      state.name = nameMatch[1][0].toUpperCase() + nameMatch[1].slice(1).toLowerCase();
      greetName = state.name;
      text = normalize(original.replace(nameMatch[0], ' '));
    }

    const ent = findEntity(text);
    const attr = findAttr(ent ? ent.rest : text);
    const ranked = rankTopics(text);
    const top = ranked[0];
    const withName = res => greetName ? { ...res, text: `Nice to meet you, ${greetName}! ${res.text}` } : res;

    // 1. A specific project or paper
    if (ent) return withName(answerEntity(ent.e, attr));

    // 2. Follow-up about the project/paper we were just discussing ("link?", "what did you use?")
    const wordCount = text.split(' ').length;
    const refersBack = /(^|\s)(it|its|it's|that|this|them|those|the project|the paper)(\s|$|\?)/.test(text) || wordCount <= 4;
    if (attr && state.entity && refersBack && (!top || top.s < 6 || attr === 'link')) {
      return withName(answerEntity(state.entity, attr));
    }

    // 3. "Tell me more" about the last topic
    const wantsMore = /^(tell me more|more|go on|continue|elaborate|and|more details?|details?|explain more|say more)\b/.test(text) || text.includes('tell me more');
    if (wantsMore && (!top || top.t.id === (state.topic && state.topic.id))) {
      if (state.topic && state.topic.more && !state.moreUsed) {
        state.moreUsed = true;
        return { text: state.topic.more, next: state.topic.next.filter(n => n !== 'Tell me more') };
      }
      return { text: `That's pretty much the short version! My CV has the full details, and I'm always happy to go deeper over email at ${EMAIL}.`, next: DEFAULT_NEXT };
    }

    // 4. General topics
    if (top) {
      let primary = top.t;
      let prefix = '';
      const substantive = ranked.find(r => !SOCIAL.includes(r.t.id));
      if (SOCIAL.includes(primary.id) && substantive) {
        prefix = (greetName ? '' : primary.social + ' ');
        primary = substantive.t;
      }
      const res = answerTopic(primary);
      res.text = prefix + res.text;

      // Two distinct questions in one message ("research and projects")
      const second = ranked.find(r => r.t !== primary && !SOCIAL.includes(r.t.id) && r.t.id !== 'bot');
      if (second && /\band\b|&|,|\balso\b/.test(text) && !SOCIAL.includes(primary.id)) {
        res.text += '\n\n' + pick(second.t.reply);
      }
      return withName(res);
    }

    if (greetName) return { text: `Nice to meet you, ${greetName}! What would you like to know about my work?`, next: DEFAULT_NEXT };

    // 5. Fallback
    state.topic = null;
    return {
      text: `Hmm, I'm not sure how to answer that one. I can tell you about my research, projects, papers, or background. Or email me at ${EMAIL} and I'll reply personally.`,
      next: DEFAULT_NEXT
    };
  };
}

// ---- Rendering: text with clickable links ----
function renderRich(el, text) {
  const re = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+|\b[\w-]+\.(?:html|pdf)\b)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    let token = m[0];
    const trail = token.match(/[.,!?]+$/);
    if (trail) token = token.slice(0, -trail[0].length);
    el.appendChild(document.createTextNode(text.slice(last, m.index)));
    const a = document.createElement('a');
    a.textContent = token;
    if (token.includes('@') && !token.startsWith('http')) a.href = 'mailto:' + token;
    else a.href = token;
    if (/^https?:|\.pdf$/.test(token)) { a.target = '_blank'; a.rel = 'noopener'; }
    el.appendChild(a);
    last = m.index + token.length;
  }
  el.appendChild(document.createTextNode(text.slice(last)));
}

function mountChat() {
  const STORE = 'likhon-chat-v2';
  const widget = document.createElement('div');
  widget.className = 'chat-widget';
  widget.innerHTML = `
    <div class="chat-panel" id="chatPanel" role="dialog" aria-label="Chat with Likhon" hidden>
      <div class="chat-header">
        <div class="chat-id">
          <img class="chat-avatar" src="assets/profile.jpg" alt="">
          <div>
            <h4>Chat with Likhon</h4>
            <p>Automated assistant · answers written by me</p>
          </div>
        </div>
        <div class="chat-actions">
          <button class="chat-reset" type="button" aria-label="Restart chat" title="Restart chat">↺</button>
          <button class="chat-close" type="button" aria-label="Close">&times;</button>
        </div>
      </div>
      <div class="chat-messages" aria-live="polite"></div>
      <div class="quick"></div>
      <form class="chat-form">
        <input type="text" maxlength="400" aria-label="Type your message" placeholder="Ask me anything…" autocomplete="off">
        <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
      </form>
    </div>
    <button class="chat-toggle" type="button" aria-label="Chat with Likhon" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
    </button>`;
  document.body.appendChild(widget);

  const avatar = widget.querySelector('.chat-avatar');
  avatar.addEventListener('error', () => { avatar.src = '/assets/profile.jpg'; }, { once: true });

  const panel = widget.querySelector('.chat-panel');
  const toggle = widget.querySelector('.chat-toggle');
  const messages = widget.querySelector('.chat-messages');
  const quick = widget.querySelector('.quick');
  const form = widget.querySelector('.chat-form');
  const input = form.querySelector('input');

  let respond = createAgent();
  let history = [];
  let lastNext = DEFAULT_NEXT;
  let busy = false;
  const sentLog = [];
  let logIdx = 0;

  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify({ history: history.slice(-40), lastNext })); } catch (e) {} };
  const scroll = () => { messages.scrollTop = messages.scrollHeight; };

  const add = (text, who, persist = true) => {
    const el = document.createElement('div');
    el.className = 'msg ' + who;
    if (who === 'bot') renderRich(el, text); else el.textContent = text;
    messages.appendChild(el);
    scroll();
    if (persist) { history.push({ who, text }); save(); }
  };

  const setSuggestions = list => {
    lastNext = list;
    quick.innerHTML = '';
    list.forEach(label => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => ask(label));
      quick.appendChild(b);
    });
    save();
  };

  const botSay = (text, next) => {
    busy = true;
    quick.innerHTML = '';
    const typing = document.createElement('div');
    typing.className = 'msg bot typing';
    typing.setAttribute('aria-label', 'Likhon is typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    scroll();
    setTimeout(() => {
      typing.remove();
      add(text, 'bot');
      setSuggestions(next || []);
      busy = false;
      input.focus();
    }, Math.min(1500, 400 + text.length * 3));
  };

  function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    add(q, 'user');
    sentLog.push(q); logIdx = sentLog.length;
    const { text, next } = respond(q);
    botSay(text, next);
  }

  const greet = () => botSay(`Hi, I'm Likhon 👋 Ask me about my research, projects, or papers. You can also ask follow-ups like "link?" or "what did you use to build it?"`, DEFAULT_NEXT);

  // Restore this tab's conversation across pages
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (saved && saved.history && saved.history.length) {
      history = saved.history;
      history.forEach(m => add(m.text, m.who, false));
      setSuggestions(saved.lastNext || DEFAULT_NEXT);
    }
  } catch (e) {}

  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus();
      if (!history.length && !busy) greet();
      scroll();
    }
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  widget.querySelector('.chat-close').addEventListener('click', () => setOpen(false));
  widget.querySelector('.chat-reset').addEventListener('click', () => {
    if (busy) return;
    history = []; messages.innerHTML = ''; respond = createAgent();
    try { sessionStorage.removeItem(STORE); } catch (e) {}
    greet();
  });
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && sentLog.length && logIdx > 0) { logIdx--; input.value = sentLog[logIdx]; e.preventDefault(); }
    if (e.key === 'ArrowDown' && logIdx < sentLog.length) { logIdx++; input.value = sentLog[logIdx] || ''; e.preventDefault(); }
  });

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
  initReveal();
  mountChat();
});
