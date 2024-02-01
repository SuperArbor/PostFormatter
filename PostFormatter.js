/* eslint-disable object-property-newline */
// ==UserScript==
// @name         Post Formatter
// @description  Format upload info and smilies
// @version      1.3.2.0
// @author       Anonymous inspired by Secant(TYT@NexusHD)
// @match        *.nexushd.org/*
// @match        pterclub.com/*
// @match        pt.sjtu.edu.cn/*
// @match        kp.m-team.cc/*
// @match        totheglory.im/*
// @match        greatposterwall.com/*
// @match        uhdbits.org/*
// @grant        GM_xmlhttpRequest
// @require      https://cdn.staticfile.org/jquery/2.1.4/jquery.js
// @require      https://code.jquery.com/jquery-migrate-1.0.0.js
// @icon         http://www.nexushd.org/favicon.ico
// @namespace    d8e7078b-abee-407d-bcb6-096b59eeac17
// @license      MIT
// ==/UserScript==
//= ========================================================================================================
// constants
const $ = window.jQuery
const NHD = 'NHD'; const PTER = 'PTER'; const PUTAO = 'PUTAO'; const MTEAM = 'MTEAM'; const TTG = 'TTG'
const GPW = 'GPW'; const UHD = 'UHD'
const NEXUSPHP = 'nexusphp'; const GAZELLE = 'gazelle'
const PIXHOST = 'pixhost'; const IMGBOX = 'imghost'; const IMG4K = 'img4k'
const PTERCLUB = 'pterclub'; const IMGPILE = 'imgpile'; const PTPIMG = 'ptpimg'
// compare with comparison (GPW style)
const regexTeam = /\b(?:(?:\w[\w()-. ]+)|(?:D-Z0N3)|(?:de\[42\]))/i
const regexTeamsSplitter = /\||,|\/|-|>?\s*vs\.?\s*<?/i
const regexNormalUrl = /[A-Za-z0-9\-._~!$&'()*+;=:@/?]+/i
const regexImageUrl = RegExp(
  'https?:' + regexNormalUrl.source + '?\\.(?:png|jpg)',
  'i')
// const regexScreenshotsComparison = /\[comparison=(\b\w[\w()-.[\] ]+\s*(,\s*\b\w[\w()-.[\] ]+?)+)\](\s*([^, [\]]+(\s+|\s*,)\s*)+[^, [\]]+)\[\/comparison\]/mi
const regexScreenshotsComparison = RegExp(
  '\\[comparison=(' +
  regexTeam.source + '\\s*(?:,\\s*' + regexTeam.source +
  '?)+)\\](\\s*(?:' +
  regexImageUrl.source + '(?:\\s+|\\s*,)\\s*)+' + regexImageUrl.source +
  ')\\s*\\[\\/comparison\\]',
  'mig')
// compare with thumbs
// const regexScreenshotsThumbs = /(\s*(\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\])?\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\](\[\/url\])?\s*)+/mi
const regexScreenshotsThumbsCombined = RegExp(
  '((?:\\s*(\\[url=' +
  regexNormalUrl.source + '?\\])?\\s*\\[img\\]' +
  regexImageUrl.source + '?\\[\\/img\\]\\s*(?:\\[\\/url\\])?\\s*)+)',
  'mi')
const regexScreenshotsThumbsSeparated = RegExp(
  '(\\[url=' +
  regexNormalUrl.source + '?\\])?\\s*\\[img\\]' +
  regexImageUrl.source + '?\\[\\/img\\]\\s*(?:\\[\\/url\\])?',
  'mig')
const regexImageUrlsSeparated = RegExp(
  '(' + regexImageUrl.source + ')',
  'mig')
// 两种截图模式，第一种是包含[box|hide|expand|spoiler|quote=]标签的
// possible splitters for teams: '|',',','/','-','vs'
// const regexScreenshotsThumbsBoxed = /\[(box|hide|expand|spoiler|quote)\s*=\s*(\b\w[\w()-.[\] ]+(\s*(\||,|\/|-|>?\s*vs\.?\s*<?)\s*\b\w[\w()-.[\] ]+)+)\]((\s*(\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\])?\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\](\[\/url\])?\s*)+)\[\/\1\]/mi
const regexScreenshotsThumbsBoxed = RegExp(
  '\\[(box|hide|expand|spoiler|quote)\\s*=\\s*(' +
  regexTeam.source + '(?:\\s*(?:' + regexTeamsSplitter.source + ')\\s*' + regexTeam.source +
  ')+)\\]' +
  regexScreenshotsThumbsCombined.source +
  '\\s*\\[\\/\\1\\]',
  'mig')
// 第二种不包含[box|hide|expand|spoiler|quote=]标签，要求Source, Encode与截图之间至少有一个换行符
const regexScreenshotsThumbsTitled = RegExp(
  '^\\W*(' +
  regexTeam.source + '(?:\\s*(?:' + regexTeamsSplitter.source + ')\\s*' + regexTeam.source +
  ')+)[\\W]*\\n+\\s*' +
  regexScreenshotsThumbsCombined.source,
  'mig')
const regexScreenshotsSimple = RegExp(
  '(?:\\[b\\])?Screenshots(?:\\[\\/b\\])?\\s*(\\[img\\]' + regexImageUrl + '\\s*\\[\\/img\\]+)',
  'mig')
const regexInfo = {
  boxed: { regex: regexScreenshotsThumbsBoxed, groupForTeams: 2, groupForUrls: 3, groupForThumbs: 4 },
  titled: { regex: regexScreenshotsThumbsTitled, groupForTeams: 1, groupForUrls: 2, groupForThumbs: 3 },
  comparison: { regex: regexScreenshotsComparison, groupForTeams: 1, groupForUrls: 2, groupForThumbs: -1 },
  simple: { regex: regexScreenshotsSimple, groupForTeams: -1, groupForUrls: 1, groupForThumbs: -1 }
}
const siteInfoMap = {
  NHD: {
    construct: NEXUSPHP,
    targetTagBox: 'box',
    boxSupportDescr: true,
    otherTagBoxes: ['hide', 'spoiler', 'expand'].join('|'),
    unsupportedTags: ['align'].join('|'),
    decodingMediainfo: false,

    inputFile: $('input[type="file"][name="file"]'),
    nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"), anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"), doubanLinkBox: $("input[name='douban_url']"),
    categorySel: $('#browsecat'), sourceSel: $("select[name='source_sel']"), standardSel: $("select[name='standard_sel']"), processingSel: $("select[name='processing_sel']"), codecSel: $("select[name='codec_sel']"),

    catDefault: 0, catMovie: 101, catTvSeries: 102, catTvShow: 103, catDocumentary: 104, catAnimation: 105,
    sourceDefault: 0, sourceBluray: 1, sourceHddvd: 2, sourceDvd: 3, sourceHdtv: 4, sourceWebDl: 7, sourceWebrip: 9,
    standardDefault: 0, standard1080p: 1, standard1080i: 2, standard720p: 3, standard2160p: 6, standardSd: 4,
    processDefault: 0, processRaw: 1, processEncode: 2,
    codecDefault: 0, codecH264: 1, codecH265: 2, codecVc1: 3, codecXvid: 4, codecMpeg2: 5, codecFlac: 10, codecApe: 11
  },
  PTER: {
    construct: NEXUSPHP,
    targetBoxTag: 'hide',
    boxSupportDescr: true,
    otherTagBoxes: ['box', 'spoiler', 'expand'].join('|'),
    unsupportedTags: ['align'].join('|'),
    decodingMediainfo: true,

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"),
    anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"), doubanLinkBox: $("input[name='douban']"),
    categorySel: $('#browsecat'), sourceSel: $("select[name='source_sel']"), areaSel: $("select[name='team_sel']"),
    chsubCheck: $('#zhongzi')[0], englishSubCheck: $('#ensub')[0], chdubCheck: $('#guoyu')[0], cantodubCheck: $('#yueyu')[0],

    catDefault: 0, catMovie: 401, catTvSeries: 404, catTvShow: 405, catDocumentary: 402, catAnimation: 403,
    sourceDefault: 0, sourceBluray: 2, sourceRemux: 3, sourceEncode: 6, sourceHdtv: 4, sourceWebDl: 5, sourceDvd: 7,
    areaDefault: 0, areaCnMl: 1, areaHk: 2, areaTw: 3, areaEuAme: 4, areaKor: 5, areaJap: 6, areaInd: 7, areaOther: 8
  },
  PUTAO: {
    construct: NEXUSPHP,
    targetTagBox: '',
    boxSupportDescr: true,
    otherTagBoxes: ['box', 'hide', 'spoiler', 'expand'].join('|'),
    unsupportedTags: ['align', 'center'].join('|'),
    decodingMediainfo: false,

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"),
    anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"), doubanLinkBox: $("input[name='douban_url']"),
    categorySel: $('#browsecat'), standardSel: $("select[name='standard_sel']"), codecSel: $("select[name='codec_sel']"),

    catDefault: 0, catDocumentary: 406, catAnimation: 431, catMovieCnMl: 401, catMovieEuAme: 402,
    catMovieAsia: 403, catTvSeriesHkTw: 407, catTvSeriesAsia: 408, catTvSeriesCnMl: 409, catTvSeriesEuAme: 410,
    catTvShowCnMl: 411, catTvShowHkTw: 412, catTvShowEuAme: 413, catTvShowJpKor: 414,
    standardDefault: 0, standard1080p: 1, standard1080i: 2, standard720p: 3, standard2160p: 6, standardSd: 4,
    codecDefault: 0, codecH264: 1, codecVc1: 2, codecXvid: 3, codecMpeg2: 4, codecFlac: 5, codecApe: 6, codecH265: 10
  },
  MTEAM: {
    construct: NEXUSPHP,
    targetTagBox: 'expand',
    boxSupportDescr: false,
    otherTagBoxes: ['box', 'hide', 'spoiler'].join('|'),
    unsupportedTags: ['align'].join('|'),
    decodingMediainfo: true,

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"),
    anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"),
    categorySel: $('#browsecat'), teamSel: $("select[name='team_sel']"), standardSel: $("select[name='standard_sel']"), areaSel: $("select[name='processing_sel']"), codecSel: $("select[name='codec_sel']"),
    chsubCheck: $("input[type='checkbox'][name='l_sub']")[0], chdubCheck: $("input[type='checkbox'][name='l_dub']")[0],

    catDefault: 0, catMovieHd: 419, catMovieRemux: 439, catTvSeriesHd: 402, catDocumentary: 404, catAnimation: 405,
    areaCnMl: 1, areaEuAme: 2, areaHk: 3, areaTw: 3, areaJap: 4, areaKor: 5, areaOther: 6,
    standardDefault: 0, standard1080p: 1, standard1080i: 2, standard720p: 3, standard2160p: 6, standardSd: 5,
    codecDefault: 0, codecH264: 1, codecVc1: 2, codecH265: 16, codecXvid: 3, codecMpeg2: 4, codecFlac: 5, codecApe: 10
  },
  TTG: {
    construct: NEXUSPHP,
    targetTagBox: '',
    boxSupportDescr: false,
    otherTagBoxes: ['box', 'hide', 'spoiler', 'expand'].join('|'),
    unsupportedTags: ['align'].join('|'),
    decodeMediaInfo: true,

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $("input[type='text'][name='name']"), nameBoxEdit: $("input[type='text'][name='name']"),
    descrBox: $('textarea[name="descr"]'), smallDescBox: $("input[type='text'][name='subtitle']"), subtitleBox: $("input[type='text'][name='highlight']"),
    imdbLinkBox: $("input[name='imdb_c'][type='text']"), doubanLinkBox: $("input[name='douban_id'][type='text']"),
    categorySel: $('select[name="type"]'), anonymousControl: $('select[name="anonymity"]'),

    catDefault: 0, catMovie720p: 52, catMovie1080ip: 53, catMovie2160p: 108,
    catDocumentary720p: 62, catDocumentary1080ip: 63,
    catTvSeriesEuAme: 87, catTvSeriesJap: 88, catTvSeriesKor: 99, catTvSeriesCnMl: 90, catTvSeriesHkTw: 90,
    catTvShowJap: 101, catTvShowKor: 103, catTvShow: 60
  },
  GPW: {
    construct: GAZELLE,
    targetTagBox: 'hide',
    boxSupportDescr: true,
    otherTagBoxes: ['box', 'spoiler', 'expand'].join('|'),
    unsupportedTags: ['align'].join('|'),
    decodingMediainfo: true,

    inputFile: $('#file'),
    mediainfoBox: $('textarea[name="mediainfo[]"]'), descrBox: $('#release_desc'),
    sourceSel: $('select[id="source"]'), codecSel: $('select[id="codec"]'), standardSel: $('select[id="resolution"]'), processingSel: $('select[id="processing"]'), containerSel: $('select[id="container"]'),
    hdr10Check: $('input[type="checkbox"][id="hdr10"]')[0], doviCheck: $('input[type="checkbox"][id="dolby_vision"]')[0],
    movieEditionCheck: $('input[type="checkbox"][id="movie_edition_information"]')[0], commentAudioClick: $("a:contains('评论音轨')")[0],
    dcClick: $("a:contains('导演剪辑版')")[0], ccClick: $("a:contains('标准收藏')")[0], theatricClick: $("a:contains('影院版')")[0],
    uncutClick: $("a:contains('未删减版')")[0], unratedClick: $("a:contains('未分级版')")[0], extendedClick: $("a:contains('加长版')")[0],

    mixedSubCheck: $('input[type="radio"][id="mixed_subtitles"]')[0], noSubCheck: $('input[type="radio"][id="no_subtitles"]')[0],
    otherSubtitlesDiv: $('div[id="other_subtitles"]'),
    chineseSimplifiedSubCheck: $('input[type="checkbox"][id="chinese_simplified"]')[0],
    chineseTraditionalSubCheck: $('input[type="checkbox"][id="chinese_traditional"]')[0],
    englishSubCheck: $('input[type="checkbox"][id="english"]')[0],
    japaneseSubCheck: $('input[type="checkbox"][id="japanese"]')[0],
    koreanSubCheck: $('input[type="checkbox"][id="korean"]')[0],
    frenchSubCheck: $('input[type="checkbox"][id="french"]')[0],
    germanSubCheck: $('input[type="checkbox"][id="german"]')[0],
    italianSubCheck: $('input[type="checkbox"][id="italian"]')[0],
    polishSubCheck: $('input[type="checkbox"][id="polish"]')[0],
    romanianSubCheck: $('input[type="checkbox"][id="romanian"]')[0],
    russianSubCheck: $('input[type="checkbox"][id="russian"]')[0],
    spanishSubCheck: $('input[type="checkbox"][id="spanish"]')[0],
    thaiSubCheck: $('input[type="checkbox"][id="thai"]')[0],
    turkishSubCheck: $('input[type="checkbox"][id="turkish"]')[0],
    vietnameseSubCheck: $('input[type="checkbox"][id="vietnamese"]')[0],
    hindiSubCheck: $('input[type="checkbox"][id="hindi"]')[0],
    greekSubCheck: $('input[type="checkbox"][id="greek"]')[0],
    swedishSubCheck: $('input[type="checkbox"][id="swedish"]')[0],
    azerbaijaniSubCheck: $('input[type="checkbox"][id="azerbaijani"]')[0],
    bulgarianSubCheck: $('input[type="checkbox"][id="bulgarian"]')[0],
    danishSubCheck: $('input[type="checkbox"][id="danish"]')[0],
    estonianSubCheck: $('input[type="checkbox"][id="estonian"]')[0],
    finnishSubCheck: $('input[type="checkbox"][id="finnish"]')[0],
    hebrewSubCheck: $('input[type="checkbox"][id="hebrew"]')[0],
    croatianSubCheck: $('input[type="checkbox"][id="croatian"]')[0],
    hungarianSubCheck: $('input[type="checkbox"][id="hungarian"]')[0],
    icelandicSubCheck: $('input[type="checkbox"][id="icelandic"]')[0],
    latvianSubCheck: $('input[type="checkbox"][id="latvian"]')[0],
    lithuanianSubCheck: $('input[type="checkbox"][id="lithuanian"]')[0],
    dutchSubCheck: $('input[type="checkbox"][id="dutch"]')[0],
    norwegianSubCheck: $('input[type="checkbox"][id="norwegian"]')[0],
    portugueseSubCheck: $('input[type="checkbox"][id="portuguese"]')[0],
    slovenianSubCheck: $('input[type="checkbox"][id="slovenian"]')[0],
    slovakSubCheck: $('input[type="checkbox"][id="slovak"]')[0],
    latinSubCheck: $('input[type="checkbox"][id="latin"]')[0],
    ukrainianSubCheck: $('input[type="checkbox"][id="ukrainian"]')[0],
    persianSubCheck: $('input[type="checkbox"][id="persian"]')[0],
    arabicSubCheck: $('input[type="checkbox"][id="arabic"]')[0],
    brazilianPortSubCheck: $('input[type="checkbox"][id="brazilian_port"]')[0],
    czechSubCheck: $('input[type="checkbox"][id="czech"]')[0],
    idonesianSubCheck: $('input[type="checkbox"][id="idonesian"]')[0],
    serbianSubCheck: $('input[type="checkbox"][id="serbian"]')[0],
    chdubCheck: $('input[type="checkbox"][id="chinese_dubbed"]')[0],

    maxScreenshots: 10,
    sourceDefault: '---', sourceBluray: 'Blu-ray', sourceWeb: 'WEB', sourceHdtv: 'HDTV', sourceDvd: 'DVD',
    codecDefault: '---', codecH264: 'H.264', codecH265: 'H.265', codecXvid: 'Xvid', codecDivX: 'DivX', codecX264: 'x264', codecX265: 'x265',
    standardDefault: '---', standard1080i: '1080i', standard1080p: '1080p', standard2160p: '2160p', standard720p: '720p', standardSd: '480p',
    processDefault: '---', processEncode: 'Encode', processRemux: 'Remux',
    containerDefault: '---', containerMkv: 'MKV', containerMp4: 'MP4', containerAvi: 'AVI'
  }
}
//= ========================================================================================================
// functions
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function nestExplode (inputText, targetBoxTag) {
  let outputText, c
  const pat1 = '\\[' +
          targetBoxTag + '((?:=[^\\]]+)?\\](?:(?!\\[\\/' +
          targetBoxTag + '\\])[\\s\\S])*\\[' +
          targetBoxTag + '(?:=[^\\]]+)?\\])'
  const pat2 = '(\\[\\/' +
          targetBoxTag + '\\](?:(?!\\[' +
          targetBoxTag + '(?:=[^\\]]+)?\\])[\\s\\S])*)\\[\\/' +
          targetBoxTag + '\\]'
  const regex1 = RegExp(pat1, 'g')
  const regex2 = RegExp(pat2, 'g')
  do {
    outputText = inputText.replace(regex1, '[quote$1').replace(regex2, '$1[/quote]')
    c = (inputText !== outputText)
    inputText = outputText
  } while (c)
  return outputText
}
function compactContent (inputText, targetBoxTag) {
  let outputText, c
  const pat1 = '(\\[\\/?(?:' + targetBoxTag + ')(?:=[^\\]]+)?\\])\\s+(\\S)'
  const pat2 = '(\\S)\\s+(\\[\\/?(?:' + targetBoxTag + ')(?:=[^\\]]+)?\\])'
  const pat3 = '(\\[' + targetBoxTag + '(?:=[^\\]]+)?\\](?:(?!\\[\\/)[\\s\\S])*\\[(?:font|b|i|u|color|size)(?:=[^\\]]+)?\\])\\n+([^\\n])'
  const regex1 = RegExp(pat1, 'g')
  const regex2 = RegExp(pat2, 'g')
  const regex3 = RegExp(pat3, 'g')
  do {
    outputText = inputText.replace(regex1, '$1$2').replace(regex2, '$1$2').replace(regex3, '$1$2')
    c = (inputText !== outputText)
    inputText = outputText
  } while (c)
  return outputText
}
function formatTorrentName (torrentName) {
  return (
    torrentName
      .replace(/(\.torrent)+$/, '')
      .replace(/^\s?(\[.*?\]\s?)+/gi, '')
      .replace(/\s?(\(\d+\)\s?)+$/gi, '')
      .replace(/(\.(mkv|mp4|avi|ts|wmv|mpg|torrent))+$/, '')
      .replace(/\bh\.(26[45])\b/gi, 'H/$1')
      .replace(/(\b[a-zA-Z]*\d{1,2})\.(\d{1,2}\b)/g, function (_, p1, p2) {
        return p1 + '/' + p2
      })
      .replace(/\b\((\d{4})\)\b/g, '$1')
      .replace(/\bWEB(?!-DL)\b/gi, 'WEB-DL')
      .replace(/\bweb-?rip\b/gi, 'WEBRip')
      .replace(/\bblu-?ray\b/gi, 'BluRay')
      .replace(/\bdvd(rip)?\b/gi, function (_, p1) {
        return 'DVD' + (p1 ? 'Rip' : '')
      })
      .replace(/\b(480|720|1080|2160)([PI])\b/g, function (_, p1, p2) {
        return p1 + p2.toLowerCase()
      })
      .replace(/\bx\.?(26[45])\b/gi, 'x$1')
      .replace(/\./g, ' ')
      .replace(/\//g, '.')
  )
}
// decode [url=...][img]...[/img][/url] -> [comparison=...]...[/comparison]
function urlImg2Comparison (imagesWithUrl) {
  imagesWithUrl = imagesWithUrl.trim()
  const imageHost = imagesWithUrl.match(/pixhost/i)
    ? PIXHOST
    : imagesWithUrl.match(/imgbox/i)
      ? IMGBOX
      : imagesWithUrl.match(/img4k/i)
        ? IMG4K
        : imagesWithUrl.match(/pterclub/i)
          ? PTERCLUB
          : imagesWithUrl.match(/imgpile/i)
            ? IMGPILE
            : ''
  if (!imageHost) {
    return []
  }
  const regex = imageHost === PIXHOST
    ? /\[url=https:\/\/pixhost\.to\/show\/([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+.png)\]\s*\[img\]https:\/\/t([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\.pixhost[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\]\s*\[\/url\]/gi
    : imageHost === IMGBOX
      ? /\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\s*\[img\]https:\/\/thumbs([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)_t\.png\[\/img\]\s*\[\/url\]/gi
      : imageHost === IMG4K
        ? /\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\s*\[img\]([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\.md\.png\[\/img\]\s*\[\/url\]/gi
        : imageHost === PTERCLUB
          ? /\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\s*\[img\]([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\.th\.png\[\/img\]\s*\[\/url\]/gi
          : imageHost === IMGPILE
            ? /\[url=https:\/\/imgpile\.com\/i\/([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\]\s*\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\.png\[\/img\]\s*\[\/url\]/gi
            : ''
  const replacement = imageHost === PIXHOST
    ? 'https://img$2.pixhost.to/images/$1 '
    : imageHost === IMGBOX
      ? 'https://images$1_o.png '
      : imageHost === IMG4K
        ? '$1.png '
        : imageHost === PTERCLUB
          ? '$1.png '
          : imageHost === IMGPILE
            ? 'https://imgpile.com/images/$1.png '
            : ''
  const matches = imagesWithUrl.match(regex)
  if (matches) {
    return imagesWithUrl
      .replace(regex, replacement)
      .split(/\s+/)
      .filter(ele => { return ele })
  } else {
    return []
  }
}
// [comparison=...]...[/comparison] -> decode [url=...][img]...[/img][/url]
async function comparison2UrlImg (imagesComparison, numTeams) {
  const imageHost = imagesComparison.match(/pixhost/i)
    ? PIXHOST
    : imagesComparison.match(/imgbox/i)
      ? IMGBOX
      : imagesComparison.match(/img4k/i)
        ? IMG4K
        : imagesComparison.match(/pterclub/i)
          ? PTERCLUB
          : imagesComparison.match(/imgpile/i)
            ? IMGPILE
            : imagesComparison.match(/ptpimg/i)
              ? PTPIMG
              : ''
  if (!imageHost) {
    return []
  }
  let regex = ''
  let replacement = ''
  if (imageHost === PIXHOST) {
    regex = /https:\/\/img(\d+)\.pixhost\.to\/images\/([\w/]+)\.png/gi
    replacement = '[url=https://pixhost.to/show/$2.png][img]https://t$1.pixhost.to/thumbs/$2.png[/img][/url]'
  } else if (imageHost === IMGBOX) {
    regex = /https:\/\/images(\d+)\.imgbox\.com\/(\w+\/\w+)\/(\w+)_o\.png/gi
    replacement = '[url=https://imgbox.com/$3][img]https://thumbs$1.imgbox.com/$2/$3_t.png[/img][/url]'
  }
  if (regex && replacement) {
    const matches = imagesComparison.match(regex)
    return matches
      ? matches.map(matched => {
        return matched.replace(regex, replacement)
      })
      : []
  } else {
    regex = /(https?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\.(png|jpg))/gi
    const matches = imagesComparison.match(regex)
    const size = numTeams === 2
      ? 350
      : numTeams === 3
        ? 250
        : numTeams === 4
          ? 190
          : numTeams === 5
            ? 150
            : 150
    return matches
      ? await sendImagesToPixhost(matches, size)
      : []
  }
}
function decodeMediaInfo (mediainfoStr) {
  if (!mediainfoStr) {
    return {}
  }
  function matchField (text) {
    return text.match(/^\s*(.+?)\s+:\s*(.+)\s*$/)
  }
  function matchHead (text) {
    return text.match(/^\s*([\w]+(\s#\d+)?)$/)
  }
  let mi = {}
  mediainfoStr.split('\n\n').forEach(sector => {
    const miSector = {}
    let hasHead = false
    sector.split('\n').forEach(line => {
      const fieldArray = matchField(line)
      const headArray = matchHead(line)
      if (fieldArray) {
        miSector[fieldArray[1]] = fieldArray[2]
      } else if (headArray) {
        mi[headArray[1]] = miSector
        hasHead = true
      }
    })
    if (!hasHead) {
      mi = Object.assign({}, mi, miSector)
    }
  })
  return mi
}
async function sendImagesToPixhost (urls, size) {
  const hostname = 'https://pixhost.to/remote/'
  const data = encodeURI(`imgs=${urls.join('\r\n')}&content_type=0&max_th_size=${size}`)
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
  }
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    GM_xmlhttpRequest({
      method: 'POST',
      url: hostname,
      headers,
      data,
      onload: response => {
        if (response.status !== 200) {
          reject(response.status)
        } else {
          const data = response.responseText.match(/(upload_results = )({.*})(;)/)
          if (data && data.length) {
            const imgResultList = JSON.parse(data[2]).images
            resolve(imgResultList.map(item => {
              return `[url=${item.show_url}][img]${item.th_url}[/img][/url]`
            }))
          } else {
            console.log(response)
            reject(new Error('上传失败，请重试'))
          }
        }
      }
    })
  })
}
// 提取单个对比图信息
// eslint-disable-next-line no-unused-vars
function getOneComparison (text, index = 0, preferedRegex = '') {
  const regexArray = Object.keys(regexInfo)
  if (preferedRegex) {
    const currentPos = regexArray.findIndex(x => x === preferedRegex)
    if (currentPos > 0) {
      const temp = regexArray[0]
      regexArray[currentPos] = temp
      regexArray[0] = preferedRegex
    }
  }
  const result = { teams: [], urls: [], regexType: '', thumbs: false, slice: [0, 0] }
  for (const key of regexArray) {
    const regex = regexInfo[key].regex
    regex.lastIndex = index
    const match = regex.exec(text)
    if (match) {
      result.regexType = key
      if (regexInfo[key].groupForTeams >= 0) {
        result.teams = match[regexInfo[key].groupForTeams]
          .split(regexTeamsSplitter)
          .map(ele => { return ele.trim() })
      }
      if (regexInfo[key].groupForUrls >= 0) {
        const urls = match[regexInfo[key].groupForUrls]
        if (key === 'comparison') {
          result.urls = urls.match(regexImageUrlsSeparated)
        } else {
          result.urls = urls.match(regexScreenshotsThumbsSeparated)
        }
      }
      if (regexInfo[key].groupForThumbs >= 0) {
        result.thumbs = !!match[regexInfo[key].groupForThumbs]
      } else if (key === 'comparison') {
        result.thumbs = false
      } else if (key === 'simple') {
        result.thumbs = false
      }
      result.slice = [match.index, match.index + match[0].length]
      return result
    }
  }
  return result
}
// 提取全部对比图信息
function collectComparisons (text) {
  const replacements = []
  let lastIndex = 0
  while (true) {
    const currentIndex = lastIndex
    for (const key in regexInfo) {
      const regex = regexInfo[key].regex
      regex.lastIndex = lastIndex
      const match = regex.exec(text)
      if (match) {
        const result = { starts: 0, ends: 0, teams: [], urls: [], regexType: '', thumbs: false, text: '' }
        result.regexType = key
        if (regexInfo[key].groupForTeams >= 0) {
          result.teams = match[regexInfo[key].groupForTeams]
            .split(regexTeamsSplitter)
            .map(ele => { return ele.trim() })
        }
        if (regexInfo[key].groupForUrls >= 0) {
          const urls = match[regexInfo[key].groupForUrls]
          if (key === 'comparison') {
            result.urls = urls.match(regexImageUrlsSeparated)
          } else {
            result.urls = urls.match(regexScreenshotsThumbsSeparated)
          }
        }
        if (regexInfo[key].groupForThumbs >= 0) {
          result.thumbs = !!match[regexInfo[key].groupForThumbs]
        } else if (key === 'comparison') {
          result.thumbs = false
        } else if (key === 'simple') {
          result.thumbs = false
        }
        result.starts = match.index
        result.ends = match.index + match[0].length
        result.text = match[0]
        replacements.push(result)
        lastIndex = result.ends
        break
      }
    }
    if (lastIndex === currentIndex) {
      return replacements
    }
  }
}
// 对比图信息转换
async function generateComparison (siteName, textToConsume, torrentTitle, mediainfo, maxScreenshots) {
  const site = siteInfoMap[siteName]
  if (site.construct === NEXUSPHP) {
    let removePlainScreenshots = false
    const comparisons = collectComparisons(textToConsume)
      .sort((a, b) => b.starts - a.starts)
    for (let { starts, ends, teams, urls, regexType, thumbs } of comparisons) {
      let screenshotsStr = ''
      if (regexType === 'boxed' || regexType === 'titled' || regexType === 'comparison') {
        screenshotsStr = `[b]${teams.join(' | ')}[/b]`
        if (!thumbs) {
          urls = await comparison2UrlImg(urls.join(' '), teams.length)
        }
        urls.forEach((url, i) => {
          screenshotsStr += (i % teams.length === 0
            ? '\n' + url
            : ' ' + url)
        })
        screenshotsStr = `[center]${screenshotsStr}[/center]\n`
        removePlainScreenshots = true
      } else if (regexType === 'simple') {
        if (removePlainScreenshots) {
          screenshotsStr = ''
        } else {
          screenshotsStr = textToConsume.substring(starts, ends)
        }
      } else {
        screenshotsStr = ''
      }
      textToConsume = textToConsume.substring(0, starts) +
        screenshotsStr +
        textToConsume.substring(ends)
    }
    return textToConsume
  } else if (site.construct === GAZELLE && siteName === GPW) {
    let teamEncode = ''
    let description = ''
    let screenshots = ''
    let currentScreenshots = 0
    if (!torrentTitle && mediainfo && mediainfo.General) {
      let movieName = mediainfo.General['Complete name'] || mediainfo.General['Movie name']
      if (movieName) {
        movieName = formatTorrentName(movieName)
      }
    }
    const teamArray = torrentTitle.match(/\b(D-Z0N3)|(([^\s-@]*)(@[^\s-]+)?)$/)
    if (teamArray) {
      teamEncode = teamArray[0]
    }
    const comparisons = collectComparisons(textToConsume)
      .sort((a, b) => b.starts - a.starts)
    for (let { starts, ends, teams, urls, regexType, thumbs } of comparisons) {
      let screenshotsStr = ''
      if (regexType === 'comparison') {
        screenshotsStr = textToConsume.substring(starts, ends)
      } else if (regexType === 'boxed' || regexType === 'titled') {
        if (thumbs) {
          urls = urlImg2Comparison(urls.join(' '))
        }
        screenshotsStr = `[comparison=${teams.join(', ')}]${urls.join(' ')}[/comparison]`
      } else if (regexType === 'simple') {
        screenshotsStr = ''
      } else {
        screenshotsStr = ''
      }
      description += screenshotsStr
      if (urls.length > 0 && urls.length % teams.length === 0) {
        if (!screenshots && urls.length / teams.length >= 3) {
          urls.forEach((image, i) => {
            const teamCurrent = teams[i % teams.length]
            if (currentScreenshots < maxScreenshots && (teamCurrent === 'Encode' || teamCurrent.toLowerCase() === teamEncode.toLowerCase())) {
              screenshots += `[img]${image}[/img]`
              currentScreenshots += 1
            }
          })
        }
      }
      textToConsume = textToConsume.substring(0, starts) +
        screenshotsStr +
        textToConsume.substring(ends)
    }
    if (screenshots) {
      description += `[b]Screenshots[/b]\n${screenshots}`
    }
    const regexQuote = RegExp('\\[(quote|' + site.targetBoxTag + ')(=(.*?))?\\]([^]+)\\[\\/\\1\\]', 'gim')
    const matchQuote = textToConsume.match(regexQuote)
    let quotes = ''
    if (matchQuote) {
      matchQuote.forEach(quote => {
        quotes += quote.replace(/\[quote=(.*?)\]/gi, '[b]$1[/b][quote]')
      })
    }
    description = quotes + description
    return description
  }
}
function processDescription (siteName, description) {
  const construct = siteInfoMap[siteName].construct
  const targetTagBox = siteInfoMap[siteName].targetTagBox
  const boxSupportDescr = siteInfoMap[siteName].boxSupportDescr
  const otherTagBoxes = siteInfoMap[siteName].otherTagBoxes
  const unsupportedTags = siteInfoMap[siteName].unsupportedTags
  // 对于不支持box标签的站，统一替换为'quote'标签
  const replaceTag = targetTagBox || 'quote'
  if (targetTagBox) {
    description = nestExplode(description, targetTagBox)
    description = compactContent(description, targetTagBox)
  }
  if (construct === NEXUSPHP) {
    description = description
      // PuTao mediainfo style，切换为[box=mediainfo]的形式，以便于后续统一匹配mediainfo
      .replace(/\[quote=mediainfo\]([^]*?General\s*Unique\s*ID[^]*?)\[\/quote\]/gim,
        boxSupportDescr
          ? '[' + replaceTag + '=mediainfo]$1[/' + replaceTag + ']'
          : '[b]MediaInfo[/b]\n[' + replaceTag + ']$1[/' + replaceTag + ']')
      // NHD mediainfo style，切换为[box=mediainfo]的形式，以便于后续统一匹配mediainfo
      .replace(/\[mediainfo\]([^]*?General\s*Unique\s*ID[^]*?)\[\/mediainfo\]/gim,
        boxSupportDescr
          ? '[' + replaceTag + '=mediainfo]$1[/' + replaceTag + ']'
          : '[b]MediaInfo[/b]\n[' + replaceTag + ']$1[/' + replaceTag + ']')
      // mediainfo style for sites that do not support box tags，该条必须置于下一条上方，否则会被影响导致该类别mediainfo识别不到
      .replace(RegExp('(?:(?:\\[b\\])?mediainfo(?:\\[\\/b\\])?\\s*)?\\[(' + otherTagBoxes + ')\\]\\s*(General\\s+Unique\\s+ID[^]+?)\\[\\/\\1\\]', 'gi'),
        boxSupportDescr
          ? '[' + replaceTag + '=mediainfo]$2[/' + replaceTag + ']'
          : '[b]MediaInfo[/b]\n[' + replaceTag + ']$2[/' + replaceTag + ']')
      .replace(/(\[\/?)(\w+)((?:=(?:[^\r\n\t\f\v [\]])+)?\])/g, (_, p1, p2, p3) => {
        return p1 + p2.toLowerCase() + p3
      })
      // 注意otherTagBoxes不需要escape
      .replace(RegExp('\\[(?:' + otherTagBoxes + ')((=([^\\]]+))?)\\]', 'g'),
        boxSupportDescr
          ? `[${replaceTag}` + '$1]'
          : '[b]$1[/b]\n[' + `${replaceTag}]`)
      .replace(RegExp('\\[\\/(?:' + otherTagBoxes + ')\\]', 'g'), `[/${replaceTag}]`)
      .replace(/(?:(?:\[\/(url|flash|flv))|^)(?:(?!\[(url|flash|flv))[\s\S])*(?:(?:\[(url|flash|flv))|$)/g, matches => {
        return (matches.replace(/\[align(=\w*)?\]/g, '\n'))
      })
      .replace(RegExp('\\[\\/?(' + unsupportedTags + ')(=[^\\]]+)?\\]', 'g'), '')
      .replace(/\[pre\]/g, '[font=courier new]').replace(/\[\/pre\]/g, '[/font]')
      .replace(/^\s*([\s\S]*\S)\s*$/g, '$1')// 是否要加上第一行？/^(\s*\n)?([\s\S]*\S)\s*$/g
      .replace(/\[size=(\d+)\]/g, (match, p1) => {
        return parseInt(p1) > 7 ? '[size=7]' : match
      })
      .replace(/\[(\/?img)\d+\]/g, '[$1]') // for pterclub
  } else if (construct === GAZELLE) {
    if (siteName === GPW) {
      description = description
        .replace(/\[quote=mediainfo\]([^]*?General\s*Unique\s*ID[^]*?)\[\/quote\]/gim,
          '[' + replaceTag + '=mediainfo]$1[/' + replaceTag + ']')
        .replace(/\[mediainfo\]([^]*?General\s*Unique\s*ID[^]*?)\[\/mediainfo\]/gim,
          '[' + replaceTag + '=mediainfo]$1[/' + replaceTag + ']')
        .replace(RegExp('(?:(?:\\[b\\])?mediainfo(?:\\[\\/b\\])?\\s*)?\\[(' + otherTagBoxes + ')\\]\\s*(General\\s+Unique\\s+ID[^]+?)\\[\\/\\1\\]', 'gi'),
          '[' + replaceTag + '=mediainfo]$2[/' + replaceTag + ']')
        // 将box, mediainfo等tag都转换为quote的形式，后续（处理完对比图之后）会统一处理
        .replace(/(\[\/?)(\w+)((?:=(?:[^\r\n\t\f\v [\]])+)?\])/g, (_, p1, p2, p3) => {
          return p1 + p2.toLowerCase() + p3
        })
        .replace(RegExp('\\[(?:' + otherTagBoxes + ')((=([^\\]]+))?)\\]', 'g'),
        `[${replaceTag}` + '$1]')
        .replace(RegExp('\\[\\/(?:' + otherTagBoxes + ')\\]', 'g'),
        `[/${replaceTag}]`)
        .replace(/\[(size|color|font|b|i|pre)(=[^\]]+)?\]/g, '')
        .replace(/\[\/(size|color|font|b|i|pre)\]/g, '')
        .replace(/\[center\]/g, '\n')
        .replace(/\[\/center\]/g, '\n')
        .replace(/(?:(?:\[\/(url|flash|flv))|^)(?:(?!\[(url|flash|flv))[\s\S])*(?:(?:\[(url|flash|flv))|$)/g, matches => {
          return (matches.replace(/\[align(=\w*)?\]/g, '\n'))
        })
        .replace(RegExp('\\[\\/?(' + unsupportedTags + ')(=[^\\]]+)?\\]', 'g'), '')
        .replace(/^\s*([\s\S]*\S)\s*$/g, '$1')// 是否要加上第一行？/^(\s*\n)?([\s\S]*\S)\s*$/g
        .replace(/\[(\/?img)\d+\]/g, '[$1]') // for pterclub
    }
  }
  return description
}
(function () {
  'use strict'
  //= ========================================================================================================
  // Main
  const domainMatchArray = window.location.href.match(/(.*)\/(upload|edit|subtitles|dox)\.php/)
  if (!domainMatchArray) {
    return
  }
  const siteName = domainMatchArray[1].match(/nexushd/i)
    ? NHD
    : domainMatchArray[1].match(/pterclub/i)
      ? PTER
      : domainMatchArray[1].match(/pt\.sjtu/i)
        ? PUTAO
        : domainMatchArray[1].match(/m-team/i)
          ? MTEAM
          : domainMatchArray[1].match(/totheglory/i)
            ? TTG
            : domainMatchArray[1].match(/greatposterwall/i)
              ? GPW
              : domainMatchArray[1].match(/uhdbits/i)
                ? UHD
                : ''
  let page = domainMatchArray[2]
  if (siteName === TTG) {
    if (page === 'dox') {
      page = 'subitles'
    }
  }
  if (!siteName || !page) {
    return
  }
  const site = siteName ? siteInfoMap[siteName] : {}
  // 匿名发布开关
  const anonymous = true
  console.log(`running in site ${siteName} and page ${page}`)
  if (page === 'upload' || page === 'edit') {
    //= ========================================================================================================
    // 上传和编辑种子页面
    const btnBingo = $('<input>')
    if (site.construct === NEXUSPHP) {
      btnBingo.attr({
        type: 'button',
        name: 'bingo_converter',
        value: 'BINGO',
        style: 'font-size: 11px; font-weight: bold; color: blue; margin-right: 3px'
      })
      const table1 = $('<table>').attr({
        cellspacing: '1',
        cellpadding: '2',
        border: '0',
        style: 'margin-top:3px'
      }).append(
        $('<tbody>').append(
          $('<tr>').attr({ id: 'multi_function' }).append(
            $('<td>').attr({ class: 'embedded' }).append(btnBingo)
          )
        )
      )
      if (siteName === MTEAM || siteName === NHD || siteName === PTER || siteName === PUTAO) {
        $('#compose input[name="quote"]').closest('table').after(table1)
      } else if (siteName === TTG) {
        $('#upload input[name="quote"]').closest('table').after(table1)
      }
    } else if (site.construct === GAZELLE) {
      btnBingo.attr({
        type: 'button',
        name: 'bingo_converter',
        value: 'BINGO',
        style: 'font-weight: bold; color: white;',
        class: 'BBCodeToolbar-button'
      })
      const bbcodeToolbar = $('div.BBCodeToolbar').closest('#description-container').find('div.BBCodeToolbar')
      bbcodeToolbar.append(btnBingo)
    }
    // function definition
    btnBingo.on('click', async function () {
      const oriTextBingo = btnBingo.val()
      const torrentInfo = {}
      try {
        btnBingo.val('Handling')
        //= ========================================================================================================
        // processing description
        let textToConsume = ''
        if (site.construct === NEXUSPHP) {
          if (site.anonymousControl) {
            if (siteName === NHD || siteName === PTER || siteName === PUTAO || siteName === MTEAM) {
              site.anonymousControl.checked = anonymous
            } else if (siteName === TTG) {
              site.anonymousControl.val(anonymous ? 'yes' : 'no')
            }
          }
          const oldText = site.descrBox.val()
          let readClipboard = false
          if (siteName === NHD || siteName === PTER || siteName === PUTAO || siteName === MTEAM) {
            readClipboard = !oldText
          } else if (siteName === TTG) {
            readClipboard = !oldText ? true : oldText.length < 125
          }
          let descriptionAll = readClipboard ? await navigator.clipboard.readText() : oldText
          descriptionAll = processDescription(siteName, descriptionAll)
          site.descrBox.val(descriptionAll)
          textToConsume = descriptionAll
        } else if (site.construct === GAZELLE) {
          if (siteName === GPW) {
            const oldText = site.descrBox.val()
            let readClipboard = false
            readClipboard = !oldText
            let descriptionAll = readClipboard ? await navigator.clipboard.readText() : oldText
            descriptionAll = processDescription(siteName, descriptionAll)
            textToConsume = descriptionAll
          }
        }
        //= ========================================================================================================
        // info from title
        torrentInfo.torrentTitle = site.inputFile.val()
        if (torrentInfo.torrentTitle) {
          torrentInfo.editionInfo = {}
          torrentInfo.torrentTitle = /([^\\]+)$/.exec(torrentInfo.torrentTitle)[1]
          torrentInfo.torrentTitle = formatTorrentName(torrentInfo.torrentTitle)
          torrentInfo.editionInfo.criterionCollection = torrentInfo.torrentTitle.match(/\bcc|criterion\b/i)
          torrentInfo.editionInfo.directorCut = torrentInfo.torrentTitle.match(/\bdc\b/i)
          torrentInfo.editionInfo.unrated = torrentInfo.torrentTitle.match(/\bunrated\b/i)
          torrentInfo.editionInfo.uncut = torrentInfo.torrentTitle.match(/\buncut\b/i)
          torrentInfo.editionInfo.theatric = torrentInfo.torrentTitle.match(/\btheatrical\b/i)
          torrentInfo.editionInfo.extended = torrentInfo.torrentTitle.match(/\bextended\b/i)
          // source
          torrentInfo.sourceInfo = {}
          torrentInfo.sourceInfo.remux = torrentInfo.torrentTitle.match(/\b(remux)\b/i)
          torrentInfo.sourceInfo.encode = torrentInfo.torrentTitle.match(/\b(blu-?ray|bdrip|dvdrip|webrip)\b/i)
          torrentInfo.sourceInfo.bluray = torrentInfo.torrentTitle.match(/\b(blu-?ray|bdrip)\b/i)
          torrentInfo.sourceInfo.hdtv = torrentInfo.torrentTitle.match(/\bhdtv\b/i)
          torrentInfo.sourceInfo.webDl = torrentInfo.torrentTitle.match(/\bweb-?dl\b/i)
          torrentInfo.sourceInfo.webrip = torrentInfo.torrentTitle.match(/\bwebrip\b/i)
          torrentInfo.sourceInfo.web = torrentInfo.sourceInfo.webDl || torrentInfo.sourceInfo.webrip
          torrentInfo.sourceInfo.dvd = torrentInfo.torrentTitle.match(/\bdvd(rip)?/i)
          torrentInfo.sourceInfo.hddvd = torrentInfo.torrentTitle.match(/\bhddvd\b/i)
          // resolution
          torrentInfo.standardInfo = {}
          torrentInfo.standardInfo.res1080p = torrentInfo.torrentTitle.match(/\b1080p\b/i)
          torrentInfo.standardInfo.res1080i = torrentInfo.torrentTitle.match(/\b1080i\b/i)
          torrentInfo.standardInfo.res720p = torrentInfo.torrentTitle.match(/\b720p\b/i)
          torrentInfo.standardInfo.res2160p = torrentInfo.torrentTitle.match(/\b(2160p|4k)\b/i)
          // processing
          torrentInfo.processingInfo = {}
          torrentInfo.processingInfo.raw = torrentInfo.torrentTitle.match(/\b(remux|web-?dl|(bd|dvd)?iso)\b/i)
          torrentInfo.processingInfo.encode = !torrentInfo.processingInfo.raw
          torrentInfo.processingInfo.remux = torrentInfo.torrentTitle.match(/\bremux\b/i)
          // codec
          torrentInfo.codecInfo = {}
          torrentInfo.codecInfo.h264 = torrentInfo.torrentTitle.match(/\bh\.?264\b/i)
          torrentInfo.codecInfo.x264 = torrentInfo.torrentTitle.match(/\bavc|x264\b/i)
          torrentInfo.codecInfo.h265 = torrentInfo.torrentTitle.match(/\bh\.?265\b/i)
          torrentInfo.codecInfo.x265 = torrentInfo.torrentTitle.match(/\bhevc|x265\b/i)
          torrentInfo.codecInfo.vc1 = torrentInfo.torrentTitle.match(/\bvc-1\b/i)
          torrentInfo.codecInfo.mpeg2 = torrentInfo.torrentTitle.match(/\bmpeg-2\b/i)
          torrentInfo.codecInfo.xvid = torrentInfo.torrentTitle.match(/\bxvid\b/i)
          torrentInfo.codecInfo.divX = torrentInfo.torrentTitle.match(/\bdivx\b/i)
          torrentInfo.codecInfo.flac = torrentInfo.torrentTitle.match(/\bflac\b/i)
          torrentInfo.codecInfo.ape = torrentInfo.torrentTitle.match(/\bape\b/i)
          // team
          const teamArray = torrentInfo.torrentTitle.match(/\b(D-Z0N3)|(([^\s-@]*)(@[^\s-]+)?)$/)
          torrentInfo.team = teamArray ? teamArray[0] : ''
        }
        //= ========================================================================================================
        // info from mediainfo
        torrentInfo.audioInfo = {
          chineseDub: false, cantoneseDub: false, commentary: false
        }
        const subtitleInfoMap = {
          chinese_simplified: site.chineseSimplifiedSubCheck,
          chinese_traditional: site.chineseTraditionalSubCheck,
          japanese: site.japaneseSubCheck,
          korean: site.koreanSubCheck,
          english: site.englishSubCheck,
          french: site.frenchSubCheck,
          german: site.germanSubCheck,
          italian: site.italianSubCheck,
          polish: site.polishSubCheck,
          romanian: site.romanianSubCheck,
          russian: site.russianSubCheck,
          spanish: site.spanishSubCheck,
          thai: site.thaiSubCheck,
          turkish: site.turkishSubCheck,
          vietnamese: site.vietnameseSubCheck,
          hindi: site.hindiSubCheck,
          greek: site.greekSubCheck,
          swedish: site.swedishSubCheck,
          azerbaijani: site.azerbaijaniSubCheck,
          bulgarian: site.bulgarianSubCheck,
          danish: site.danishSubCheck,
          estonian: site.estonianSubCheck,
          finnish: site.finnishSubCheck,
          hebrew: site.hebrewSubCheck,
          croatian: site.croatianSubCheck,
          hungarian: site.hungarianSubCheck,
          icelandic: site.icelandicSubCheck,
          latvian: site.latvianSubCheck,
          lithuanian: site.lithuanianSubCheck,
          dutch: site.dutchSubCheck,
          norwegian: site.norwegianSubCheck,
          portuguese: site.portugueseSubCheck,
          slovenian: site.slovenianSubCheck,
          slovak: site.slovakSubCheck,
          latin: site.latinSubCheck,
          ukrainian: site.ukrainianSubCheck,
          persian: site.persianSubCheck,
          arabic: site.arabicSubCheck,
          brazilian_port: site.brazilianPortSubCheck,
          czech: site.czechSubCheck,
          idonesian: site.idonesianSubCheck,
          serbian: site.serbianSubCheck
        }
        torrentInfo.subtitleInfo = {}
        Object.keys(subtitleInfoMap).forEach(lang => {
          torrentInfo.subtitleInfo[lang] = false
        })
        torrentInfo.videoInfo = {
          hdr10: false, dovi: false, container: ''
        }
        torrentInfo.mediainfo = {}
        torrentInfo.mediainfoStr = ''
        if (site.decodingMediainfo) {
          // 优先从简介中获取mediainfo
          const tagForMediainfo = site.targetTagBox || 'quote'
          const regexMIStr = site.boxSupportDescr
            ? '\\[' + tagForMediainfo + '\\s*=\\s*mediainfo\\][^]*?(General\\s*Unique\\s*ID[^\\0]*?)\\[\\/' + tagForMediainfo + '\\]'
            : '\\[' + tagForMediainfo + '\\][^]*?(General\\s*Unique\\s*ID[^\\0]*?)\\[\\/' + tagForMediainfo + '\\]'
          const regexMI = RegExp(regexMIStr, 'im')
          const mediainfoArray = textToConsume.match(regexMI)
          if (mediainfoArray) {
            torrentInfo.mediainfoStr = mediainfoArray[1]
              .replace(/^\s*\[\w+(\s*=[^\]]+)?\]/g, '')
              .replace(/\s*\[\/\w+\]\s*$/g, '')
            torrentInfo.mediainfo = decodeMediaInfo(torrentInfo.mediainfoStr)
          }
          if (Object.keys(torrentInfo.mediainfo).length === 0 && site.mediainfoBox) {
          // 如果简介中没有有效的mediainfo，读取mediainfobox
            torrentInfo.mediainfoStr = site.mediainfoBox.val()
            torrentInfo.mediainfo = decodeMediaInfo(torrentInfo.mediainfoStr)
          }
          Object.entries(torrentInfo.mediainfo).forEach(([infoKey, infoValue]) => {
            if (infoKey.match(/text( #\d+)?/i)) {
              // subtitle
              let matchLang = false
              const language = infoValue.Language || infoValue.Title
              if (language.match(/chinese|chs|cht/i)) {
                if (language.match(/cht|(chinese( |_)traditional)/i)) {
                  torrentInfo.subtitleInfo.chinese_traditional = true
                } else {
                  torrentInfo.subtitleInfo.chinese_simplified = true
                }
                matchLang = true
              } else {
                Object.keys(torrentInfo.subtitleInfo).forEach(lang => {
                  if (language.match(RegExp(escapeRegExp(lang), 'i')) || language.match(RegExp(escapeRegExp(lang.replace(/_/ig, ' ')), 'i'))) {
                    torrentInfo.subtitleInfo[lang] = true
                    matchLang = true
                  }
                })
              }
              if (matchLang) {
                console.log(`Match sub ${language}`)
              } else {
                console.log(`Other sub ${language}`)
              }
            } else if (infoKey.match(/audio( #\d+)?/i)) {
            // audio
              const title = infoValue.Title || ''
              const language = infoValue.Language || ''
              if (title.match(/commentary/i)) {
                torrentInfo.audioInfo.commentary = true
              }
              if (title.match(/cantonese/i) || language.match(/cantonese/i)) {
                torrentInfo.audioInfo.cantoneseDub = true
                console.log('Cantonese dub')
              } else if (title.match(/chinese|mandarin/i) || language.match(/chinese|mandarin/i)) {
                torrentInfo.audioInfo.chineseDub = true
                console.log('Chinese Mandarin dub')
              } else {
                console.log('Other dub')
              }
            } else if (infoKey.match(/video/i)) {
            // video
              const hdrFormat = infoValue['HDR format']
              if (hdrFormat) {
                if (hdrFormat.match(/HDR10/i)) {
                  torrentInfo.videoInfo.hdr10 = true
                  console.log('HDR10')
                }
                if (hdrFormat.match(/Dolby Vision/i)) {
                  torrentInfo.videoInfo.dovi = true
                  console.log('Dolby Vision')
                }
              }
            } else if (infoKey.match(/general/i)) {
            // general
              if (infoValue.Format === 'Matroska') {
                torrentInfo.videoInfo.container = site.containerMkv
                console.log('MKV')
              } else if (infoValue.Format === 'MPEG-4') {
                torrentInfo.videoInfo.container = site.containerMp4
                console.log('MP4')
              } else if (infoValue.Format === 'AVI') {
                torrentInfo.videoInfo.container = site.containerAvi
                console.log('AVI')
              } else {
                torrentInfo.videoInfo.container = site.containerDefault
              }
            }
          })
        }
        //= ========================================================================================================
        // info from douban / imdb
        let catGeneral = 0; const catGeneralMovie = 1; const catGeneralTvSeries = 2; const catGeneralAnimation = 3
        const catGeneralDocumentary = 4; const catGeneralTvShow = 5
        if (site.construct === NEXUSPHP) {
          torrentInfo.movieInfo = { areaInfo: {} }
          // name
          const translatedTitleArray = textToConsume.match(/译\s*名\s*([^/\n]+)(?:\/|\n)/)
          const originalTitleArray = textToConsume.match(/片\s*名\s*([^/\n]+)(?:\/|\n)/)
          // area
          const areaArray = textToConsume.match(/产\s*地\s*(.*)\s*/)
          const area = areaArray ? areaArray[1] : ''
          if (area.match(/中国大陆/)) {
            torrentInfo.movieInfo.areaInfo.cnMl = true
          } else if (area.match(/香港/)) {
            torrentInfo.movieInfo.areaInfo.hk = true
          } else if (area.match(/台湾/)) {
            torrentInfo.movieInfo.areaInfo.tw = true
          } else if (area.match(/美国|加拿大|英国|法国|德国|希腊|匈牙利|爱尔兰|意大利|阿尔巴尼亚|安道尔|奥地利|白俄罗斯|比利时|波斯尼亚|黑塞哥维那|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛|冰岛|芬兰|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|梵蒂冈/)) {
            torrentInfo.movieInfo.areaInfo.euAme = true
          } else if (area.match(/印度|韩国|日本|新加坡|泰国|印度尼西亚|菲律宾|越南|土耳其|老挝|柬埔寨|缅甸|马来西亚|文莱|东帝汶|尼泊尔|不丹|孟加拉国|巴基斯坦|斯里兰卡|马尔代夫|阿富汗|伊拉克|伊朗|叙利亚|约旦|黎巴嫩|以色列|巴勒斯坦|沙特阿拉伯|阿曼|也门|格鲁吉亚|亚美尼亚|塞浦路斯|哈萨克斯坦|吉尔吉斯斯坦|塔吉克斯坦|乌兹别克斯坦|土库曼斯坦|蒙古|朝鲜/)) {
            torrentInfo.movieInfo.areaInfo.asia = true
            if (area.match(area.match(/韩国/))) {
              torrentInfo.movieInfo.areaInfo.kor = true
            } else if (area.match(/日本/)) {
              torrentInfo.movieInfo.areaInfo.jap = true
            } else if (area.match(/印度/)) {
              torrentInfo.movieInfo.areaInfo.ind = true
            }
          }
          if (translatedTitleArray && originalTitleArray) {
            torrentInfo.movieInfo.translatedTitle = translatedTitleArray[1]
            torrentInfo.movieInfo.originalTitle = originalTitleArray[1]
          }
          // festival
          const festivalArray = textToConsume.match(/(\d{4})-\d{2}-\d{2}\((\S+电影节)\)/)
          torrentInfo.movieInfo.festival = festivalArray ? festivalArray[1] + festivalArray[2] : ''
          // category
          const categoryArray = textToConsume.match(/类\s*别\s+([^\n]*)\s*\n/)
          torrentInfo.movieInfo.categoryInInfo = categoryArray
            ? categoryArray[1].replace(/([^ ])\/([^ ])/g, '$1 / $2')
            : ''
          catGeneral = torrentInfo.movieInfo.categoryInInfo.match('纪录')
            ? catGeneralDocumentary
            : torrentInfo.movieInfo.categoryInInfo.match('动画')
              ? catGeneralAnimation
              : textToConsume.match(/集\s*数\s+/g)
                ? catGeneralTvSeries
                : torrentInfo.movieInfo.categoryInInfo.match('秀')
                  ? catGeneralTvShow
                  : catGeneralMovie
          // douban and imdb score in small_desc
          const doubanScoreArray = textToConsume.match(/豆\s*瓣\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/)
          if (doubanScoreArray) {
            torrentInfo.movieInfo.doubanScore = doubanScoreArray[1]
            torrentInfo.movieInfo.doubanScoreRatingNumber = doubanScoreArray[2]
          }
          const imdbScoreArray = textToConsume.match(/IMDb\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/i)
          if (imdbScoreArray) {
            torrentInfo.movieInfo.imdbScore = imdbScoreArray[1]
            torrentInfo.movieInfo.imdbRatingNumber = imdbScoreArray[2]
          }
          // director
          const directorArray = textToConsume.match(/导\s*演\s+([^\w\n\s]*)\s*/)
          torrentInfo.movieInfo.director = directorArray ? directorArray[1] : ''
          // douban link
          const doubanLinkArray = textToConsume.match(/豆瓣\s*链\s*接.+(https?:\/\/movie\.douban\.com\/subject\/(\d+)\/?)/)
          torrentInfo.movieInfo.doubanLink = doubanLinkArray ? doubanLinkArray[1] : ''
          torrentInfo.movieInfo.doubanId = doubanLinkArray ? doubanLinkArray[2] : ''
          // imdb link
          const imdbLinkArray = textToConsume.match(/IMDb\s*链\s*接.+(https?:\/\/www\.imdb\.com\/title\/(tt\d+)\/?)/i)
          torrentInfo.movieInfo.imdbLink = imdbLinkArray ? imdbLinkArray[1] : ''
          torrentInfo.movieInfo.imdbId = imdbLinkArray ? imdbLinkArray[2] : ''
        }
        //= ========================================================================================================
        // fill the page
        // common controls
        // source
        if (site.sourceSel && torrentInfo.sourceInfo) {
          torrentInfo.sourceInfo.sourceInSite = site.sourceDefault || 0
          if (siteName === PTER || siteName === MTEAM) {
            torrentInfo.sourceInfo.sourceInSite = torrentInfo.sourceInfo.remux
              ? site.sourceRemux// remux
              : torrentInfo.sourceInfo.encode
                ? site.sourceEncode// encode
                : torrentInfo.sourceInfo.hdtv
                  ? site.sourceHdtv// hdtv
                  : torrentInfo.sourceInfo.webDl
                    ? site.sourceWebDl// web-dl
                    : torrentInfo.sourceInfo.sourceInSite// other
          } else if (siteName === NHD) {
            torrentInfo.sourceInfo.sourceInSite = torrentInfo.sourceInfo.bluray
              ? site.sourceBluray
              : torrentInfo.sourceInfo.hddvd
                ? site.sourceHddvd
                : torrentInfo.sourceInfo.dvd
                  ? site.sourceDvd
                  : torrentInfo.sourceInfo.webDl
                    ? site.sourceWebDl
                    : torrentInfo.sourceInfo.webrip
                      ? site.sourceWebrip
                      : torrentInfo.sourceInfo.sourceInSite
          } else if (siteName === GPW) {
            torrentInfo.sourceInfo.sourceInSite = torrentInfo.sourceInfo.bluray
              ? site.sourceBluray
              : torrentInfo.sourceInfo.hddvd
                ? site.sourceHddvd
                : torrentInfo.sourceInfo.dvd
                  ? site.sourceDvd
                  : torrentInfo.sourceInfo.web
                    ? site.sourceWeb
                    : torrentInfo.sourceInfo.sourceInSite
          }
          site.sourceSel.val(torrentInfo.sourceInfo.sourceInSite)
        }
        // standard
        if (site.standardSel && torrentInfo.standardInfo) {
          torrentInfo.standardInfo.standardInSite = site.standardDefault || 0
          if (siteName === NHD || siteName === PUTAO || siteName === MTEAM || siteName === TTG || siteName === GPW) {
            torrentInfo.standardInfo.standardInSite = torrentInfo.standardInfo.res1080p
              ? site.standard1080p
              : torrentInfo.standardInfo.res1080i
                ? site.standard1080i
                : torrentInfo.standardInfo.res720p
                  ? site.standard720p
                  : torrentInfo.standardInfo.res2160p
                    ? site.standard2160p
                    : torrentInfo.standardInfo.standardInSite
            site.standardSel.val(torrentInfo.standardInfo.standardInSite)
          }
        }
        // processing
        if (site.processingSel && torrentInfo.processingInfo) {
          torrentInfo.processingInfo.processingInSite = site.processDefault || 0
          if (siteName === NHD) {
            torrentInfo.processingInfo.processingInSite = torrentInfo.processingInfo.raw
              ? site.processRaw
              : site.processEncode
          } else if (siteName === GPW) {
            site.processingSel.closest('tr.hidden').removeClass('hidden')
            torrentInfo.processingInfo.processingInSite = torrentInfo.processingInfo.remux
              ? site.processRemux
              : site.processEncode
          }
          site.processingSel.val(torrentInfo.processingInfo.processingInSite)
        }
        // codec
        if (site.codecSel && torrentInfo.codecInfo) {
          torrentInfo.codecInfo.codecInSite = site.codecDefault || 0
          if (siteName === NHD || siteName === PUTAO || siteName === MTEAM) {
            torrentInfo.codecInfo.codecInSite = torrentInfo.codecInfo.x264 || torrentInfo.codecInfo.h264
              ? site.codecH264
              : torrentInfo.codecInfo.x265 || torrentInfo.codecInfo.h265
                ? site.codecH265
                : torrentInfo.codecInfo.vc1
                  ? site.codecVc1
                  : torrentInfo.codecInfo.mpeg2
                    ? site.codecMpeg2
                    : torrentInfo.codecInfo.xvid
                      ? site.codecXvid
                      : torrentInfo.codecInfo.flac
                        ? site.codecFlac
                        : torrentInfo.codecInfo.ape
                          ? site.codecApe
                          : torrentInfo.codecInfo.codecInSite
          } else if (siteName === GPW) {
            torrentInfo.codecInfo.codecInSite = torrentInfo.codecInfo.h264
              ? site.codecH264
              : torrentInfo.codecInfo.h265
                ? site.codecH265
                : torrentInfo.codecInfo.x264
                  ? site.codecX264
                  : torrentInfo.codecInfo.x265
                    ? site.codecX265
                    : torrentInfo.codecInfo.xvid
                      ? site.codecXvid
                      : torrentInfo.codecInfo.divX
                        ? site.codecDivX
                        : torrentInfo.codecInfo.codecInSite
          }
          site.codecSel.val(torrentInfo.codecInfo.codecInSite)
        }
        // team
        if (site.teamSel) {
          if (siteName === MTEAM) {
            site.teamSel.find('option').each((_, element) => {
              if (element.text.toLowerCase() === torrentInfo.team.toLowerCase()) {
                site.teamSel.val(element.value)
              }
            })
          }
        }
        // small description
        if (site.smallDescBox && torrentInfo.movieInfo && (torrentInfo.movieInfo.doubanLink || torrentInfo.movieInfo.imdbLink)) {
          // container for small_desc (副标题)
          const smallDescrArray = []
          if (torrentInfo.movieInfo.originalTitle && torrentInfo.movieInfo.translatedTitle) {
            if (siteName === NHD || siteName === PTER || siteName === MTEAM || siteName === TTG) {
              if (torrentInfo.movieInfo.areaInfo.cnMl) {
                smallDescrArray.push(torrentInfo.torrentTitle.match(torrentInfo.movieInfo.originalTitle)
                  ? torrentInfo.movieInfo.translatedTitle
                  : torrentInfo.movieInfo.originalTitle)
              } else {
                smallDescrArray.push(torrentInfo.movieInfo.translatedTitle)
              }
            } else if (siteName === PUTAO) {
              if (torrentInfo.movieInfo.areaInfo.cnMl) {
                torrentInfo.torrentTitle = torrentInfo.torrentTitle.match(torrentInfo.movieInfo.originalTitle)
                  ? torrentInfo.torrentTitle
                  : `[${torrentInfo.movieInfo.originalTitle}] ${torrentInfo.torrentTitle}`
                site.nameBox.val(torrentInfo.torrentTitle)
              } else {
                torrentInfo.torrentTitle = torrentInfo.torrentTitle.match(torrentInfo.movieInfo.translatedTitle)
                  ? torrentInfo.torrentTitle
                  : `[${torrentInfo.movieInfo.translatedTitle}] ${torrentInfo.torrentTitle}`
                site.nameBox.val(torrentInfo.torrentTitle)
              }
            }
          }
          if (torrentInfo.movieInfo.festival) {
            smallDescrArray.push(torrentInfo.movieInfo.festival)
          }
          if (torrentInfo.movieInfo.categoryInInfo) {
            smallDescrArray.push(torrentInfo.movieInfo.categoryInInfo)
          }
          if (siteName === NHD || siteName === PUTAO) {
            if (torrentInfo.movieInfo.doubanScore) {
              smallDescrArray.push('豆瓣 ' + torrentInfo.movieInfo.doubanScore + '（' + torrentInfo.movieInfo.doubanScoreRatingNumber + '）')
            }
            if (torrentInfo.movieInfo.imdbScore) {
              smallDescrArray.push('IMDb ' + torrentInfo.movieInfo.imdbScore + '（' + torrentInfo.movieInfo.imdbRatingNumber + '）')
            }
          }
          if (torrentInfo.movieInfo.director) {
            smallDescrArray.push(torrentInfo.movieInfo.director)
          }
          // complete small_descr
          site.smallDescBox.val(smallDescrArray.join(' | '))
        }
        // douban link
        if (site.doubanLinkBox && torrentInfo.movieInfo && torrentInfo.movieInfo.doubanLink) {
          if (siteName === NHD || siteName === PTER || siteName === PUTAO) {
            site.doubanLinkBox.val(torrentInfo.movieInfo.doubanLink)
          } else if (siteName === TTG) {
            site.doubanLinkBox.val(torrentInfo.movieInfo.doubanId)
          }
        }
        // imdb link
        if (site.imdbLinkBox && torrentInfo.movieInfo && torrentInfo.movieInfo.imdbLink) {
          if (siteName === NHD || siteName === PTER || siteName === PUTAO || siteName === MTEAM) {
            site.imdbLinkBox.val(torrentInfo.movieInfo.imdbLink)
          } else if (siteName === TTG) {
            site.imdbLinkBox.val(torrentInfo.movieInfo.imdbId)
          }
        }
        // area selection
        if (site.areaSel && torrentInfo.movieInfo && torrentInfo.movieInfo.areaInfo) {
          let areaNum = site.areaDefault || 0
          if (siteName === PTER) {
            areaNum = torrentInfo.movieInfo.areaInfo.cnMl
              ? site.areaCnMl
              : torrentInfo.movieInfo.areaInfo.hk
                ? site.areaHk
                : torrentInfo.movieInfo.areaInfo.tw
                  ? site.areaTw
                  : torrentInfo.movieInfo.areaInfo.euAme
                    ? site.areaEuAme
                    : torrentInfo.movieInfo.areaInfo.kor
                      ? site.areaKor
                      : torrentInfo.movieInfo.areaInfo.jap
                        ? site.areaJap
                        : torrentInfo.movieInfo.areaInfo.ind
                          ? site.areaInd
                          : site.areaOther
          } else if (siteName === MTEAM) {
            areaNum = torrentInfo.movieInfo.areaInfo.cnMl
              ? site.areaCnMl
              : torrentInfo.movieInfo.areaInfo.euAme
                ? site.areaEuAme
                : torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                  ? site.areaHk
                  : torrentInfo.movieInfo.areaInfo.jap
                    ? site.areaJap
                    : torrentInfo.movieInfo.areaInfo.kor
                      ? site.areaKor
                      : site.areaOther
          }
          site.areaSel.val(areaNum)
        }
        // category selection
        if (site.categorySel) {
          let category = catGeneral
          if ((siteName === NHD || siteName === PTER) && torrentInfo.movieInfo) {
            category = catGeneral === catGeneralMovie
              ? site.catMovie
              : catGeneral === catGeneralTvSeries
                ? site.catTvSeries
                : catGeneral === catGeneralAnimation
                  ? site.catAnimation
                  : catGeneral === catGeneralDocumentary
                    ? site.catDocumentary
                    : catGeneral === catGeneralTvShow
                      ? site.catTvShow
                      : site.catDefault
          } else if (siteName === PUTAO && torrentInfo.movieInfo && torrentInfo.movieInfo.areaInfo) {
            if (catGeneral === catGeneralMovie) {
              category = torrentInfo.movieInfo.areaInfo.cnMl
                ? site.catMovieCnMl
                : torrentInfo.movieInfo.areaInfo.euAme
                  ? site.catMovieEuAme
                  : torrentInfo.movieInfo.areaInfo.asia
                    ? site.catMovieAsia
                    : site.catMovieEuAme
            } else if (catGeneral === catGeneralDocumentary) {
            // for clarification
              category = site.catDocumentary
            } else if (catGeneral === catGeneralAnimation) {
            // for clarification
              category = site.catAnimation
            } else if (catGeneral === catGeneralTvSeries) {
              category = torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                ? site.catTvSeriesHkTw
                : torrentInfo.movieInfo.areaInfo.asia
                  ? site.catTvSeriesAsia
                  : torrentInfo.movieInfo.areaInfo.cnMl
                    ? site.catTvSeriesCnMl
                    : torrentInfo.movieInfo.areaInfo.euAme
                      ? site.catTvSeriesEuAme
                      : site.catTvSeriesEuAme
            } else if (catGeneral === catGeneralTvShow) {
              category = torrentInfo.movieInfo.areaInfo.cnMl
                ? site.catTvShowCnMl
                : torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                  ? site.catTvShowHkTw
                  : torrentInfo.movieInfo.areaInfo.euAme
                    ? site.catTvShowEuAme
                    : torrentInfo.movieInfo.areaInfo.jap || torrentInfo.movieInfo.areaInfo.kor
                      ? site.catTvShowJpKor
                      : site.catDefault
            }
          } else if (siteName === MTEAM && torrentInfo.sourceInfo) {
            if (catGeneral === catGeneralMovie) {
              category = torrentInfo.sourceRemux
                ? site.catMovieRemux
                : torrentInfo.sourceInfo.encode || torrentInfo.sourceInfo.hdtv || torrentInfo.sourceInfo.hddvd || torrentInfo.sourceInfo.web
                  ? site.catMovieHd
                  : site.catDefault
            } else if (catGeneral === catGeneralTvSeries || catGeneral === catGeneralTvShow) {
              category = torrentInfo.sourceInfo.encode || torrentInfo.sourceInfo.hdtv || torrentInfo.sourceInfo.hddvd || torrentInfo.sourceInfo.web
                ? site.catTvSeriesHd
                : site.catDefault
            } else if (catGeneral === catGeneralDocumentary) {
              category = site.catDocumentary
            } else if (catGeneral === catGeneralAnimation) {
              category = site.catAnimation
            } else {
              category = site.catDefault
            }
          } else if (siteName === TTG && torrentInfo.standardInfo && torrentInfo.movieInfo && torrentInfo.movieInfo.areaInfo) {
            if (catGeneral === catGeneralMovie) {
              category = torrentInfo.standardInfo.res720p
                ? site.catMovie720p
                : torrentInfo.standardInfo.res1080i || torrentInfo.standardInfo.res1080p
                  ? site.catMovie1080ip
                  : torrentInfo.standardInfo.res2160p
                    ? site.catMovie2160p
                    : site.catDefault
            } else if (catGeneral === catGeneralDocumentary) {
              category = torrentInfo.standardInfo.res720p
                ? site.catDocumentary720p
                : torrentInfo.standardInfo.res1080i || torrentInfo.standardInfo.res1080p
                  ? site.catDocumentary1080ip
                  : site.catDefault
            } else if (catGeneral === catGeneralAnimation) {
              category = site.catAnimation
            } else if (catGeneral === catGeneralTvSeries) {
              category = torrentInfo.movieInfo.areaInfo.jap
                ? site.catTvSeriesJap
                : torrentInfo.movieInfo.areaInfo.kor
                  ? site.catTvSeriesKor
                  : torrentInfo.euAme
                    ? site.catTvSeriesEuAme
                    : torrentInfo.movieInfo.areaInfo.cnMl || torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                      ? site.catTvSeriesCnMl
                      : site.catDefault
            } else if (catGeneral === catGeneralTvShow) {
              category = torrentInfo.movieInfo.areaInfo.kor
                ? site.catTvShowKor
                : torrentInfo.movieInfo.areaInfo.jap
                  ? site.catTvShowJap
                  : site.catTvShow
            }
          }
          site.categorySel.val(category)
        }
        // site-specific
        if (siteName === PTER && torrentInfo.subtitleInfo && torrentInfo.audioInfo) {
          if (site.chsubCheck && site.englishSubCheck && site.chdubCheck && site.cantodubCheck) {
            site.chsubCheck.checked = torrentInfo.subtitleInfo.chinese_simplified || torrentInfo.subtitleInfo.chinese_traditional
            site.englishSubCheck.checked = torrentInfo.subtitleInfo.english
            site.chdubCheck.checked = torrentInfo.audioInfo.chineseDub
            site.cantodubCheck.checked = torrentInfo.audioInfo.cantoneseDub
          }
        } else if (siteName === MTEAM && torrentInfo.subtitleInfo && torrentInfo.audioInfo) {
          if (site.chsubCheck && site.chdubCheck) {
            site.chsubCheck.checked = torrentInfo.subtitleInfo.chinese_simplified || torrentInfo.subtitleInfo.chinese_traditional
            site.chdubCheck.checked = torrentInfo.audioInfo.chineseDub
          }
        } else if (siteName === TTG && torrentInfo.subtitleInfo) {
          if (torrentInfo.subtitleInfo.chinese_simplified || torrentInfo.subtitleInfo.chinese_traditional) {
            site.subtitleBox.val('* 内封简繁字幕')
          } else if (torrentInfo.subtitleInfo.chinese_simplified) {
            site.subtitleBox.val('* 内封简体字幕')
          } else if (torrentInfo.subtitleInfo.chinese_traditional) {
            site.subtitleBox.val('* 内封繁体字幕')
          }
        } else if (siteName === GPW) {
          if (torrentInfo.editionInfo) {
            site.movieEditionCheck.click()
            if (torrentInfo.editionInfo.criterionCollection) { site.ccClick.click() }
            if (torrentInfo.editionInfo.directorCut) { site.dcClick.click() }
            if (torrentInfo.editionInfo.unrated) { site.unratedClick.click() }
            if (torrentInfo.editionInfo.uncut) { site.uncutClick.click() }
            if (torrentInfo.editionInfo.theatric) { site.theatricClick.click() }
            if (torrentInfo.editionInfo.extended) { site.extendedClick.click() }
          }
          if (Object.keys(torrentInfo.mediainfo).length > 0) {
            let mediainfoNew = torrentInfo.mediainfoStr
            const completeNameArray = torrentInfo.mediainfo.General['Complete name']
            if (!completeNameArray) {
              const movieNameArray = torrentInfo.mediainfoStr.match(/^Movie name\s*:\s*(.+?)\s*$/mi)
              if (movieNameArray) {
                const completeName = torrentInfo.mediainfo.General['Movie name'] + `.${torrentInfo.videoInfo.container.toLowerCase()}`
                mediainfoNew = torrentInfo.mediainfoStr.replace(/(General\s+Unique ID.+$)\s+(Format\s+.+$)/mi,
                  '$1\n' + `Complete name                            : ${completeName}` + '\n$2')
              }
            }
            site.mediainfoBox.val(mediainfoNew)
            const subbed = Object.values(torrentInfo.subtitleInfo).some(x => x)
            site.noSubCheck.checked = !subbed
            site.mixedSubCheck.checked = subbed
            if (subbed) {
              site.otherSubtitlesDiv.removeClass('hidden')
              Object.keys(torrentInfo.subtitleInfo).forEach(lang => {
                if (subtitleInfoMap[lang]) {
                  subtitleInfoMap[lang].checked = torrentInfo.subtitleInfo[lang]
                }
              })
            }
            site.chdubCheck.checked = torrentInfo.audioInfo.chineseDub
            site.hdr10Check.checked = torrentInfo.videoInfo.hdr10
            site.doviCheck.checked = torrentInfo.videoInfo.dovi
            if (torrentInfo.audioInfo.commentary) {
              site.commentAudioClick.click()
            }
            site.containerSel.val(torrentInfo.videoInfo.container)
          }
        }
        //= ========================================================================================================
        // handling screenshots
        const description = await generateComparison(siteName, textToConsume, torrentInfo.torrentTitle, torrentInfo.mediainfo, site.maxScreenshots || 10)
        site.descrBox.val(description)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        btnBingo.val(oriTextBingo)
      }
    })
  } else if (page === 'subtitles') {
    //= ========================================================================================================
    // 字幕页面
    // 不需要填充信息的站点
    if (siteName === TTG || siteName === GPW) {
      return
    }
    let inputFile = null; let titleBox = null; let languageSel = null; let anonymousCheck = null
    if (siteName === NHD || siteName === PTER || siteName === PUTAO) {
      inputFile = $('input[type="file"][name="file"]')
      titleBox = $('input[type="text"][name="title"]')
      languageSel = $('select[name="sel_lang"]')
      anonymousCheck = $("input[name='uplver'][type='checkbox']")[0]
    } else if (siteName === MTEAM) {
      inputFile = $('input[type="file"][name="file[]"]')
      titleBox = $('input[type="text"][name="title[]"]')
      languageSel = $('select[name="sel_lang[]"]')
      anonymousCheck = $("input[name='uplver'][type='checkbox']")[0]
    }
    if (!inputFile) {
      return
    }
    inputFile.change(function () {
      if (anonymousCheck) {
        anonymousCheck.checked = anonymous
      }
      let langEng = 1; let langChs = 2; let langCht = 3
      let langJap = 4; let langFre = 5; let langGer = 6; let langIta = 7
      let langKor = 8; let langSpa = 9; let langOther = 10
      let langNum = 0
      const pathSub = inputFile.val()
      const fileName = /([^\\]+)$/.exec(pathSub)[1]
      if (fileName) {
        titleBox.val(fileName)
        const lang = pathSub.replace(/.*\.(.*)\..*/i, '$1')
        if (lang) {
          if (siteName === NHD || siteName === PTER || siteName === PUTAO) {
            langEng = 6; langChs = 25; langCht = 28
            langJap = 15; langFre = 9; langGer = 10; langIta = 14
            langKor = 16; langSpa = 26; langOther = 18
            langNum = lang.match(/(chs|cht|cn|zh)\s*( |&)?.+/) || lang.match(/.+( |&)?(chs|cht|cn|zh)/)
              ? langOther
              : lang.match(/chs/)
                ? langChs
                : lang.match(/cht/)
                  ? langCht
                  : lang.match(/eng/)
                    ? langEng
                    : lang.match(/jap|jp/)
                      ? langJap
                      : lang.match(/fre|fra/)
                        ? langFre
                        : lang.match(/ger/)
                          ? langGer
                          : lang.match(/ita/)
                            ? langIta
                            : lang.match(/kor/)
                              ? langKor
                              : lang.match(/spa/)
                                ? langSpa
                                : langOther
          } else if (siteName === MTEAM) {
            langEng = 6; langChs = 25; langCht = 28
            langJap = 15; langKor = 16; langOther = 18
            langNum = lang.match(/(chs|cht|cn|zh)\s*( |&)?.+/) || lang.match(/.+( |&)?(chs|cht|cn|zh)/)
              ? langOther
              : lang.match(/chs/)
                ? langChs
                : lang.match(/cht/)
                  ? langCht
                  : lang.match(/eng/)
                    ? langEng
                    : lang.match(/jap|jp/)
                      ? langJap
                      : lang.match(/kor/)
                        ? langKor
                        : langOther
          }
        }
        console.log(`language: ${lang}`)
        languageSel.val(langNum)
      } else {
        console.log(`not able to get file name from path ${pathSub}`)
      }
    })
  }
})()
// ////////////////////////////////////////////////////////////////////////////////////////////////
// for unit test
// Conditionally export for unit testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    collectComparisons,
    regexTeam,
    regexTeamsSplitter,
    regexImageUrl,
    regexNormalUrl,
    regexScreenshotsComparison,
    regexScreenshotsThumbsBoxed,
    regexScreenshotsThumbsCombined,
    generateComparison,
    processDescription
  }
}
