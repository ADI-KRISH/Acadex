// ── Mock data used when backend is not connected ──
// To use real backend: set VITE_API_URL in .env

export const MOCK_USER = {
  id: 'u1',
  name: 'Ihsal Riyas',
  initials: 'IR',
  rollNo: 'AM.SC.U4AIE23037',
  role: 'student',          // change to 'cr' to test CR features
  classId: 'cs',
  email: 'ihsal@amrita.edu',
};

export const MOCK_QUESTIONS = [
  {
    id: '1',
    title: "How does Lowe's ratio test work in SIFT matching?",
    body: "I understand SIFT keypoints but I'm confused about what ratio threshold to pick and why 0.75 is standard. Does it change per image? I'm running it on two book cover images in Google Colab and the matches look reasonable but I'm not confident about the threshold choice.",
    tags: ['cv', 'python'],
    classId: 'cv',
    className: 'CV Lab',
    author: { id: 'u2', name: 'Raymics S.', initials: 'RS' },
    answers: 3, votes: 7, solved: true, pinned: true,
    createdAt: '2026-04-28T08:12:00Z',
    mine: false,
  },
  {
    id: '2',
    title: "Difference between Otsu's threshold and manual threshold in Canny?",
    body: "We used both in lab — when do I choose one over the other? Also why does Otsu fail on bimodal histograms?",
    tags: ['cv', 'exam'],
    classId: 'cv',
    className: 'CV Lab',
    author: { id: 'u1', name: 'Ihsal Riyas', initials: 'IR' },
    answers: 2, votes: 5, solved: true, pinned: false,
    createdAt: '2026-04-27T14:30:00Z',
    mine: true,
  },
  {
    id: '3',
    title: "Lucas-Kanade optical flow — what is the brightness constancy assumption?",
    body: "The assignment asks to derive the OF equation but I don't get why we assume brightness is constant. What breaks if it isn't?",
    tags: ['cv', 'exam'],
    classId: 'cv',
    className: 'CV Lab',
    author: { id: 'u3', name: 'Dhruv Nair', initials: 'DN' },
    answers: 1, votes: 4, solved: false, pinned: false,
    createdAt: '2026-04-27T10:00:00Z',
    mine: false,
  },
  {
    id: '4',
    title: "How to add JWT authentication in Node.js for the SE project backend?",
    body: "We decided on JWT for the academic platform. Anyone done this before? What library is best?",
    tags: ['se', 'python'],
    classId: 'se',
    className: 'SE Lab',
    author: { id: 'u4', name: 'Aditya K.', initials: 'AK' },
    answers: 4, votes: 9, solved: true, pinned: false,
    createdAt: '2026-04-26T09:00:00Z',
    mine: false,
  },
  {
    id: '5',
    title: "WSN energy harvesting — difference between solar and thermal TEG?",
    body: "Lab sheet says to compare harvesting approaches. Can't find a clear comparison. TEG seems less practical?",
    tags: ['wsn', 'exam'],
    classId: 'cs',
    className: 'CSE-AI A',
    author: { id: 'u5', name: 'Priya M.', initials: 'PM' },
    answers: 0, votes: 2, solved: false, pinned: false,
    createdAt: '2026-04-25T16:00:00Z',
    mine: false,
  },
  {
    id: '6',
    title: "BLOB detection — why does scale-space LoG work better than DoG?",
    body: "Prof mentioned LoG is theoretically correct but DoG is used in practice. Why is that and do marks care?",
    tags: ['cv'],
    classId: 'cv',
    className: 'CV Lab',
    author: { id: 'u6', name: 'Kiran A.', initials: 'KA' },
    answers: 2, votes: 6, solved: false, pinned: false,
    createdAt: '2026-04-24T11:00:00Z',
    mine: false,
  },
];

