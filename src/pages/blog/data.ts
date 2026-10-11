/** Blog content. Add a post by adding an entry to POSTS and a matching entry to ARTICLES. */

export type Tag = 'ai' | 'systems' | 'security' | 'web';
export type FilterTag = 'all' | Tag;

/** Syntax-highlighted code: [token class | null, text] pairs. */
export type Token = readonly [cls: 'kw' | 'fn' | 'str' | 'cm' | 'num' | null, text: string];

export interface Post {
  id: string;
  /** The "LOG-01" badge. */
  log: string;
  tags: readonly Tag[];
  tagLabels: readonly string[];
  date: string;
  readTime: string;
  status: string;
  title: string;
  excerpt: string;
  code: { lang: string; tokens: readonly Token[] };
}

export const POSTS: readonly Post[] = [
  {
    id: 'ai-pipeline',
    log: 'LOG-01',
    tags: ['ai', 'web'],
    tagLabels: ['AI', 'Web Dev'],
    date: 'OCT 24, 2024',
    readTime: '~5 min read',
    status: 'Active Study',
    title: 'Breaking down my recent AI project',
    excerpt:
      "A deep dive into the architecture and challenges of building large-scale data pipelines for local ML inference. Here's what I learned...",
    code: {
      lang: 'python',
      tokens: [
        ['kw', 'import'], [null, ' torch\n'], ['kw', 'from'], [null, ' transformers '], ['kw', 'import'], [null, ' AutoModelForCausalLM\n\n'],
        ['cm', '# Load quantized model for local inference'], [null, '\nmodel = AutoModelForCausalLM.'], ['fn', 'from_pretrained'], [null, '(\n    '],
        ['str', '"meta-llama/Llama-2-7b"'], [null, ',\n    device_map='], ['str', '"auto"'], [null, ',\n    load_in_4bit='], ['num', 'True'], [null, '\n)'],
      ],
    },
  },
  {
    id: 'cpp-relevance',
    log: 'LOG-02',
    tags: ['systems'],
    tagLabels: ['Systems'],
    date: 'SEP 12, 2024',
    readTime: '~7 min read',
    status: 'Systems Trace',
    title: 'Why C/C++ is still relevant in the age of Rust',
    excerpt:
      'Exploring the gritty details of memory management and when it makes sense to stick to the classics for system-level robust tooling...',
    code: {
      lang: 'c',
      tokens: [
        ['cm', '// Custom memory pool allocator'], [null, '\n'], ['kw', 'void'], [null, '* '], ['fn', 'pool_alloc'], [null, '('], ['kw', 'MemPool'], [null, '* pool, '],
        ['kw', 'size_t'], [null, ' size) {\n    '], ['kw', 'if'], [null, ' (pool->offset + size > pool->capacity)\n        '], ['kw', 'return'], [null, ' '],
        ['num', 'NULL'], [null, ';\n    '], ['kw', 'void'], [null, '* ptr = pool->base + pool->offset;\n    pool->offset += '], ['fn', 'ALIGN'], [null, '(size, '],
        ['num', '16'], [null, ');\n    '], ['kw', 'return'], [null, ' ptr;\n}'],
      ],
    },
  },
  {
    id: 'homelab-security',
    log: 'LOG-03',
    tags: ['security'],
    tagLabels: ['Security'],
    date: 'AUG 05, 2024',
    readTime: '~4 min read',
    status: 'Network Report',
    title: 'My homelab setup and network security',
    excerpt: 'How I isolated my services, set up a custom firewall structure, and learned penetration testing basics in the process.',
    code: {
      lang: 'bash',
      tokens: [
        ['cm', '# Isolate VLAN traffic with iptables'], [null, '\niptables -A FORWARD -i vlan10 -o vlan20 \\\n    -m state --state NEW -j '], ['str', 'DROP'],
        [null, '\niptables -A FORWARD -i vlan20 -o vlan10 \\\n    -m state --state ESTABLISHED,RELATED -j '], ['str', 'ACCEPT'],
      ],
    },
  },
];

