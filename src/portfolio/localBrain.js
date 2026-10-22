import { allProjects } from '../data/portfolio'
import profile from '../data/profile.json'
import resume from '../data/chat/resume.json'

// The chat's offline brain, used when the hosted model is unavailable. It speaks as Jumin's
// portfolio assistant (third person), follows src/data/chat/knowledge-base.md, and only says what
// that file, the 2026 resume (src/data/chat/resume.json) or the project data says.

const resumeUrl = '/assets/JuminShin_Resume.pdf'
const bySlug = slug => allProjects.find(project => project.slug === slug)
const link = project => `[${project.title}](/work/${project.slug}/)`
const firstSentence = text => (text || '').replace(/\s+/g, ' ').trim().split(/(?<=\.)\s/)[0]
const bullets = items => items.filter(Boolean).map(item => `- ${item}`).join('\n')
const ko = question => /[가-힣]/.test(question)
const experience = name => resume.experience.find(item => item.organization.startsWith(name))

// Work without its own project page, described from the knowledge base and resume.
const extras = {
  macromill: { en: '**Macromill Embrain research** — mixed-method UX research with ~100 participants for Samsung, Hyundai and SK, turned into UI prototypes ([experience](/about/))', ko: '**Macromill Embrain 리서치** — 삼성·현대·SK 대상, 약 100명 참가자와 진행한 혼합 방법 UX 리서치와 UI 프로토타입 ([경력](/about/))' },
  hyundaiEv: { en: '**Hyundai EV charging-port interaction research** — interaction design, Figma and C++ prototypes, user testing; published at KSDS 2023 ([research](/research/))', ko: '**현대 EV 충전구 인터랙션 리서치** — 인터랙션 디자인, Figma·C++ 프로토타입, 사용자 테스트, KSDS 2023 발표 ([리서치](/research/))' },
}
const projectLine = project => `${link(project)} — ${project.organization}, ${project.year}. ${firstSentence(project.outcome || project.summary)}`
// Items are project slugs or keys of `extras`, in the order they should be recommended.
const picksFor = (items, k) => bullets(items.map(item => (extras[item] ? extras[item][k ? 'ko' : 'en'] : bySlug(item) && projectLine(bySlug(item)))))

// Role and domain recommendations, following "Best Projects by Role" in the knowledge base.
const recommendations = {
  ux: { label: ['UX Design', 'UX 디자인'], items: ['honda-spatial', 'macromill', 'ethicon-care', 'ars-pharma'], focus: ['research, interaction design, user needs, prototyping and usability', '리서치, 인터랙션 디자인, 사용자 니즈, 프로토타이핑, 사용성'] },
  ai: { label: ['AI / Human-AI Interaction', 'AI / 휴먼-AI 인터랙션'], items: ['bubbas-production', 'ethicon-care', 'haily', 'story-authoring'], focus: ['AI workflows, human-AI interaction, trust, user control and AI-assisted work', 'AI 워크플로, 휴먼-AI 인터랙션, 신뢰, 사용자 제어'] },
  engineering: { label: ['Design Engineering', '디자인 엔지니어링'], items: ['bubbas-production', 'swim-up-hill', 'honda-spatial', 'ai-native-mvp'], focus: ['turning design into working experiences, front-end development, interactive prototypes and technical collaboration', '디자인을 실제로 동작하는 경험으로 만드는 일, 프론트엔드, 인터랙티브 프로토타입, 기술 협업'] },
  research: { label: ['UX Research', 'UX 리서치'], items: ['macromill', 'hyundaiEv', 'ethicon-care', 'haily'], focus: ['interviews, surveys, usability testing, synthesis and turning findings into design decisions', '인터뷰, 설문, 사용성 테스트, 종합, 발견을 디자인 결정으로 연결하는 일'] },
  healthcare: { label: ['healthcare', '헬스케어'], items: ['ethicon-care', 'haily', 'ars-pharma', 'ai-native-mvp'], focus: ['clinical and care workflows, AI assistance and end-to-end service design', '임상·케어 워크플로, AI 보조, 엔드투엔드 서비스 디자인'] },
  automotive: { label: ['automotive UX', '자동차 UX'], items: ['honda-spatial', 'hyundaiEv', 'learning-mobility'], focus: ['spatial design review, vehicle interaction and mobility concepts', '공간 디자인 리뷰, 차량 인터랙션, 모빌리티 컨셉'] },
}
// A word is a substring or a RegExp; multi-word phrases count double so specific asks beat single keywords.
const matches = (text, word) => (word instanceof RegExp ? word.test(text) : text.includes(word))
const weight = word => (typeof word === 'string' && word.trim().includes(' ') ? 2 : 1)

