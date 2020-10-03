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
export const oldtownroadVideo = 'Old Town Road (music video)';
export const threeblueonebrown = '3Blue1Brown (animation)';
export const drstrange = 'Dr Strange Trailer';
export const slideshow = 'Slideshow';
export const npr = 'NPR: Digging into "American Dirt" (podcast)';
export const righteous = 'Righteous (song)';
export const oldtownroadAudio = 'Old Town Road (song)';
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
    type: 'video',
    url: 'amazon.mp4',
  },
  [facebook]: {
    type: 'video',
    url: 'facebook.mp4',
  },
  [google]: {
    type: 'video',
    url: 'google.mp4'
  },
  [nyt]: {
    type: 'video',
    url: 'nytimes.mp4'
  },
  [parametric]: {
    type: 'video',
    url: null
  },
  [oldtownroadVideo]: {
    type: 'video',
    url: 'oldtownroad.mp4'
  },
  [threeblueonebrown]: {
    type: 'video',
    url: '3blue1brown.mp4',
  },
  [drstrange]: {
    type: 'video',
    url: 'drstrange.mp4',
  },
  [slideshow]: {
    type: 'video',
    url: 'slideshow.mp4',
  },
  [npr]: {
    type: 'image',
    url: 'podcast.png'
  },
  [righteous]: {
    type: 'image',
    url: 'song.png'
  },
  [oldtownroadAudio]: {
    type: 'image',
    url: 'oldtownroad.jpg'
  },
  [thedaily]: {
    type: 'image',
    url: 'thedaily.png'
  }
};

export const debounceTimer = 200;