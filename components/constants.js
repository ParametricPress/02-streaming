export const markColor = '#CCCCCC';  // white
export const secondaryMarkColor = '#666666';  // lighter grey
export const accentColor = '#d1ff99';  // parametric green
export const darkAccentColor = 'transparent'  // darker paremtric green
export const labelColor = '#444444';
export const guideColor = '#333333';
export const textColor = '#EEEEEE';
export const backgroundColor = '#222222';
export const font = 'Graphik Web, Helvetica, sans-serif'

export const co2PerMeter = 251;

export const amazon = 'Amazon (product page)';
export const facebook = 'Facebook (newsfeed)';
export const google = 'Google (search result)';
export const nyt = 'The New York Times (interactive article)';
export const parametric = 'Parametric Press (you are here)';
export const oldtownroadVideo = 'Lil Nas X: Old Town Road (music video)';
export const threeblueonebrown = '3Blue1Brown: The most unexpected answer to a counting puzzle';
export const drstrange = 'Dr Strange Trailer';
export const slideshow = 'Slideshow';
export const npr = 'NPR: Digging into "American Dirt"';
export const righteous = 'Righteous (song)';
export const oldtownroadAudio = 'Lil Nas X: Old Town Road (song)';
export const thedaily = 'The Daily (podcast)';

export const typeOrder = [
  'website',
  'audio',
  'video'
]

export const titleOrder = [
  parametric,
  google,
  nyt,
  amazon,
  facebook,
  npr,
  oldtownroadAudio,
  threeblueonebrown,
  oldtownroadVideo
];

export const titleToPreview= {
  [amazon]: {
    preview: true,
    url: 'amazon.mp4',
    link: 'https://www.amazon.com/Uninhabitable-Earth-Life-After-Warming/dp/0525576711/ref=sr_1_8?dchild=1&keywords=climate+change&qid=1602823273&sr=8-8'
  },
  [facebook]: {
    preview: true,
    url: 'facebook.mp4',
    link: 'https://www.facebook.com'
  },
  [google]: {
    preview: true,
    url: 'google.mp4',
    link: 'https://www.google.com/search?sxsrf=ALeKk00O79kGgr0mBB9CXZiHW4rWbwUw2Q%3A1602823226434&source=hp&ei=OiSJX6H9F7aS0PEPvbS-kAk&q=climate+change&oq=climate+change&gs_lcp=CgZwc3ktYWIQAzIHCCMQyQMQJzICCAAyCggAELEDEIMBEEMyBQgAELEDMgIIADICCAAyBQgAELEDMggIABCxAxCDATIICAAQsQMQgwEyAggAOgQIIxAnOgUIABCRAjoLCC4QsQMQxwEQowI6CAguELEDEIMBOgUILhCxAzoECC4QQzoHCAAQsQMQQzoHCC4QsQMQQzoLCC4QsQMQxwEQrwE6BAgAEEM6CAguEMcBEK8BOgUIABDJAzoFCAAQkgNQqQZYvA5gnA9oAHAAeACAAWmIAaYJkgEEMTIuMpgBAKABAaoBB2d3cy13aXo&sclient=psy-ab&ved=0ahUKEwihgrDopbjsAhU2CTQIHT2aD5IQ4dUDCAk&uact=5'
  },
  // [nyt]: {
  //   type: 'video',
  //   url: 'nytimes.mp4'
  // },
  [parametric]: {
    preview: true,
    url: 'parametricpress.mp4'
  },
  [oldtownroadVideo]: {
    preview: false,
    link: 'https://www.youtube.com/watch?v=w2Ov5jzm3j8'
  },
  [threeblueonebrown]: {
    preview: false,
    link: 'https://www.youtube.com/watch?v=HEfHFsfGXjs&vl=it',
  },
  // [drstrange]: {
  //   preview: false,
  //   url: 'drstrange.mp4',
  // },
  // [slideshow]: {
  //   preview: false,
  //   url: 'slideshow.mp4',
  // },
  [npr]: {
    preview: false,
    link: 'https://www.npr.org/2020/01/29/800964001/digging-into-american-dirt'
  },
  // [righteous]: {
  //   preview: false,
  //   url: 'song.png'
  // },
  [oldtownroadAudio]: {
    preview: false,
    link: 'https://open.spotify.com/track/2YpeDb67231RjR0MgVLzsG?si=xT8IPnGLQrGiY2hjIazJtw',
  },
  // [thedaily]: {
  //   preview: false,
  //   url: 'thedaily.png'
  // }
};

export const debounceTimer = 200;