export interface Article {
  kicker: string;
  title: string;
  meta: readonly string[];
  summary: string;
  signal: string;
  stats: readonly { label: string; value: string }[];
  sections: readonly { kicker: string; title: string; paragraphs: readonly string[] }[];
  quote: string;
  code: { lang: string; content: string };
}

export const ARTICLES: Record<string, Article> = {
  'ai-pipeline': {
    kicker: 'AI Infrastructure',
    title: 'Breaking down my recent AI project',
    meta: ['Oct 24, 2024', '~5 min read', 'AI / Web'],
    summary:
      'The hardest part of the project was not model loading itself. It was building the system around the model so local inference stayed dependable, inspectable, and easy to iterate on.',
    signal: 'Main lesson: treat the pipeline, not the model, as the product surface.',
    stats: [
      { label: 'Inference Mode', value: 'Quantized local' },
      { label: 'Primary Risk', value: 'Latency spikes' },
      { label: 'Key Fix', value: 'Tighter pipeline contracts' },
      { label: 'Stack', value: 'Python + HF + UI' },
    ],
    sections: [
      {
        kicker: 'Section 01',
        title: 'The real bottleneck was orchestration',
        paragraphs: [
          'The system felt slow long before the model itself became the problem. Requests were wandering through data preparation, device selection, serialization, and UI handoff layers that had all been built at different speeds and with different assumptions.',
          'Once I stopped treating those pieces as support code and started treating them as first-class architecture, the project became much easier to reason about. The pipeline needed explicit contracts, predictable handoff points, and fewer magical branches.',
        ],
      },
      {
        kicker: 'Section 02',
        title: 'Observability made iteration faster',
        paragraphs: [
          'A lightweight telemetry layer was more useful than another round of prompt tweaking. I wanted to know when the model was loading, when it was waiting on disk, when response assembly was happening, and what kind of requests actually produced rough outputs.',
          'That visibility turned subjective performance complaints into a concrete debugging surface. Instead of guessing where quality or speed broke down, I could inspect the path and tighten one stage at a time.',
        ],
      },
    ],
    quote: 'If the model is powerful but the pipeline is blurry, the user still experiences a blurry product.',
    code: {
      lang: 'python',
      content:
        'pipeline = InferencePipeline(model=model, preprocessor=prep, tracer=telemetry)\nresult = pipeline.run(payload)\nif result.latency_ms > 700:\n    telemetry.flag("latency-spike", result.trace_id)',
    },
  },
  'cpp-relevance': {
    kicker: 'Systems Notes',
    title: 'Why C/C++ is still relevant in the age of Rust',
    meta: ['Sep 12, 2024', '~7 min read', 'Systems'],
    summary:
      'Rust improves many sharp edges, but C and C++ still show up anywhere teams need direct control over memory layout, embedded constraints, legacy interop, or performance-critical tooling that already exists in deep ecosystems.',
    signal: 'Main lesson: relevance comes from constraints, not trends.',
    stats: [
      { label: 'Primary Constraint', value: 'Memory control' },
      { label: 'Where It Wins', value: 'Legacy + infra' },
      { label: 'Counterweight', value: 'Safety costs' },
      { label: 'Takeaway', value: 'Use the right pressure-tested tool' },
    ],
    sections: [
      {
        kicker: 'Section 01',
        title: 'Interfacing with reality is messy',
        paragraphs: [
          'A lot of systems programming is not greenfield language theory. It is existing protocols, long-lived libraries, hardware expectations, and weird operational budgets. In those environments, C and C++ remain deeply practical because they are already the language of the boundary.',
          'Even when Rust is the better long-term direction, the path there often travels through code that is already deployed, audited, or heavily integrated. That means understanding C and C++ still pays off.',
        ],
      },
      {
        kicker: 'Section 02',
        title: 'Skill in these languages sharpens systems thinking',
        paragraphs: [
          'Working in lower-level environments trains different instincts. You start thinking in data movement, alignment, ownership pressure, cache behavior, and failure surfaces that can be hidden in higher-level code until they become expensive.',
          'That mental model stays useful even when you move back up the stack. It changes how you design APIs, how you profile software, and how you interpret performance regressions.',
        ],
      },
    ],
    quote: 'Languages rise and fall in hype cycles. Constraints do not.',
    code: {
      lang: 'c',
      content:
        'void *pool_alloc(MemPool *pool, size_t size) {\n    if (pool->offset + size > pool->capacity) return NULL;\n    void *ptr = pool->base + pool->offset;\n    pool->offset += ALIGN(size, 16);\n    return ptr;\n}',
    },
  },
  'homelab-security': {
    kicker: 'Security Report',
    title: 'My homelab setup and network security',
    meta: ['Aug 05, 2024', '~4 min read', 'Security'],
    summary:
      'The most useful part of the homelab was not the hardware. It was using a small environment to learn how segmentation, default-deny thinking, and layered monitoring change the way a network behaves under pressure.',
    signal: 'Main lesson: security gets clearer when you can observe and break your own environment safely.',
    stats: [
      { label: 'Core Pattern', value: 'Segmentation' },
      { label: 'Policy Style', value: 'Default deny' },
      { label: 'Learning Loop', value: 'Build, test, refine' },
      { label: 'Outcome', value: 'Better intuition for blast radius' },
    ],
    sections: [
      {
        kicker: 'Section 01',
        title: 'Isolation changed the way I designed services',
        paragraphs: [
          'Once services stopped living on the same flat network, every new deployment forced a clearer decision: what actually needs to talk to what, over which port, and under what assumptions. That discipline improved both reliability and security.',
        ],
      },
      {
        kicker: 'Section 02',
        title: 'Hands-on testing made the concepts stick',
        paragraphs: [
          'Reading about firewall rules is useful, but watching a bad rule leak traffic or kill a service teaches much faster. The homelab became a place where I could safely learn how segmentation interacts with convenience, debugging, and operational tradeoffs.',
        ],
      },
    ],
    quote: 'A secure network is rarely one giant lock. It is usually a map of smaller, deliberate trust boundaries.',
    code: {
      lang: 'bash',
      content:
        'iptables -A FORWARD -i vlan10 -o vlan20 -m state --state NEW -j DROP\niptables -A FORWARD -i vlan20 -o vlan10 -m state --state ESTABLISHED,RELATED -j ACCEPT\niptables -A INPUT -p tcp --dport 22 -s 10.0.10.0/24 -j ACCEPT',
    },
  },
};