const roleWords = {
  engineering: ['design engineer', 'ux engineer', 'engineering', 'front-end', 'frontend', 'developer', 'technical', '엔지니어', '개발'],
  research: ['ux research', 'researcher', 'research role', '리서처', '리서치'],
  ai: [/\bai\b/, 'hci', 'human-ai', 'llm', 'agent', 'machine learning', '인공지능'],
  healthcare: ['health', 'medical', 'clinic', 'hospital', 'pharma', 'medtech', 'patient', '헬스', '의료', '병원'],
  automotive: ['automotive', 'auto ', 'car ', 'vehicle', 'mobility', 'ev ', 'honda', 'hyundai', '자동차', '모빌리티', '차량'],
  ux: ['ux design', 'ux designer', 'product design', 'ui design', 'interaction design', 'designer', 'ux', '디자이너', '디자인'],
}
function detectRole(text) {
  for (const [role, words] of Object.entries(roleWords)) if (words.some(word => matches(text, word))) return role
  return null
}

const topics = [
  { id: 'privacy', words: ['address', 'home ', 'where do you live', 'where does she live', 'visa', 'immigration', 'citizenship', 'citizen', 'sponsor', 'green card', 'medical', 'illness', 'salary', 'pay range', 'compensation', 'finance', 'phone', 'number to call', 'ssn', 'social security', 'bank', 'password', 'how old', 'age ', 'married', 'religion', '주소', '비자', '영주권', '시민권', '전화', '연봉', '급여', '나이', '결혼', '병력'] },
  { id: 'recommend', words: ['which project', 'what project', 'what should i look', 'where should i start', 'recommend', 'relevant', 'most relevant', 'best project', 'best work', 'strongest project', 'look at first', 'show me work for', 'good fit', 'for a ', 'for an ', '추천', '어떤 프로젝트', '뭐부터', '봐야', '관련'] },
  { id: 'strengths', words: ['strength', 'stren', 'advantage', 'edge', 'differen', 'unique', 'stand out', 'why hire', 'why should', 'good at', 'best at', 'superpower', 'value', 'bring', '강점', '장점', '차별', '잘하', '왜 뽑'] },
  { id: 'kind', words: ['what kind of designer', 'what type of designer', 'kind of designer', 'what does she do', 'what do you do', 'who is jumin', 'who is she', 'describe her', 'describe jumin', 'positioning', '어떤 디자이너', '어떤 사람', '누구'] },
  { id: 'collaboration', words: ['collaborat', 'work with engineers', 'work with developers', 'work with engineer', 'work with developer', 'handoff', 'hand off', 'cross-functional', 'communicat', '협업', '개발자와', '소통'] },
  { id: 'code', words: ['code', 'coding', 'program', 'developer', 'javascript', 'react', 'typescript', 'technical skill', '코딩', '코드', '개발 경험', '구현'] },
  { id: 'usability', words: ['usability', 'usable', 'task completion', 'user testing', '사용성'] },
  { id: 'accessibility', words: ['accessib', 'inclusive', 'a11y', 'wcag', 'disabilit', 'hearing', '접근성', '포용'] },
  { id: 'aiView', words: ['trust', 'responsible', 'ethic', 'view on ai', 'think about ai', 'opinion', 'hallucinat', 'transparen', '신뢰', '윤리', '책임'] },
  { id: 'ai', words: [/\bai\b/, 'llm', 'agent', 'generative', 'machine learning', 'human-ai', '인공지능', '에이전트'] },
  { id: 'researchApproach', words: ['approach', 'process', 'method', 'how does she work', 'how do you work', 'how does she research', 'how does she design', 'turn research', 'research into', 'workflow', '프로세스', '방법', '접근', '일하는'] },
  { id: 'research', words: ['research', 'interview', 'survey', 'participant', 'user study', 'macromill', '리서치', '연구', '인터뷰', '설문'] },
  { id: 'teaching', words: ['teach', 'mentor', 'ta ', 'teaching assistant', 'student', 'education program', '가르', '멘토', '조교'] },
  { id: 'education', words: ['education', 'school', 'degree', 'study', 'studied', 'university', 'master', 'major', 'usc', 'hongik', 'graduat', '학교', '학력', '전공', '대학', '석사', '졸업'] },
  { id: 'experience', words: ['experience', 'work history', 'intern', 'job', 'career', 'worked', 'companies', 'employ', 'previous', 'resume', 'cv', '경력', '인턴', '이력'] },
  { id: 'tools', words: ['tool', 'stack', 'software', 'skill', 'figma', 'python', 'unity', '툴', '기술', '스택', '스킬'] },
  { id: 'publications', words: ['paper', 'publication', 'publish', 'journal', 'conference', 'academic', 'scholar', 'icids', 'kiise', 'ksds', 'hci korea', '논문', '출판', '학회'] },
  { id: 'awards', words: ['award', 'prize', 'win', 'won', 'recogni', 'scholarship', 'hackathon', 'competition', '수상', '대회', '장학'] },
  { id: 'contact', words: ['contact', 'email', 'reach', 'linkedin', 'get in touch', 'talk to her', 'hire her', '연락', '이메일', '링크드인'] },
  { id: 'next', words: ['looking for', 'open to', 'what role', 'which role', 'roles', 'goal', 'future', 'next step', 'interested in', '원하는', '목표', '관심'] },
  { id: 'location', words: ['where is she', 'where are you', 'based', 'location', 'relocat', 'remote', 'los angeles', '어디', '위치'] },
  { id: 'background', words: ['background', 'bio', 'about her', 'about jumin', 'yourself', 'introduce', 'tell me about her', 'tell me about jumin', '배경', '소개'] },
]

