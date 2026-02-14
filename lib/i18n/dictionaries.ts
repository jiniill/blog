const ko = {
  nav: {
    home: "Home",
    blog: "Blog",
    archive: "Archive",
    about: "About",
  },
  home: {
    greeting: "안녕하세요,",
    welcome: "블로그에 오신 걸 환영합니다.",
    description: "개발, 기술, 그리고 다양한 생각을 기록하는 공간입니다.",
    cta: "글 보러가기",
    recentPosts: "최근 글",
    popularPosts: "인기 글",
    noPosts: "아직 작성된 글이 없습니다.",
    noPopularPosts: "아직 집계된 인기 글이 없습니다.",
    views: "조회 {count}회",
  },
  blog: {
    title: "Blog",
    description: "블로그 글 목록",
    noPosts: "아직 작성된 글이 없습니다.",
  },
  post: {
    author: "저자:",
    source: "원문:",
    reference: "참고:",
    prevPost: "이전 글",
    nextPost: "다음 글",
  },
  readingTime: {
    short: "짧게 읽기",
    light: "가볍게 읽기",
    moderate: "천천히 읽기",
    deep: "깊이 읽기",
  },
  toc: {
    title: "목차",
  },
  search: {
    placeholder: "검색어를 입력하세요...",
    clearQuery: "검색어 지우기",
    noResults: "검색 결과가 없습니다",
    noTagResults: "선택한 태그의 글이 없습니다",
    noPosts: "게시글이 없습니다",
    noTags: "표시할 태그가 없습니다.",
    ariaLabel: "검색 (⌘K)",
    keyMove: "이동",
    keyOpen: "열기",
    keyClose: "닫기",
  },
  subscribe: {
    title: "뉴스레터 구독",
    close: "닫기",
    success: "구독이 완료되었습니다!",
    successDetail: "환영 이메일을 확인해주세요.",
    description: "새로운 글이 발행되면 이메일로 알려드립니다.",
    emailPlaceholder: "이메일 주소를 입력하세요",
    submitting: "처리 중...",
    submit: "구독하기",
    defaultError: "구독 처리 중 오류가 발생했습니다.",
    networkError: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
    ctaTitle: "새 글 알림 받기",
    ctaDescription: "새로운 글이 발행되면 이메일로 알려드립니다.",
    ctaButton: "뉴스레터 구독하기",
    headerButton: "Subscribe",
  },
  archive: {
    title: "Archive",
    description: "연도별 글 아카이브",
    yearSuffix: "년",
    noPosts: "아직 작성된 글이 없습니다.",
  },
  about: {
    title: "About",
    description: "jiniill 소개",
  },
  tags: {
    title: "Tags",
    description: "태그 목록",
    noTags: "태그가 없습니다.",
    postCount: "{count}개의 글",
    taggedPostsDescription: "\"{tag}\" 태그가 달린 글 목록",
  },
  common: {
    backToTop: "맨 위로 이동",
  },
  meta: {
    menuOpen: "메뉴 열기",
    menuClose: "메뉴 닫기",
  },
  series: {
    ariaLabel: "{name} 시리즈 내비게이션",
  },
  language: {
    switchTo: "English",
    current: "한국어",
    code: "KO",
    noTranslation: "이 글의 영어 버전은 아직 없습니다.",
  },
} as const;

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

const en: DeepStringRecord<typeof ko> = {
  nav: {
    home: "Home",
    blog: "Blog",
    archive: "Archive",
    about: "About",
  },
  home: {
    greeting: "Hello,",
    welcome: "Welcome to my blog.",
    description: "A space for writing about development, technology, and ideas.",
    cta: "Read posts",
    recentPosts: "Recent Posts",
    popularPosts: "Popular Posts",
    noPosts: "No posts yet.",
    noPopularPosts: "No popular posts yet.",
    views: "{count} views",
  },
  blog: {
    title: "Blog",
    description: "Blog posts",
    noPosts: "No posts yet.",
  },
  post: {
    author: "Author:",
    source: "Source:",
    reference: "Reference:",
    prevPost: "Previous",
    nextPost: "Next",
  },
  readingTime: {
    short: "Quick read",
    light: "Light read",
    moderate: "Moderate read",
    deep: "Deep read",
  },
  toc: {
    title: "On this page",
  },
  search: {
    placeholder: "Search posts...",
    clearQuery: "Clear search",
    noResults: "No results found",
    noTagResults: "No posts with selected tags",
    noPosts: "No posts",
    noTags: "No tags available.",
    ariaLabel: "Search (⌘K)",
    keyMove: "Navigate",
    keyOpen: "Open",
    keyClose: "Close",
  },
  subscribe: {
    title: "Newsletter",
    close: "Close",
    success: "Subscribed successfully!",
    successDetail: "Please check your welcome email.",
    description: "Get notified when new posts are published.",
    emailPlaceholder: "Enter your email",
    submitting: "Subscribing...",
    submit: "Subscribe",
    defaultError: "An error occurred while subscribing.",
    networkError: "Network error. Please try again.",
    ctaTitle: "Stay updated",
    ctaDescription: "Get notified when new posts are published.",
    ctaButton: "Subscribe to newsletter",
    headerButton: "Subscribe",
  },
  archive: {
    title: "Archive",
    description: "Posts by year",
    yearSuffix: "",
    noPosts: "No posts yet.",
  },
  about: {
    title: "About",
    description: "About jiniill",
  },
  tags: {
    title: "Tags",
    description: "All tags",
    noTags: "No tags yet.",
    postCount: "{count} posts",
    taggedPostsDescription: "Posts tagged with \"{tag}\"",
  },
  common: {
    backToTop: "Back to top",
  },
  meta: {
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  series: {
    ariaLabel: "{name} series navigation",
  },
  language: {
    switchTo: "한국어",
    current: "English",
    code: "EN",
    noTranslation: "No Korean version available for this post.",
  },
} as const;

export const dictionaries = { ko, en } as const;

export type Dictionary = DeepStringRecord<typeof ko>;