export const FILTERS: readonly { tag: FilterTag; label: string }[] = [
  { tag: 'all', label: 'All' },
  { tag: 'ai', label: 'AI' },
  { tag: 'systems', label: 'Systems' },
  { tag: 'security', label: 'Security' },
  { tag: 'web', label: 'Web Dev' },
];

export const SHORTCUTS: readonly { tag: Tag; label: string }[] = [
  { tag: 'ai', label: 'AI Experiments' },
  { tag: 'systems', label: 'Systems Notes' },
  { tag: 'security', label: 'Security Logs' },
  { tag: 'web', label: 'Frontend Builds' },
];

export const METRICS: readonly { label: string; value: string; note: string }[] = [
  { label: 'Total Logs', value: '', note: 'Active documents in the current archive.' },
  { label: 'Tracks', value: 'AI / Systems / Security', note: 'Primary lanes under active observation.' },
  { label: 'Focus Vector', value: 'Applied ML Infrastructure', note: 'Recent emphasis across current work.' },
  { label: 'Interface', value: 'Typed + Filterable', note: 'Query by tag and scan implementation fragments.' },
];

export const ROUTES: readonly { label: string; width: number }[] = [
  { label: 'AI', width: 78 },
  { label: 'Systems', width: 66 },
  { label: 'Security', width: 58 },
  { label: 'Web', width: 61 },
];

export const PROFILE: readonly (readonly [string, string])[] = [
  ['Signal Style', 'Technical + reflective'],
  ['Cadence', 'Project-driven entries'],
  ['Mode', 'Notes + code fragments'],
  ['Operator', 'Alex Gaffen'],
];