function scoreTopics(question) {
  const text = ` ${question.toLowerCase()} `
  return topics
    .map((topic, order) => ({ id: topic.id, order, score: topic.words.reduce((total, word) => total + (matches(text, word) ? weight(word) : 0), 0) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
}

const genericOrgWords = new Set(['project', 'two-person', 'person', 'team', 'university', 'academy', 'foundation', 'department', 'division', 'business', 'collaboration', 'school', 'studio', 'workshop', 'weekend', 'startup', 'iovine', 'young', 'prof.', 'thomas', 'lord', 'proposal', 'individual', 'hackathon', 'research', 'collaborative'])
function namedProject(question) {
  const text = question.toLowerCase()
  const ranked = allProjects
    .map(project => {
      const org = (project.organization || '').toLowerCase().split(/[\s,/&×x]+/).filter(word => word.length > 3 && !genericOrgWords.has(word))
      const title = project.title.toLowerCase()
      const named = text.includes(title) || text.includes(project.slug.replace(/-/g, ' ')) || org.some(word => text.includes(word))
      return { project, named }
    })
    .filter(entry => entry.named)
  // Prefer the featured page when one organization has several (e.g. Bubba's LA).
  return ranked[0]?.project
}

const writers = {
  privacy: k => [k ? '그 정보는 개인적인 내용이라 여기서 다루지 않아요. 직무나 근무 조건 관련 질문은 Jumin에게 직접 이메일로 물어보시는 게 가장 정확해요.' : 'That’s personal information I don’t share here. For questions about work arrangements or logistics, it’s best to ask Jumin directly by email.', `[${profile.email}](mailto:${profile.email})`],
  strengths: k => [
    k ? 'Jumin의 가장 큰 차별점은 디자인과 기술 사이를 오갈 수 있다는 점이에요. UX 리서치와 인터페이스 디자인 경험이 있으면서, 직접 프로토타입을 만들고 프론트엔드 기술로 구현할 수 있어요. 이 강점은 AI, 헬스케어, 신기술 프로젝트에서 특히 잘 드러나요.'
      : 'Jumin’s strongest differentiator is her ability to work between design and technology. She has experience in UX research and interface design, but she can also prototype and work with front-end technologies. This is especially visible in her AI, healthcare, and emerging-technology projects.',
    bullets(k
      ? ['**디자인과 기술 연결** — 사용자 경험과 실제 구현 방식을 함께 생각해서 디자인·엔지니어링 팀 모두와 소통해요.', '**리서치를 제품 아이디어로** — 인터뷰, 설문, 사용성 테스트를 인터페이스와 제품 제안으로 바꿔요.', '**신기술 다루기** — AI, Apple Vision Pro, 헬스케어 기술에서 사람들이 기술을 어떻게 이해하고 제어하고 신뢰하는지에 관심이 많아요.', '**분야를 넘나드는 협업** — 디자이너, 엔지니어, 연구자, 헬스케어 전문가, 산업 파트너, 스타트업 팀과 일해왔어요.']
      : ['**Connecting design and technology** — she thinks about both the user experience and how it can be built, so she works well with design and engineering teams.', '**Turning research into product ideas** — interviews, surveys and usability testing translated into interface and product recommendations.', '**Working with emerging technology** — AI, Apple Vision Pro and healthcare tech, with a focus on how people understand, control and trust it.', '**Working across disciplines** — designers, engineers, researchers, healthcare experts, industry partners and startup teams.']),
    k ? '잘 보여주는 프로젝트:' : 'Projects that show it:',
    picksFor(['bubbas-production', 'honda-spatial', 'ethicon-care'], k),
  ],
  kind: k => [
    k ? 'Jumin은 기술적 배경을 가진 멀티디서플리너리 UX/프로덕트 디자이너예요. 휴먼-AI 인터랙션과 디자인 엔지니어링에 특히 관심이 많아요. 리서치, 인터페이스 디자인, 프로토타이핑, 구현 사이를 자연스럽게 오가요.'
      : 'Jumin is a multidisciplinary UX/product designer with a technical background and a strong interest in human-AI interaction and design engineering. She moves comfortably between research, interface design, prototyping and implementation.',
    k ? '반복되는 주제는 복잡한 시스템이나 기술, 리서치 결과를 사람들이 이해하고 쓸 수 있는 인터페이스로 바꾸는 일이에요.' : 'A recurring theme in her work is translating complex systems, technical capabilities or research findings into interfaces people can understand and use.',
    `[${k ? '경력 자세히 보기' : 'Experience and background'}](/about/) · [${k ? '이력서' : 'Resume'}](${resumeUrl})`,
  ],
  code: k => [
    k ? '네. JavaScript, React, HTML, CSS, Python, C++ 경험이 있고, 실제로 동작하는 프로토타입과 프론트엔드 제품을 만들어왔어요. (TypeScript는 기초 수준이에요.)'
      : 'Yes. Jumin has front-end and technical experience including JavaScript, React, HTML, CSS, Python and C++, and has contributed to working prototypes and front-end products. (Her TypeScript experience is more foundational.)',
    bullets([
      `**Swim Up Hill** — ${experience('Swim Up Hill').highlights[0]} ${link(bySlug('swim-up-hill'))}`,
      `**Bubba’s LA** — ${experience('Bubba').highlights[0]} ${link(bySlug('bubbas-production'))}`,
      `**USC hackathon** — ${k ? '4시간 만에 디자인·개발·피치한 복약 메시징 MVP' : 'a medication-messaging MVP designed, built and pitched in four hours'}. ${link(bySlug('ai-native-mvp'))}`,
    ]),
  ],
  research: k => [
    k ? '네, 실제 사용자 리서치 경험이 있어요. Macromill Embrain에서 삼성·현대·SK 프로젝트로 약 100명의 참가자와 인터뷰, 설문, 사용성 테스트를 진행하고, 인사이트를 UI 프로토타입으로 연결했어요.'
      : 'Yes. At Macromill Embrain, Jumin ran mixed-method UX research with about 100 participants (interviews, surveys, usability tests) for Samsung, Hyundai and SK, and turned the insights into UI prototypes.',
    bullets(experience('Macromill').highlights),
    k ? '그 밖의 리서치·테스트 경험:' : 'Other research and testing:',
    picksFor(['ethicon-care', 'haily'], k, ['hyundaiEv']),
  ],
  researchApproach: k => [
    k ? 'Jumin은 문제를 볼 때 이렇게 생각해요:' : 'When approaching a design problem, Jumin typically thinks about:',
    (k ? ['사용자가 누구인지', '무엇을 이루려 하는지', '지금 경험은 어떤지', '어떤 근거나 리서치가 있는지', '팀이 현실적으로 무엇을 만들 수 있는지'] : ['Who the user is', 'What they are trying to accomplish', 'What their current experience looks like', 'What evidence or research is available', 'What the team can realistically build']).map((item, index) => `${index + 1}. ${item}`).join('\n'),
    k ? '그리고 리서치를 별도 산출물로 두지 않고 결정으로 연결해요: 리서치 발견 → 사용자 니즈 → 디자인 기회 → 프로토타입 → 평가와 반복.' : 'She connects research directly to decisions rather than treating it as a separate deliverable: research finding → user need → design opportunity → prototype → evaluate and iterate.',
    k ? '방법은 질문에 맞춰 골라요. 경험을 이해하려면 인터뷰, 어디서 막히는지 보려면 사용성 테스트, 더 많은 사람의 의견이 필요하면 설문을 써요.' : 'She picks methods for the question at hand: interviews to understand experiences, usability testing to find where people struggle, surveys for broader feedback.',
  ],
  usability: k => [
    k ? '사용성을 평가할 때 Jumin은 사람들이 중요한 작업을 성공적으로 끝낼 수 있는지에 집중해요. 작업 완료, 혼란 지점, 오류, 도움이 필요한 순간, 정성 피드백을 보고 개선 우선순위를 정해요.' : 'When evaluating usability, Jumin focuses on whether people can complete important tasks. She looks at task completion, points of confusion, errors, where people need help, and qualitative feedback, then uses that to prioritize improvements.',
    k ? `예를 들어 Swim Up Hill에서는 부모와 수영 학생을 대상으로 사용성 테스트를 진행했고, 그 결과로 접근성 수정과 폼 수리 순서를 정했어요. ${link(bySlug('swim-up-hill'))}` : `At Swim Up Hill, for example, she runs usability tests with parents and swimmers, and the findings set the accessibility fixes and the repair order for forms. ${link(bySlug('swim-up-hill'))}`,
  ],
  accessibility: k => [
    k ? '접근성과 포용적 디자인은 Jumin의 작업에서 중요한 부분이에요. 청각장애 아동을 위한 Sing In Sign 프로젝트를 통해 같은 인터페이스도 사람마다 전혀 다르게 경험할 수 있다는 걸 배웠고, 접근성은 마지막 점검이 아니라 처음부터 고려해야 한다고 생각해요.' : 'Accessibility and inclusive design are important in Jumin’s work. Her Sing In Sign project, designed with children with hearing impairments, showed her that different people can experience the same interface very differently, and she believes accessibility belongs early in the process, not only as a final check.',
    picksFor(['sing-in-sign', 'swim-up-hill'], k),
  ],
  collaboration: k => [
    k ? 'Jumin은 개발자에게 디자인을 전달할 때 다섯 가지를 설명해요: 사용자의 작업, 인터랙션 흐름, 각 화면·컴포넌트의 역할, 액션 후에 일어날 일, 엣지 케이스와 다양한 UI 상태. 직접 프론트엔드를 해봤기 때문에 구현 제약을 이해하려고 해요.' : 'When handing designs to developers, Jumin explains the user’s task, the interaction flow, what each screen or component should do, what happens after an action, and edge cases and UI states. Because she has front-end experience herself, she also works to understand implementation constraints.',
    k ? '디자이너, 엔지니어, 연구자, 헬스케어 전문가, 산업 파트너, 스타트업 팀과 협업해왔어요. 예를 들어:' : 'She has worked with designers, engineers, researchers, healthcare experts, industry partners and startup teams, for example:',
    picksFor(['honda-spatial', 'ethicon-care'], k),
  ],
  ai: k => [
    k ? '네, AI 관련 프로젝트를 여러 번 했어요. 특히 AI가 무엇을 하는지 사용자가 이해할 수 있게 돕는 인터페이스에 관심이 많아요.' : 'Yes. Jumin has worked on several AI projects and is particularly interested in interfaces that help people understand what AI systems are doing.',
    picksFor(['bubbas-production', 'ethicon-care', 'haily', 'story-authoring'], k),
    k ? `여기에 USC 여름 CS 프로그램에서 70명 학생 대상의 AI 보조 개발(프롬프트 엔지니어링, 멀티에이전트 워크플로) 커리큘럼을 함께 만들었어요.` : 'She also co-developed an AI-assisted development curriculum (prompt engineering, multi-agent workflows, automation) for 70 students in USC’s summer CS program.',
  ],
  aiView: k => [
    k ? 'Jumin은 AI가 아이디어 탐색, 반복 작업 줄이기, 복잡한 정보 탐색, 기존 워크플로 지원에 가장 유용하다고 봐요. AI 결과를 자동으로 신뢰해선 안 되고, 사용자·안전·중요한 결정·사실 정보에 영향을 줄 때는 꼭 검토해야 한다고 생각해요.' : 'Jumin sees AI as most useful when it helps people explore ideas, reduce repetitive work, navigate complex information and support existing workflows. She doesn’t think AI output should be trusted automatically: anything affecting users, safety, important decisions or facts should be reviewed, and human judgment stays important.',
    k ? '그래서 AI 시스템은 정확성, 투명성, 사람의 검토, 사용자 제어, 프라이버시, 적절한 데이터 사용을 고려해 디자인해야 한다고 봐요. 인터페이스로 AI의 능력과 한계를 이해시키는 데 관심이 많아요.' : 'She believes AI systems should be designed for accuracy, transparency, human review, user control, privacy and appropriate use of data, and she’s interested in how interface design can make an AI’s capabilities and limits clear.',
  ],
  teaching: k => [
    k ? 'USC에서 교육 프로그램을 지원했어요:' : 'Jumin has supported teaching at USC:',
    bullets([...experience('USC Thomas').highlights, ...experience('USC Iovine').highlights]),
  ],
  education: k => [
    k ? '학력이에요:' : 'Education:',
    bullets(resume.education.map(item => `**${item.school}** — ${item.degree} (${item.period})`)),
    k ? '디자인과 게임 소프트웨어를 함께 공부해서, 사용자 경험과 제품이 기술적으로 어떻게 만들어지는지를 둘 다 생각할 수 있어요.' : 'Studying both design and game software gave her a feel for both the user experience and how digital products are technically built.',
  ],
  experience: k => [
    k ? 'Jumin의 경력이에요(2026 이력서 기준):' : 'Jumin’s experience (from her 2026 resume):',
    bullets(resume.experience.map(item => `**${item.organization}** — ${item.title} (${item.period}). ${item.highlights[0]}`)),
    `[${k ? '이력서 PDF' : 'Resume (PDF)'}](${resumeUrl})`,
  ],
  tools: k => [
    k ? '주요 스킬이에요(이력서 기준):' : 'Her skills, from her resume:',
    bullets([
      `**${k ? '리서치' : 'Research'}** — ${resume.skills.research.join(', ')}`,
      `**${k ? '디자인' : 'Design'}** — ${resume.skills.design.join(', ')}`,
      `**Web** — ${resume.skills.web.join(', ')}`,
      `**AI** — ${resume.skills.ai.join(', ')}`,
    ]),
  ],
  publications: k => [
    k ? '연구와 논문이에요:' : 'Research and publications:',
    bullets([...resume.research.map(item => `**${item.organization}** — ${item.highlights.join(' ')} (${item.period})`)]),
    `[Google Scholar](${profile.scholar}) · [${k ? '리서치 페이지' : 'Research page'}](/research/)`,
  ],
  awards: k => [
    k ? '수상 이력이에요:' : 'Awards and recognition:',
    bullets(profile.recognition.map(item => `${item.title} (${item.year})`)),
  ],
  contact: k => [
    k ? 'Jumin에게는 이메일이 가장 빨라요.' : 'Email is the best way to reach Jumin.',
    bullets([`[${profile.email}](mailto:${profile.email})`, `[LinkedIn](${profile.linkedin})`, `[${k ? '이력서 PDF' : 'Resume (PDF)'}](${resumeUrl})`]),
  ],
  next: k => [
    k ? 'Jumin은 UX 디자이너, 프로덕트 디자이너, 디자인 엔지니어, UX 엔지니어, UX/프론트엔드 개발자, 휴먼-AI 인터랙션 디자이너, AI 프로덕트 디자이너 같은 역할에 관심이 있어요. 가장 강한 포지션은 디자인 + 기술 + 휴먼-AI 인터랙션이 만나는 지점이에요.'
      : 'Jumin is interested in roles such as UX Designer, Product Designer, Design Engineer, UX Engineer, UX / Front-end Developer, Human-AI Interaction Designer and AI Product Designer. Her strongest positioning is where design, technology and human-AI interaction meet.',
    k ? `USC 석사는 ${resume.education[0].period.split(' - ')[1]} 졸업 예정이에요. 구체적인 기회는 [${profile.email}](mailto:${profile.email})로 연락해 주세요.` : `She expects to finish her M.S. at USC in ${resume.education[0].period.split(' - ')[1]}. For a specific opportunity, email [${profile.email}](mailto:${profile.email}).`,
  ],
  location: k => [
    k ? `Jumin은 ${profile.location}에 있어요. 근무 형태 같은 구체적인 건 이메일로 문의해 주세요.` : `Jumin is based in ${profile.location}. For specifics like work arrangements, email her.`,
    `[${profile.email}](mailto:${profile.email})`,
  ],
  background: k => [...writers.kind(k).slice(0, 2), writers.education(k)[1], k ? '최근 경력: Bubba’s LA AI 리서치 인턴, Swim Up Hill 웹 개발 인턴, Macromill Embrain 리서처·디자이너 인턴.' : 'Recent experience includes Bubba’s LA (AI Research Intern), Swim Up Hill Foundation (Web Development & Internal Systems Intern) and Macromill Embrain (Researcher & Designer Intern).', `[${k ? '경력 자세히 보기' : 'Experience and background'}](/about/)`],
}

function writeRecommendation(question, k) {
  const role = detectRole(` ${question.toLowerCase()} `)
  if (!role) return [
    k ? '어떤 역할을 찾고 계신지 알려주시면 가장 관련 있는 2–4개를 골라드릴게요. UX 디자인, AI/HCI, 디자인 엔지니어링, UX 리서치, 헬스케어, 자동차 UX 중에 고를 수 있어요.' : 'Tell me what role you’re hiring for and I’ll pick the 2–4 most relevant projects: UX Design, AI / HCI, Design Engineering, UX Research, healthcare or automotive UX.',
    k ? '우선 시작하기 좋은 세 가지는:' : 'If you want a starting point, these three show her range:',
    picksFor(['bubbas-production', 'honda-spatial', 'ethicon-care'], k),
  ]
  const rec = recommendations[role]
  return [
    k ? `${rec.label[1]} 쪽이라면 이걸 먼저 보시길 추천해요:` : `For ${/^[aeio]/i.test(rec.label[0]) ? 'an' : 'a'} ${rec.label[0]} role, I’d start with:`,
    picksFor(rec.items.slice(0, 4), k),
    k ? `이 프로젝트들에서 ${rec.focus[1]}을(를) 볼 수 있어요.` : `They show ${rec.focus[0]}.`,
  ]
}

function writeProject(project, k) {
  const facts = (project.facts || []).map(fact => `${fact.label}: ${fact.value}`).join(' · ')
  return [
    `**${project.title}** — ${project.organization}, ${project.year}${project.duration ? ` (${project.duration})` : ''}`,
    project.introLead || project.summary,
    project.contribution ? `${k ? 'Jumin의 역할' : 'Jumin’s part'}: ${project.contribution}` : `${k ? '역할' : 'Role'}: ${project.role}`,
    project.outcome ? `${k ? '결과' : 'Outcome'}: ${project.outcome}` : '',
    facts,
    `${k ? '케이스 스터디' : 'Case study'}: ${link(project)}`,
  ]
}

function writeUnknown(k) {
  return [
    k ? '그 내용은 제가 가진 포트폴리오 정보에 없어요. 정확한 답은 Jumin에게 직접 물어보시는 게 좋아요.' : 'That detail isn’t included in the portfolio information I have.',
    k ? '대신 이런 걸 물어보실 수 있어요: 강점, 어떤 디자이너인지, 코딩 경험, 리서치 경험, AI 경험, 역할별 추천 프로젝트, 특정 프로젝트 이름.' : 'I can help with her strengths, what kind of designer she is, coding and research experience, AI work, or which projects fit a role. You can also ask about any project by name.',
    `[${profile.email}](mailto:${profile.email})`,
  ]
}

export function localBrainAnswer(question) {
  const k = ko(question)
  const text = ` ${question.toLowerCase()} `
  const ranked = scoreTopics(question)
  const top = ranked[0]?.id
  const project = namedProject(question)

  let parts
  if (top === 'privacy') parts = writers.privacy(k)
  else if (top === 'recommend' || (/(for|role|position|hiring|채용|역할)/.test(text) && detectRole(text) && !project)) parts = writeRecommendation(question, k)
  else if (project && !['strengths', 'kind', 'experience', 'education', 'tools', 'contact', 'next'].includes(top)) parts = writeProject(project, k)
  else if (top && writers[top]) parts = writers[top](k)
  else if (detectRole(text)) parts = writeRecommendation(question, k)
  else parts = writeUnknown(k)

  return parts.filter(Boolean).join('\n\n')
}

// Follow-ups the chat offers; the pool rotates so the same three never repeat back to back.
export const suggestedQuestions = [
  'What is Jumin’s biggest strength?',
  'What kind of designer is Jumin?',
  'Does Jumin code?',
  'Does she have real user research experience?',
  'What AI work has she done?',
  'Which projects fit a Design Engineer role?',
  'How does she approach research?',
  'How does she work with developers?',
  'How can I contact her?',
  'What roles is she looking for?',
]