export const MOCK_ANSWERS = {
  '1': [
    {
      id: 'a1', questionId: '1',
      body: "Lowe's ratio test compares the distance to the best match against the second-best match. The 0.75 threshold means: only keep the match if the best is at most 75% as distant as the second-best. Lower threshold = stricter = fewer but better matches. For textbook images with clean features, 0.7 works well. For noisy photos, try 0.8. It's an empirical parameter — Lowe chose 0.75 as a good default in his 2004 paper based on ROC curves.",
      author: { id: 'u1', name: 'Ihsal Riyas', initials: 'IR' },
      votes: 12, accepted: true,
      createdAt: '2026-04-28T09:00:00Z',
    },
    {
      id: 'a2', questionId: '1',
      body: "Also worth noting: the ratio test is applied after finding the two nearest neighbours in feature space using a KD-tree or FLANN. The cv2.BFMatcher with knnMatch(k=2) does exactly this. So always use knnMatch not just match.",
      author: { id: 'u3', name: 'Dhruv Nair', initials: 'DN' },
      votes: 6, accepted: false,
      createdAt: '2026-04-28T09:45:00Z',
    },
  ],
  '2': [
    {
      id: 'a3', questionId: '2',
      body: "Otsu automatically finds the threshold that minimises intra-class variance — great for bimodal histograms with a clear valley. It fails on multimodal images. Manual thresholding gives control but requires domain knowledge. For Canny, Otsu is typically used only for the upper threshold, with the lower set at half that value.",
      author: { id: 'u2', name: 'Raymics S.', initials: 'RS' },
      votes: 8, accepted: true,
      createdAt: '2026-04-27T15:00:00Z',
    },
  ],
};

export const MOCK_REMINDERS = [
  { id: 'r1', title: 'CV Lab 6 Submission', classId: 'cv', className: 'CV Lab', dueDate: '2026-04-29', priority: 'urgent' },
  { id: 'r2', title: 'SE Lab Sheet 3', classId: 'se', className: 'SE Lab', dueDate: '2026-05-01', priority: 'soon' },
  { id: 'r3', title: 'WSN Assignment 2', classId: 'cs', className: 'CSE-AI A', dueDate: '2026-05-03', priority: 'soon' },
  { id: 'r4', title: 'Mid-Semester Exam', classId: 'all', className: 'All', dueDate: '2026-05-10', priority: 'normal' },
];

export const MOCK_MESSAGES = {
  cs: [
    { id: 'm1', name: 'Ihsal Riyas', initials: 'IR', text: 'Has anyone started CV Lab 6? The SIFT matching is killing me', time: '10:12', mine: true, color: '#3ccf91' },
    { id: 'm2', name: 'Dhruv Nair', initials: 'DN', text: 'Yeah the ratio test part tripped me up. Use 0.75 and it mostly works', time: '10:15', mine: false, color: '#5cb8e4' },
    { id: 'm3', name: 'Raymics S.', initials: 'RS', text: 'I got it working. Will post on the forum with explanation', time: '10:18', mine: false, color: '#7c6af7' },
    { id: 'm4', name: 'Aditya K.', initials: 'AK', text: 'Also reminder that SE Lab sheet 3 is due Friday. Elaboration phase diagrams', time: '10:22', mine: false, color: '#f6a623' },
    { id: 'm5', name: 'Priya M.', initials: 'PM', text: 'Yes please! Share in the forum or here', time: '10:26', mine: false, color: '#f25f5c' },
  ],
  se: [
    { id: 'm6', name: 'Aditya K.', initials: 'AK', text: 'SE Lab sheet 3 — anyone done the elaboration diagrams?', time: '11:00', mine: false, color: '#f6a623' },
    { id: 'm7', name: 'Ihsal Riyas', initials: 'IR', text: 'Working on the class diagram now', time: '11:05', mine: true, color: '#3ccf91' },
  ],
};

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'answer', text: 'Raymics S. answered your question on SIFT ratio test', time: '1h ago', read: false, link: '/question/1' },
  { id: 'n2', type: 'reminder', text: 'CR posted: CV Lab 6 due tomorrow', time: '3h ago', read: false, link: '/reminders' },
  { id: 'n3', type: 'vote', text: 'Dhruv Nair upvoted your answer on Otsu\'s method', time: '5h ago', read: true, link: '/question/2' },
  { id: 'n4', type: 'answer', text: 'Faculty commented on the SE Lab discussion', time: '1d ago', read: true, link: '/question/4' },
];

export const CLASS_MAP = {
  cs: { label: 'CSE-AI A', color: '#3ccf91' },
  ds: { label: 'CSE-AI B', color: '#5cb8e4' },
  se: { label: 'SE Lab', color: '#f6a623' },
  cv: { label: 'CV Lab', color: '#f25f5c' },
};

export const TAG_LABELS = {
  cv: 'Computer Vision',
  se: 'Software Engg',
  wsn: 'WSN',
  python: 'Python',
  exam: 'Exam Help',
  general: 'General',
};
