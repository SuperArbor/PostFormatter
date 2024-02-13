/* eslint-disable object-property-newline */
// ==UserScript==
// @name         Post Formatter
// @description  Format upload info
// @version      1.3.2.7
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
// constants and configurations
const $ = window.jQuery
const NHD = 'nexushd'; const PUTAO = 'pt.sjtu'; const MTEAM = 'm-team'; const TTG = 'totheglory'; const GPW = 'greatposterwall'; const UHD = 'uhdbits'
const PTERCLUB = 'pterclub'; const IMGPILE = 'imgpile'; const PTPIMG = 'ptpimg'; const KSHARE = 'kshare.club'; const PIXHOST = 'pixhost'; const IMGBOX = 'imgbox'; const IMG4K = 'img4k'; const ILIKESHOTS = 'yes.ilikeshots.club'
// 特殊组名备注
const weirdTeams = ['de[42]', 'D-Z0N3', 'WEB-DL']
const NEXUSPHP = 'nexusphp'; const GAZELLE = 'gazelle'
const allTagBoxes = ['box', 'hide', 'spoiler', 'expand']
// 匿名发布开关
const ANONYMOUS = true
// medianinfo 键长（方便格式化）
const mediainfoKeyLength = 31
const subtitleLanguages = {chinese_simplified: 'chs|zh', chinese_traditional: 'cht', japanese: 'jp|jpn|jap|ja', korean: 'kor|ko', english: 'en|eng',
  french: 'fre|fra|fr', german: 'ger|deu|de', italian: 'ita|it', polish: 'pol|pl', romanian: 'rum|ron|ro', russian: 'ru|rus', spanish: 'spa|es', thai: 'tai',
  turkish: 'tur|tr', vietnamese: 'vi|vie', hindi: 'hin|hi', greek: 'gre|ell|el', swedish: 'swe|sv', azerbaijani: 'aze|az', bulgarian: 'bul|bg', danish: 'dan|da',
  estonian: 'est|et', finnish: 'fin|fi', hebrew: 'heb|he', croatian: 'hrv|hr', hungarian: 'hun|hu', icelandic: 'ice|isl|is', latvian: 'lav|lv', lithuanian: 'lit|lt',
  dutch: 'dut|nld|nl', norwegian: 'nor|no', portuguese: 'por|pt', slovenian: 'slv|sl', slovak: 'slo|slk|sk', latin: 'lat|la',
  ukrainian: 'ukr|uk', persian: 'per|fas|fa', arabic: 'ara|ar', brazilian_port: 'bra', czech: 'cze|ces|cs', idonesian: 'ido', serbian: 'srp|sr'
}
const weirdTeamsStr = weirdTeams.map(team => `(?:${escapeRegExp(team)})`).join('|')
const regexTeam = RegExp('\\b(?:(?:' + weirdTeamsStr + '|\\w[\\w-. ]+)) ?(?:(?:\\([\\w. ]+\\)|<[\\w. ]+>|\\[[\\w. ]+\\]) ?(?:[\\w. ]+)?)?', 'i')
// const regexTeamsSplitter = /\||,|\/|(?<!D)-(?=Z0N3)|(?<=D)-(?!Z0N3)|(?<!WEB)-(?=DL)|(?<=WEB)-(?!DL)|(?<!WEB|D)-(?!DL|Z0N3)| v\.?s\.? |>\s*v\.?s\.?\s*</i
const allTeamSplitters = [',', '|', '/', '-', ' vs ', ' v.s ', ' v.s. ', '> vs <']
const [regexTeamsSplitter] = getTeamSplitterRegex(weirdTeams, allTeamSplitters, 'i')
// max comparison teams in a comparison, must be larger than 1
const maxTeamsInComparison = 8
const maxNonWordsInTitled = 20
// simple regexes
const regexNormalUrl = /https?:[A-Za-z0-9\-._~!$&'()*+;=:@/?]+/i
const regexImageUrl = RegExp(
  regexNormalUrl.source + '?\\.(?:png|jpg)',
  'ig')
// compare with thumbs
const regexScreenshotsThumbs = RegExp(
  '\\[url=' +
  regexNormalUrl.source + '\\]\\s*\\[img\\]' +
  regexImageUrl.source + '\\[\\/img\\]\\s*\\[\\/url\\]',
  'ig')
// compare with thumbs
const regexScreenshotsImages = RegExp(
  '\\[img\\]' + regexImageUrl.source + '\\[\\/img\\]',
  'ig')
// complex regexes
// compare with comparison (GPW style)
const regexScreenshotsComparison = RegExp(
  '\\[comparison=(' +
  regexTeam.source + '(?:\\s*(,)\\s*' + regexTeam.source + `){1,${maxTeamsInComparison-1}})\\](\\s*(?:` +
  regexImageUrl.source + '(?:\\s+|\\s*,)\\s*)+' + regexImageUrl.source +
  ')\\s*\\[\\/comparison\\]',
  'mig')
// 截图模式:包含[box|hide|expand|spoiler|quote=]标签，封装的是缩略图
const regexScreenshotsThumbsBoxed = RegExp(
  '\\[(box|hide|expand|spoiler|quote)\\s*=\\s*\\w*?\\s*(' +
  regexTeam.source + '(\\s*(' + regexTeamsSplitter.source + ')\\s*)' +
  regexTeam.source + '(?:\\3' + regexTeam.source + `){0,${maxTeamsInComparison-2}})\\s*\\]` +
  '((?:\\s*' + regexScreenshotsThumbs.source + '\\s*)+)\\[\\/\\1\\]',
  'mig')
// 截图模式：不包含[box|hide|expand|spoiler|quote=]标签，封装的是缩略图，要求Source, Encode与截图之间至少有一个换行符
const regexScreenshotsThumbsTitled = RegExp(
  '\\b(' +
  regexTeam.source + '(\\s*(' + regexTeamsSplitter.source + ')\\s*)' +
  regexTeam.source + '(?:\\2' + regexTeam.source + `){0,${maxTeamsInComparison-2}})[\\W]{0,${maxNonWordsInTitled}}\\r?\\n+\\s*` +
  '((?:\\s*' + regexScreenshotsThumbs.source + '\\s*)+)',
  'mig')
// 截图模式:包含[box|hide|expand|spoiler|quote=]标签，封装的是图片链接
const regexScreenshotsImagesBoxed = RegExp(
  '\\[(box|hide|expand|spoiler|quote)\\s*=\\s*\\w*?\\s*(' +
  regexTeam.source + '(\\s*(' + regexTeamsSplitter.source + ')\\s*)' +
  regexTeam.source + '(?:\\3' + regexTeam.source + `){0,${maxTeamsInComparison-2}})\\s*\\]` +
  '((?:\\s*' + regexScreenshotsImages.source + '\\s*)+)\\[\\/\\1\\]',
  'mig')
// 截图模式：不包含[box|hide|expand|spoiler|quote=]标签，封装的是图片链接，要求Source, Encode与截图之间至少有一个换行符
const regexScreenshotsImagesTitled = RegExp(
  '\\b(' +
  regexTeam.source + '(\\s*(' + regexTeamsSplitter.source + ')\\s*)' +
  regexTeam.source + '(?:\\2' + regexTeam.source + `){0,${maxTeamsInComparison-2}})[\\W]{0,${maxNonWordsInTitled}}\\r?\\n+\\s*` +
  '((?:\\s*' + regexScreenshotsImages.source + '\\s*)+)',
  'mig')
// 对比图相关正则表达式信息，由于可能不止一个会被匹配到，注意排序
const regexInfo = [
  // [box=team1, team2, team3][url=...][img]https://1.png[/img][/url] [url=...][img]https://2.png[/img][/url] [url=...][img]https://3.png[/img][/url][/box]
  { regex: regexScreenshotsThumbsBoxed, groupForTeams: 2, groupForTeamSplitter: 4, groupForUrls: 5, containerStyle: 'boxed', urlType: 'thumbsBbCode' },
  // team1 | team2 | team3\n[url=...][img]https://1.png[/img][/url] [url=...][img]https://2.png[/img][/url] [url=...][img]https://3.png[/img][/url]
  { regex: regexScreenshotsThumbsTitled, groupForTeams: 1, groupForTeamSplitter: 3, groupForUrls: 4, containerStyle: 'titled', urlType: 'thumbsBbCode' },
  // [box=team1, team2, team3][img]https://1.png[/img] [img]https://2.png[/img] [img]https://3.png[/img][/box]
  { regex: regexScreenshotsImagesBoxed, groupForTeams: 2, groupForTeamSplitter: 4, groupForUrls: 5, containerStyle: 'boxed', urlType: 'imagesBbCode' },
  // team1 | team2 | team3\n[img]https://1.png[/img] [img]https://2.png[/img] [img]https://3.png[/img]
  { regex: regexScreenshotsImagesTitled, groupForTeams: 1, groupForTeamSplitter: 3, groupForUrls: 4, containerStyle: 'titled', urlType: 'imagesBbCode' },
  // [comparison=team1, team2, team3]https://1.png https://2.png https://3.png[/comparison]
  { regex: regexScreenshotsComparison, groupForTeams: 1, groupForTeamSplitter: 2, groupForUrls: 3, containerStyle: 'comparison', urlType: 'images' }
]
const siteInfoMap = {
  // bracket makes the value of the string 'nexushd' the true key or instead the string 'NHD' will be used as key
  [NHD]: {
    // 主页
    hostName: 'nexushd.org',
    // 匹配页面
    pages: {
      upload: 'upload.php',
      edit: 'edit.php',
      subtitles: 'subtitles.php'
    },
    // 架构
    construct: NEXUSPHP,
    // box 类标签，具备隐藏功能
    targetBoxTag: 'box',
    // 是否支持 [box=...]的形式
    boxSupportDescr: true,
    // [quote=A] displays as 'title': -A---, 'writer': -A wrote---, 'none': ------
    quoteStyle: 'title',
    // 是否需要在 box 标签右括号末端加上换行
    boxNeedBreakLine: false,
    // 不支持的标签
    unsupportedTags: ['align', 'pre'],

    inputFile: $('input[type="file"][name="file"]'),
    nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"), anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"), doubanLinkBox: $("input[name='douban_url']"),
    categorySel: $('#browsecat'), sourceSel: $("select[name='source_sel']"), standardSel: $("select[name='standard_sel']"), processingSel: $("select[name='processing_sel']"), codecSel: $("select[name='codec_sel']"),

    pullMovieScore: false, translatedChineseNameInTitle: false, doubanIdInsteadofLink: false,
    screenshotsStyle: 'conventional',
    categoryInfo: { default: 0, movie: 101, tvSeries: 102, tvShow: 103, documentary: 104, animation: 105 },
    sourceInfo: { default: 0, bluray: 1, hddvd: 2, dvd: 3, hdtv: 4, webdl: 7, webrip: 9 },
    standardInfo: { default: 0, res1080p: 1, res1080i: 2, res720p: 3, res2160p: 6, sd: 4 },
    processingInfo: { default: 0, raw: 1, encode: 2 },
    codecInfo: { default: 0, h264: 1, h265: 2, vc1: 3, xvid: 4, mpeg2: 5, flac: 10, ape: 11 },

    inputFileSubtitle: $('input[type="file"][name="file"]'),
    titleBoxSubtitle: $('input[type="text"][name="title"]'),
    languageSelSubtitle: $('select[name="sel_lang"]'),
    anonymousCheckSubtitle: $("input[name='uplver'][type='checkbox']")[0],
    subtitleInfo: {
      default: 0, english: 6, chinese_simplified: 25, chinese_traditional: 28, japanese: 15, french: 9,
      german: 10, italian: 14, korean: 16, spanish: 26, other: 18
    }
  },
  [PTERCLUB]: {
    hostName: 'pterclub.com',
    pages: {
      upload: 'upload.php',
      edit: 'edit.php',
      subtitles: 'subtitles.php'
    },
    construct: NEXUSPHP,
    targetBoxTag: 'hide',
    boxSupportDescr: true,
    quoteStyle: 'title',
    boxNeedBreakLine: false,
    unsupportedTags: ['align', 'pre'],

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"),
    anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"), doubanLinkBox: $("input[name='douban']"),
    categorySel: $('#browsecat'), sourceSel: $("select[name='source_sel']"), areaSel: $("select[name='team_sel']"),
    chsubCheck: $('#zhongzi')[0], englishSubCheck: $('#ensub')[0], chdubCheck: $('#guoyu')[0], cantodubCheck: $('#yueyu')[0],

    pullMovieScore: true, translatedChineseNameInTitle: false, doubanIdInsteadofLink: false,
    // 对比图风格，conventional 是指缩略图超链接方式
    screenshotsStyle: 'conventional',
    categoryInfo: { default: 0, movie: 401, tvSeries: 404, tvShow: 405, documentary: 402, animation: 403 },
    sourceInfo: { default: 0, bluray: 2, remux: 3, encode: 6, hdtv: 4, webdl: 5, dvd: 7 },
    areaInfo: { default: 0, cnMl: 1, hk: 2, tw: 3, euAme: 4, kor: 5, jap: 6, ind: 7, other: 8 },

    inputFileSubtitle: $('input[type="file"][name="file"]'),
    titleBoxSubtitle: $('input[type="text"][name="title"]'),
    languageSelSubtitle: $('select[name="sel_lang"]'),
    anonymousCheckSubtitle: $("input[name='uplver'][type='checkbox']")[0],
    subtitleInfo: {
      default: 0, english: 6, chinese_simplified: 25, chinese_traditional: 28, japanese: 15, french: 9,
      german: 10, italian: 14, korean: 16, spanish: 26, other: 18
    }
  },
  [PUTAO]: {
    hostName: 'pt.sjtu.edu.cn',
    pages: {
      upload: 'upload.php',
      edit: 'edit.php',
      subtitles: 'subtitles.php'
    },
    construct: NEXUSPHP,
    targetBoxTag: '',
    boxSupportDescr: true,
    quoteStyle: 'none',
    boxNeedBreakLine: false,
    unsupportedTags: ['align', 'center', 'pre'],

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"),
    anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"), doubanLinkBox: $("input[name='douban_url']"),
    categorySel: $('#browsecat'), standardSel: $("select[name='standard_sel']"), codecSel: $("select[name='codec_sel']"),

    pullMovieScore: false, translatedChineseNameInTitle: true, doubanIdInsteadofLink: false,
    screenshotsStyle: 'conventional',
    categoryInfo: {
      default: 0, documentary: 406, animation: 431, movieCn: 401, movieEuAme: 402, movieAsia: 403,
      tvSeriesHkTw: 407, tvSeriesAsia: 408, tvSeriesCnMl: 409, tvSeriesEuAme: 410,
      catTvShowCnMl: 411, tvShowHkTw: 412, tvShowEuAme: 413, tvshowJapKor: 414
    },
    standardInfo: { default: 0, res1080p: 1, res1080i: 2, res720p: 3, res2160p: 6, sd: 4 },
    codecInfo: { default: 0, h264: 1, vc1: 2, xvid: 3, mpeg2: 4, flac: 5, ape: 6, h265: 10 },

    inputFileSubtitle: $('input[type="file"][name="file"]'),
    titleBoxSubtitle: $('input[type="text"][name="title"]'),
    languageSelSubtitle: $('select[name="sel_lang"]'),
    anonymousCheckSubtitle: $("input[name='uplver'][type='checkbox']")[0],
    subtitleInfo: {
      default: 0, english: 6, chinese_simplified: 25, chinese_traditional: 28, japanese: 15, french: 9,
      german: 10, italian: 14, korean: 16, spanish: 26, other: 18
    }
  },
  [MTEAM]: {
    hostName: 'm-team.cc',
    pages: {
      upload: 'upload.php',
      edit: 'edit.php',
      subtitles: 'subtitles.php'
    },
    construct: NEXUSPHP,
    targetBoxTag: 'expand',
    boxSupportDescr: false,
    quoteStyle: 'none',
    boxNeedBreakLine: false,
    unsupportedTags: ['align', 'pre'],

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $('#name'), nameBoxEdit: $("input[type='text'][name='name']"),
    anonymousControl: $("input[name='uplver'][type='checkbox']")[0],
    descrBox: $('#descr'), smallDescBox: $("input[name='small_descr']"),
    imdbLinkBox: $("input[name='url'][type='text']"),
    categorySel: $('#browsecat'), teamSel: $("select[name='team_sel']"), standardSel: $("select[name='standard_sel']"), areaSel: $("select[name='processing_sel']"), codecSel: $("select[name='codec_sel']"),
    chsubCheck: $("input[type='checkbox'][name='l_sub']")[0], chdubCheck: $("input[type='checkbox'][name='l_dub']")[0],

    pullMovieScore: true, translatedChineseNameInTitle: false, doubanIdInsteadofLink: false,
    screenshotsStyle: 'conventional',
    categoryInfo: { default: 0, movieHd: 419, movieRemux: 439, tvSeriesHd: 402, documentary: 404, animation: 405 },
    areaInfo: { default: 0, cnMl: 1, euAme: 2, hkTw: 3, jap: 4, kor: 5, other: 6 },
    standardInfo: { default: 0, res1080p: 1, res1080i: 2, res720p: 3, res2160p: 6, sd: 5 },
    codecInfo: { default: 0, h264: 1, vc1: 2, h265: 16, xvid: 3, mpeg2: 4, flac: 5, ape: 10 },

    inputFileSubtitle: $('input[type="file"][name="file[]"]'),
    titleBoxSubtitle: $('input[type="text"][name="title[]"]'),
    languageSelSubtitle: $('select[name="sel_lang[]"]'),
    anonymousCheckSubtitle: $("input[name='uplver'][type='checkbox']")[0],
    subtitleInfo: {
      default: 0, english: 6, chinese_simplified: 25, chinese_traditional: 28, japanese: 15, korean: 16, other: 18
    }
  },
  [TTG]: {
    hostName: 'totheglory.im',
    pages: {
      upload: 'upload.php',
      edit: 'edit.php',
      subtitles: 'dox.php'
    },
    construct: NEXUSPHP,
    targetBoxTag: '',
    boxSupportDescr: false,
    quoteStyle: 'writer',
    boxNeedBreakLine: false,
    unsupportedTags: ['align', 'center'],

    inputFile: $('input[type="file"][name="file"]'), nameBoxUpload: $("input[type='text'][name='name']"), nameBoxEdit: $("input[type='text'][name='name']"),
    descrBox: $('textarea[name="descr"]'), smallDescBox: $("input[type='text'][name='subtitle']"), subtitleBox: $("input[type='text'][name='highlight']"),
    imdbLinkBox: $("input[name='imdb_c'][type='text']"), doubanLinkBox: $("input[name='douban_id'][type='text']"),
    categorySel: $('select[name="type"]'), anonymousControl: $('select[name="anonymity"]'),

    pullMovieScore: true, translatedChineseNameInTitle: false, doubanIdInsteadofLink: true,
    screenshotsStyle: 'conventional',
    categoryInfo: {
      default: 0, movie720P: 52, movie1080ip: 53, movie2160p: 108, documentary720p: 62, documentary1080ip: 63,
      tvSeriesEuAme: 87, tvSeriesJap: 88, tvSeriesKor: 99, tvSeriesCn: 90, tvShowJap: 101, tvShowKor: 103, tvShow: 60
    }
  },
  [GPW]: {
    hostName: 'greatposterwall.com',
    pages: {
      upload: 'upload.php',
      edit: 'torrents.php?action=edit',
      subtitles: 'subtitles.php'
    },
    construct: GAZELLE,
    targetBoxTag: 'hide',
    boxSupportDescr: true,
    quoteStyle: 'writer',
    boxNeedBreakLine: true,
    unsupportedTags: ['align', 'pre'],

    inputFile: $('#file'),
    mediainfoBox: $('textarea[name="mediainfo[]"]'), descrBox: $('#release_desc'),
    sourceSel: $('select[id="source"]'), codecSel: $('select[id="codec"]'), standardSel: $('select[id="resolution"]'), processingSel: $('select[id="processing"]'), containerSel: $('select[id="container"]'),
    videoInfo: {
      bit10: $('input[type="checkbox"][id="10_bit"]')[0],
      hdr10: $('input[type="checkbox"][id="hdr10"]')[0],
      hdr10plus: $('input[type="checkbox"][id="hdr10plus"]')[0],
      dovi: $('input[type="checkbox"][id="dolby_vision"]')[0]
    },
    audioInfo: {
      dtsX: $('input[type="checkbox"][id="dts_x"]')[0],
      atmos: $('input[type="checkbox"][id="dolby_atmos"]')[0],
      chineseDub: $('input[type="checkbox"][id="chinese_dubbed"]')[0]
    },
    movieEditionCheck: $('input[type="checkbox"][id="movie_edition_information"]')[0],
    movieEditionInfo: {
      criterionCollection: $('a[onclick*="the_criterion_collection"]')[0],
      mastersOfCinema: $('a[onclick*="masters_of_cinema"]')[0],
      withCommentary: $('a[onclick*="with_commentary"]')[0],
      directorCut: $('a[onclick*="director_cut"]')[0],
      theatrical: $('a[onclick*="theatrical_cut"]')[0],
      uncut: $('a[onclick*="uncut"]')[0],
      unrated: $('a[onclick*="unrated"]')[0],
      extended: $('a[onclick*="extended_edition"]')[0],
      remaster4k: $('a[onclick*="4k_remaster"]')[0],
      remaster: $('a[onclick*="remaster"]')[0],
      restoration4k: $('a[onclick*="4k_restoration"]')[0],
      twoInOne: $('a[onclick*="2_in_1"]')[0]
    },
    mixedSubCheck: $('input[type="radio"][id="mixed_subtitles"]')[0],
    noSubCheck: $('input[type="radio"][id="no_subtitles"]')[0],
    otherSubtitlesDiv: $('div[id="other_subtitles"]'),
    subtitleInfo: {
      chinese_simplified: $('input[type="checkbox"][id="chinese_simplified"]')[0],
      chinese_traditional: $('input[type="checkbox"][id="chinese_traditional"]')[0],
      english: $('input[type="checkbox"][id="english"]')[0],
      japanese: $('input[type="checkbox"][id="japanese"]')[0],
      korean: $('input[type="checkbox"][id="korean"]')[0],
      french: $('input[type="checkbox"][id="french"]')[0],
      german: $('input[type="checkbox"][id="german"]')[0],
      italian: $('input[type="checkbox"][id="italian"]')[0],
      polish: $('input[type="checkbox"][id="polish"]')[0],
      romanian: $('input[type="checkbox"][id="romanian"]')[0],
      russian: $('input[type="checkbox"][id="russian"]')[0],
      spanish: $('input[type="checkbox"][id="spanish"]')[0],
      thai: $('input[type="checkbox"][id="thai"]')[0],
      turkish: $('input[type="checkbox"][id="turkish"]')[0],
      vietnamese: $('input[type="checkbox"][id="vietnamese"]')[0],
      hindi: $('input[type="checkbox"][id="hindi"]')[0],
      greek: $('input[type="checkbox"][id="greek"]')[0],
      swedish: $('input[type="checkbox"][id="swedish"]')[0],
      azerbaijani: $('input[type="checkbox"][id="azerbaijani"]')[0],
      bulgarian: $('input[type="checkbox"][id="bulgarian"]')[0],
      danish: $('input[type="checkbox"][id="danish"]')[0],
      estonian: $('input[type="checkbox"][id="estonian"]')[0],
      finnish: $('input[type="checkbox"][id="finnish"]')[0],
      hebrew: $('input[type="checkbox"][id="hebrew"]')[0],
      croatian: $('input[type="checkbox"][id="croatian"]')[0],
      hungarian: $('input[type="checkbox"][id="hungarian"]')[0],
      icelandic: $('input[type="checkbox"][id="icelandic"]')[0],
      latvian: $('input[type="checkbox"][id="latvian"]')[0],
      lithuanian: $('input[type="checkbox"][id="lithuanian"]')[0],
      dutch: $('input[type="checkbox"][id="dutch"]')[0],
      norwegian: $('input[type="checkbox"][id="norwegian"]')[0],
      portuguese: $('input[type="checkbox"][id="portuguese"]')[0],
      slovenian: $('input[type="checkbox"][id="slovenian"]')[0],
      slovak: $('input[type="checkbox"][id="slovak"]')[0],
      latin: $('input[type="checkbox"][id="latin"]')[0],
      ukrainian: $('input[type="checkbox"][id="ukrainian"]')[0],
      persian: $('input[type="checkbox"][id="persian"]')[0],
      arabic: $('input[type="checkbox"][id="arabic"]')[0],
      brazilian_port: $('input[type="checkbox"][id="brazilian_port"]')[0],
      czech: $('input[type="checkbox"][id="czech"]')[0],
      idonesian: $('input[type="checkbox"][id="idonesian"]')[0],
      serbian: $('input[type="checkbox"][id="serbian"]')[0]
    },

    pullMovieScore: true, translatedChineseNameInTitle: false,
    minScreenshots: 3, maxScreenshots: 10, supportedImageHosts: [KSHARE, PIXHOST, PTPIMG, PTERCLUB, ILIKESHOTS, IMGBOX],
    screenshotsStyle: 'comparison',
    sourceInfo: { default: '---', bluray: 'Blu-ray', web: 'WEB', hdtv: 'HDTV', dvd: 'DVD' },
    codecInfo: { default: '---', h264: 'H.264', h265: 'H.265', xvid: 'XviD', divx: 'DivX', x264: 'x264', x265: 'x265' },
    standardInfo: { default: '---', res1080i: '1080i', res1080p: '1080p', res2160p: '2160p', res720p: '720p', sd: '480p' },
    processingInfo: { default: '---', encode: 'Encode', remux: 'Remux' },
    containerInfo: { default: '---', mkv: 'MKV', mp4: 'MP4', avi: 'AVI' },

    inputFileSubtitle: $('#file')
  },
  [UHD]: {
    hostName: 'uhdbits.org',
    pages: {
      upload: 'upload.php',
      edit: 'torrents.php?action=edit',
      subtitles: 'subtitle.php'
    },
    construct: GAZELLE,
    targetBoxTag: 'spoiler',
    boxSupportDescr: true,
    quoteStyle: 'writer',
    boxNeedBreakLine: true,
    unsupportedTags: ['align', 'pre'],

    inputFile: $('#file'),
    mediainfoBox: $('textarea[name="mediainfo"]'), descrBox: $('#release_desc'),
    sourceSel: $('select[id="media"]'), codecSel: $('select[id="codec"]'), standardSel: $('select[id="format"]'), teamBox: $('input[type="text"][id="team"]'),
    categorySel: $('select[id="categories"]'), anonymousControl: $('input[type="checkbox"][id="anonymous"]')[0],
    hdrSel: $('select[id="hdr"]'), seasonSel: $('select[id="season"]'),
    movieEditionInfo: {
      criterionCollection: $('a:contains("Criterion")')[0],
      twoInOne: $('a:contains("2in1")')[0],
      threeInOne: $('a:contains("3in1")')[0],
      bit10: $('a:contains("10-bit")')[0],
      remaster4k: $('a:contains("4K Remaster")')[0],
      restoration4k: $('a:contains("4K Restoration")')[0],
      bAndWVersion: $('a:contains("B & W Version")')[0],
      directorCut: $('a:contains("Director\'s Cut")')[0],
      extras: $('a:contains("Extras")')[0],
      theatrical: $('a:contains("Theatrical")')[0],
      extended: $('a:contains("Extended")')[0],
      hybrid: $('a:contains("Hybrid")')[0],
      imax: $('a:contains("IMAX")')[0],
      remaster: $('a:contains("Remastered")')[0],
      uncut: $('a:contains("Uncut")')[0],
      tvCut: $('a:contains("TV Cut")')[0],
      unrated: $('a:contains("Unrated")')[0],
    },

    pullMovieScore: true, translatedChineseNameInTitle: false,
    screenshotsStyle: 'conventional',
    sourceInfo: { default: '---', bluray: 'Blu-ray', remux: 'Remux', encode: 'Encode', webdl: 'WEB-DL', webrip: 'WEBRip', hdrip: 'HDRip', hdtv: 'HDTV', others: 'Others', hdAudio: 'HD Audio' },
    codecInfo: { default: '---', h264: 'H.264', h265: 'HEVC', vc1: 'VC-1', mpeg2: 'MPEG-2', av1: 'AV1', x264: 'x264', x265: 'x265', x266: 'x266' },
    standardInfo: { default: '---', mhd: 'mHD', res1080i: '1080i', res1080p: '1080p', res2160p: '2160p', res720p: '720p', others: 'Others' },
    hdrInfo: { default: 'No', hdr10: 'HDR10', hdr10plus: 'HDR10+', dovi: 'DoVi' },
    categoryInfo: { movie: '0', music: '1', tvSeries: '2' },
    seansonInfo: { default: '---', s01: '1' },

    inputFileSubtitle: $('input[type="file"][name="sub"]'),
    titleBoxSubtitle: $('input[type="text"][name="releasename"]'),
    languageSelSubtitle: $('select[name="language"]'),
    subtitleInfo: {
      default: '', english: 'English', vietnamese: 'Vietnamese', danish: 'Danish', norwegian: 'Norwegian', finnish: 'Finnish', spanish: 'Spanish', french: 'French'
    }
  }
}
const imageHostInfoMap = {
  [PIXHOST]: {
    images2Thumbs: {
      pattern: /https:\/\/img(\d+)\.pixhost\.to\/images\/([\w/]+)\.png/gi,
      replacement: '[url=https://pixhost.to/show/$2.png][img]https://t$1.pixhost.to/thumbs/$2.png[/img][/url]'
    },
    thumbs2Images: {
      pattern: /\[url=https:\/\/pixhost\.to\/show\/([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+.png)\]\s*\[img\]https:\/\/t([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\.pixhost[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\]\s*\[\/url\]/gi,
      replacement: 'https://img$2.pixhost.to/images/$1'
    }
  },
  [IMGBOX]: {
    images2Thumbs: {
      pattern: /https:\/\/images(\d+)\.imgbox\.com\/(\w+\/\w+)\/(\w+)_o\.png/gi,
      replacement: '[url=https://imgbox.com/$3][img]https://thumbs$1.imgbox.com/$2/$3_t.png[/img][/url]'
    },
    thumbs2Images: {
      pattern: /\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\s*\[img\]https:\/\/thumbs([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)_t\.png\[\/img\]\s*\[\/url\]/gi,
      replacement: 'https://images$1_o.png'
    }
  },
  [IMG4K]: {
    images2Thumbs: null,
    thumbs2Images: {
      pattern: /\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\s*\[img\]([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\.md\.png\[\/img\]\s*\[\/url\]/gi,
      replacement: '$1.png'
    }
  },
  [ILIKESHOTS]: {
    images2Thumbs: null,
    thumbs2Images: null
  },
  [PTERCLUB]: {
    images2Thumbs: null,
    thumbs2Images: {
      pattern: /\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\s*\[img\]([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\.th\.png\[\/img\]\s*\[\/url\]/gi,
      replacement: '$1.png'
    }
  },
  [IMGPILE]: {
    images2Thumbs: null,
    thumbs2Images: {
      pattern: /\[url=https:\/\/imgpile\.com\/i\/([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\]\s*\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\.png\[\/img\]\s*\[\/url\]/gi,
      replacement: 'https://imgpile.com/images/$1.png'
    }
  },
  [PTPIMG]: {
    images2Thumbs: null,
    thumbs2Images: null
  },
  [KSHARE]: {
    images2Thumbs: null,
    thumbs2Images: null
  }
}
//= ========================================================================================================
// functions
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// 生成teamSplitter的正则表达组合以escape特定组名，如teams = ['D-Z0N3'], splitters = ['-'], 返回'(?<=D)-(?!Z0N3)|(?<!D)-(?=Z0N3)|(?<!D)-(?!Z0N3)'
function getTeamSplitterRegex(teams, splitters, flags='') {
  let patterns = []
  for (let splitter of splitters) {
    let leftPatterns = []
    let rightPatterns = []
    for (let team of teams) {
      let i = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let lastIndex = team.indexOf(splitter, i)
        if (lastIndex >= 0) {
          let [left, right] = [escapeRegExp(team.substring(0, lastIndex)), escapeRegExp(team.substring(lastIndex + splitter.length))]
          if (left && right) {
            patterns.push(`(?<=${left})${escapeRegExp(splitter)}(?!${right})`)
            patterns.push(`(?<!${left})${escapeRegExp(splitter)}(?=${right})`)
            leftPatterns.push(left)
            rightPatterns.push(right)
          } else if (left) {
            patterns.push(`(?<!${left})${escapeRegExp(splitter)}`)
            leftPatterns.push(left)
          } else if (right) {
            patterns.push(`${escapeRegExp(splitter)}(?!${right})`)
            rightPatterns.push(right)
          }
          i = lastIndex + 1
        } else {
          break
        }
      }
    }
    if (leftPatterns.length || rightPatterns.length) {
      patterns.push(`(?<!${leftPatterns.join('|')})${escapeRegExp(splitter)}(?!${rightPatterns.join('|')})`)
    } else {
      patterns.push(escapeRegExp(splitter))
    }
  }
  let regex = RegExp(patterns.join('|'), flags)
  return [regex, patterns]
}
// requires numbers of left and right tags match, other wise some of the contents may be removed
// keepNonQuoted 选择是否保留两个0级别 quote 之间的内容，如'是这些文字[quote]不是这些文字[/quote]是这些文字[quote]不是这些文字[/quote]是这些文字'
function processTags (inputText, tag, processLeft, processRight, keepNonQuoted=true) {
  let regexTagsLeft = new RegExp('\\[((' + tag + ')((?:=([^\\]]+))?))\\]', 'g')
  let regexTagsRight = new RegExp('\\[\\/(' + tag + ')\\]', 'g')
  let outputText = ''
  let remainedText = ''
  let indexOutput = 0
  let indexRemained = 0
  let currentLevel = 0
  // eslint-disable-next-line no-constant-condition
  while(true) {
    regexTagsLeft.lastIndex = indexOutput
    regexTagsRight.lastIndex = indexOutput
    let matchLeft = regexTagsLeft.exec(inputText)
    let matchRight = regexTagsRight.exec(inputText)
    let match = null
    let left = true
    if (matchLeft && matchRight) {
      if (matchLeft.index < matchRight.index) {
        match = matchLeft
        left = true
      } else {
        match = matchRight
        left = false
      }
    } else {
      left = matchLeft
      match = matchLeft
        ? matchLeft
        : matchRight
          ? matchRight
          : null
    }
    if (match) {
      if (currentLevel === 0) {
        if (left) {
          // 左括号，0级，根据 keepNonQuoted 确定是否保留上一次匹配末尾到本次匹配之间的内容
          indexOutput = keepNonQuoted ? indexOutput : match.index
        } else {
          // 右括号，0级，无法匹配，扔掉前面的内容，直接从本次匹配末尾开始
          indexOutput = match.index + match[0].length
        }
      }
      if (indexOutput < match.index) {
        outputText += inputText.substring(indexOutput, match.index)
        indexOutput = match.index
      } else {
        // indexOutput === match.index || indexOutput === match.index + match[0].length
        remainedText += inputText.substring(indexRemained, match.index)
        indexRemained = match.index
      }
      if (indexOutput < match.index + match[0].length) {
        outputText += left
          ? processLeft(match[0])
          : processRight(match[0])
      } else {
        remainedText += left
          ? processLeft(match[0])
          : processRight(match[0])
      }
      indexOutput = match.index + match[0].length
      indexRemained = indexOutput
      left ? currentLevel++
        : currentLevel >=1
          ? currentLevel--
          : 0
    } else {
      if (currentLevel === 0) {
        if (keepNonQuoted) {
          outputText += inputText.substring(indexOutput)
        } else {
          remainedText += inputText.substring(indexRemained)
        }
      } else {
        outputText += inputText.substring(indexOutput)
      }
      break
    }
  }
  return [outputText, remainedText]
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
  const pat3 = '(\\[' + targetBoxTag + '(?:=[^\\]]+)?\\](?:(?!\\[\\/)[\\s\\S])*\\[(?:font|b|i|u|color|size)(?:=[^\\]]+)?\\])\\r?\\n+([^\\r\\n])'
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
  if (!torrentName) {
    return ''
  } else {
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
        .replace(/((?<!\d{1,2})\.)|(\.(?!\d\b))/g, ' ')//点号前面是数字（一至两位），后面是单个数字的情况不替换（DDP5.1）
        .replace(/\//g, '.')
        .trim()
    )
  }
}
// eslint-disable-next-line no-unused-vars
function getThumbSize(numTeams, siteName) {
  return numTeams === 2
      ? 300
      : numTeams === 3
        ? 250
        : numTeams === 4
          ? 190
          : numTeams === 5
            ? 150
            : 150
}
// decode [url=...][img]...[/img][/url] -> https://1.png
async function thumbs2ImageUrls (thumbUrls, numTeams, siteName) {
  thumbUrls = thumbUrls.trim()
  const imageHostName = Object.keys(imageHostInfoMap).find(ih => thumbUrls.match(RegExp(escapeRegExp(ih), 'i'))) || ''
  const imageHost = imageHostInfoMap[imageHostName]
  if (!imageHost) {
    return []
  }
  let pattern = imageHost.thumbs2Images ? imageHost.thumbs2Images.pattern : ''
  let replacement = imageHost.thumbs2Images ? imageHost.thumbs2Images.replacement : ''
  let imageUrls = []
  if (pattern) {
    const matches = thumbUrls.match(pattern)
    const site = siteInfoMap[siteName]
    const supportCurrentImageHost = site.supportedImageHosts ? site.supportedImageHosts.includes(imageHostName) : true
    const supportPixhost = site.supportedImageHosts ? site.supportedImageHosts.includes(PIXHOST) : true
    let imageUrlsTest = matches
      ? matches.map(matched => {
        return matched.replace(pattern, replacement)
      })
      : []
    if (supportCurrentImageHost) {
      imageUrls = imageUrlsTest
    } else if (supportPixhost) {
      const size = getThumbSize(numTeams, siteName)
      thumbUrls = await sendImagesToPixhost(imageUrlsTest, size)
      imageUrls = await thumbs2ImageUrls(thumbUrls.join(' '), numTeams, siteName)
    }
  }
  return imageUrls
}
// https://1.png -> [url=...][img]...[/img][/url]
async function images2ThumbUrls (imageUrls, numTeams, siteName) {
  imageUrls = imageUrls.trim()
  const imageHostName = Object.keys(imageHostInfoMap).find(ih => imageUrls.match(RegExp(escapeRegExp(ih), 'i'))) || ''
  const imageHost = imageHostInfoMap[imageHostName]
  if (!imageHost) {
    return []
  }
  let pattern = imageHost.images2Thumbs ? imageHost.images2Thumbs.pattern: ''
  let replacement = imageHost.images2Thumbs ? imageHost.images2Thumbs.replacement: ''
  const site = siteInfoMap[siteName]
  const supportCurrentImageHost = site.supportedImageHosts ? site.supportedImageHosts.includes(imageHostName) : true
  const supportPixhost = site.supportedImageHosts ? site.supportedImageHosts.includes(PIXHOST) : true
  const size = getThumbSize(numTeams, siteName)
  let thumbUrls = []
  if (pattern) {
    const matches = imageUrls.match(pattern)
    if (supportCurrentImageHost) {
      thumbUrls = matches
        ? matches.map(matched => {
          return matched.replace(pattern, replacement)
        })
        : []
    } else {
      thumbUrls = matches && supportPixhost
        ? await sendImagesToPixhost(matches, size)
        : []
    }
  } else {
    // 不可从图片链接解析缩略图的图床（如PTPIMG），发送至Pixhost
    pattern = /(https?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\.(png|jpg))/gi
    const matches = imageUrls.match(pattern)
    thumbUrls = matches && supportPixhost
      ? await sendImagesToPixhost(matches, size)
      : []
  }
  return thumbUrls
}
function mediainfo2String(mediainfo) {
  let mediainfoStr = ''
  if (!mediainfo) {
    return mediainfoStr
  }
  Object.entries(mediainfo).forEach(([sectorKey, sector]) => {
    mediainfoStr += `${sectorKey}\n`
    Object.entries(sector).forEach(([fieldKey, fieldValue]) => {
      // at least keep 1 empty space
      let emptyLength = Math.max(mediainfoKeyLength - fieldKey.length, 1)
      mediainfoStr += `${fieldKey}${' '.repeat(emptyLength)}: ${fieldValue}\n`
    })
    mediainfoStr += '\n'
  })
  return mediainfoStr
}
function string2Mediainfo (mediainfoStr) {
  let mi = {}
  if (!mediainfoStr) {
    return mi
  }
  let currentSectorKey = ''
  // \r is for clipboard content operation
  mediainfoStr.split(/\r?\n/g).forEach(sector => {
    if (sector && sector.trim()) {
      let [fieldKey, fieldValue] = sector.split(/ +: +/)
      if (fieldKey) {
        fieldKey = fieldKey.trim()
        if (fieldValue) {
          fieldValue = fieldValue.trim()
          if (currentSectorKey) {
            mi[currentSectorKey][fieldKey] = fieldValue
          } else {
            // invalid mediainfo format
            mi = {}
            return
          }
        } else {
          currentSectorKey = fieldKey
          mi[currentSectorKey] = {}
        }
      }
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
            reject(new Error('Failed to upload'))
          }
        }
      }
    })
  })
}
// 提取全部对比图信息
function collectComparisons (text) {
  const replacements = []
  let lastIndex = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const currentIndex = lastIndex
    for (let type of regexInfo) {
      const regex = type.regex
      regex.lastIndex = lastIndex
      const match = regex.exec(text)
      if (match) {
        const result = { starts: 0, ends: 0, teams: [], urls: [], containerStyle: '', urlType: '', text: '' }
        result.containerStyle = type.containerStyle
        result.urlType = type.urlType
        if (type.groupForTeams >= 0 && type.groupForTeamSplitter >= 0) {
          let teamSplitter = match[type.groupForTeamSplitter]
          result.teams = match[type.groupForTeams]
            .split(teamSplitter)
            .map(ele => { return ele.trim() })
        }
        if (type.groupForUrls >= 0) {
          const urls = match[type.groupForUrls]
          if (type.urlType === 'thumbsBbCode') {
            result.urls = urls.match(regexScreenshotsThumbs)
          } else if (type.urlType === 'imagesBbCode') {
            result.urls = urls.match(regexScreenshotsImages)
          } else if (type.urlType === 'images') {
            result.urls = urls.match(regexImageUrl)
          }
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
// 从简介中提取信息并格式化截图
async function decomposeDescription (siteName, textToConsume, mediainfoStr, torrentTitle) {
  let mediainfo = {}
  let description = ''
  const site = siteInfoMap[siteName]
  // 优先从简介中获取mediainfo，避免mediainfo框内容陈旧导致冲突
  const tagForMediainfo = site.targetBoxTag || 'quote'
  const regexMIStr = site.boxSupportDescr
    ? '\\[(' + tagForMediainfo + '|quote)\\s*=\\s*mediainfo\\]\\s*(General\\s+Unique ID[^\\0]+?)\\[\\/\\1\\]'
    : '\\[(' + tagForMediainfo + '|quote)\\]\\s*(General\\s+Unique ID[^\\0]+?)\\[\\/\\1\\]'
  // 如果存在多个mediainfo，一般是因为简介中包含了Source MediaInfo，多为remux
  let regexMi = RegExp(regexMIStr, 'gim')
  let mediainfoArray = []
  let results = []
  // eslint-disable-next-line no-cond-assign
  while (mediainfoArray = regexMi.exec(textToConsume)) {
    let miStr = mediainfoArray[2]
      .replace(/^\s*\[\w+(\s*=[^\]]+)?\]/g, '')
      .replace(/\s*\[\/\w+\]\s*$/g, '')
    let mi = string2Mediainfo(miStr)
    let completeName = mi.General
      ? mi.General['Complete name'] || mi.General['Movie name'] || ''
      : ''
    results.push({ 'mediainfo': mi, 'index': mediainfoArray.index, 'length': mediainfoArray[0].length, 'completeName': completeName })
  }
  if (results.length) {
    let encodeResult = { 'mediainfo': {}, 'index': 0, 'length': 0, 'completeName': '' }
    if (results.length === 1) {
      // 匹配到单个mediainfo
      encodeResult = results[0]
    } else {
      // 如果匹配到多个mediainfo，一般是因为其中有Source mediainfo，多为remux
      results.forEach(result => {
        if (!result.completeName.match(/\bremux\b/i)) {
          encodeResult = result
          return
        }
      })
    }
    mediainfo = encodeResult.mediainfo
    // if the site has a place to fill out the mediainfo, remove it in the description box
    if (site.mediainfoBox && encodeResult.length) {
      textToConsume = textToConsume.substring(0, encodeResult.index) +
        textToConsume.substring(encodeResult.index + encodeResult.length)
    }
  } else {
    // 若简介中无mediainfo信息，读取mediainfoStr
    mediainfo = string2Mediainfo(mediainfoStr)
  }
  if (!torrentTitle && mediainfo && mediainfo.General) {
    torrentTitle = mediainfo.General['Complete name'] || mediainfo.General['Movie name']
    if (torrentTitle) {
      torrentTitle = torrentTitle.replace(/.*?([^\\]+)$/, '$1')
      torrentTitle = formatTorrentName(torrentTitle)
    }
  }
  if (site.screenshotsStyle === 'conventional') {
    const comparisons = collectComparisons(textToConsume)
      .sort((a, b) => b.starts - a.starts)
    // eslint-disable-next-line no-unused-vars
    for (let { starts, ends, teams, urls, containerStyle, urlType } of comparisons) {
      // convert to titled style no matter what the original style is
      if (urlType === 'images') {
        urls = await images2ThumbUrls(urls.join(' '), teams.length, siteName)
      } else if (urlType === 'imagesBbCode') {
        urls = urls.map(url => url.replace(/\[img\](.+?)\[\/img\]/, '$1'))
        urls = await images2ThumbUrls(urls.join(' '), teams.length, siteName)
      }
      let screenshotsStr = ''
      if (urls.length > 0) {
        screenshotsStr = `[b]${teams.join(' | ')}[/b]`
        urls.forEach((url, i) => {
          screenshotsStr += (i % teams.length === 0
            ? '\n' + url
            : ' ' + url)
        })
        screenshotsStr = site.unsupportedTags.includes('center')
          ? `${screenshotsStr}\n`
          : `[center]${screenshotsStr}[/center]\n`
      }
      textToConsume = textToConsume.substring(0, starts) +
        screenshotsStr +
        textToConsume.substring(ends)
    }
    if (site.quoteStyle === 'writer') {
      [description] = processTags(
        textToConsume, 'quote',
        matchLeft => { return matchLeft.replace(/\[quote(?:=([^\]]+))\]/g, '[b]$1[/b]\n[quote]') },
        matchRight => { return matchRight },
        true)
    } else {
      description = textToConsume
    }
  } else if (site.screenshotsStyle === 'comparison') {
    let teamEncode = ''
    let screenshots = ''
    let currentScreenshots = 0
    const teamArray = torrentTitle.match(/\b(D-Z0N3)|(([^\s-@]*)(@[^\s-]+)?)$/)
    if (teamArray) {
      teamEncode = teamArray[0]
    }
    let screenshotsStrAll = ''
    const comparisons = collectComparisons(textToConsume)
      .sort((a, b) => b.starts - a.starts)
    for (let { starts, ends, teams, urls, containerStyle, urlType } of comparisons) {
      let screenshotsStr = ''
      if (containerStyle === 'comparison') {
        screenshotsStr = textToConsume.substring(starts, ends)
      } else if (containerStyle === 'boxed' || containerStyle === 'titled') {
        if (urlType === 'thumbsBbCode') {
          urls = await thumbs2ImageUrls(urls.join(' '), teams.length, siteName)
        } else if (urlType === 'imagesBbCode') {
          urls = urls.map(url => url.replace(/\[img\](.+?)\[\/img\]/, '$1'))
        }
        if (urls.length > 0) {
          screenshotsStr = `[comparison=${teams.join(', ')}]${urls.join(' ')}[/comparison]`
        }
      }
      screenshotsStrAll = `${screenshotsStr}\n${screenshotsStrAll}`
      // 如果之前没有获取到teamEncode，直接用Encode赋值，避免后续'includes'判断错误（string.includes('') === true）
      teamEncode = teamEncode || 'Encode'
      if (urls.length > 0 && urls.length % teams.length === 0) {
        if (!teams.find(team => team.toLowerCase() === teamEncode.toLowerCase() || team.toLowerCase() === 'encode')) {
          // 截图对比描述中可能会多一些内容，如 Source vs TayTO<Shout Factory> vs CRiSC<MGM>
          teamEncode = teams.find(team => team.toLowerCase().includes(teamEncode.toLowerCase()) || team.toLowerCase().includes('encode'))
        }
        if (teamEncode && !screenshots && urls.length / teams.length >= site.minScreenshots) {
          for (let i = 0; i < urls.length; i++) {
            let image = urls[i]
            const teamCurrent = teams[i % teams.length]
            if (currentScreenshots < site.maxScreenshots && (teamCurrent.toLowerCase() === 'encode' || teamCurrent.toLowerCase() === teamEncode.toLowerCase())) {
              if (image.match(/\[img\].+?\[\/img\]/)) {
                screenshots += image
              } else {
                screenshots += `[img]${image}[/img]`
              }
              currentScreenshots += 1
            }
          }
        }
      }
      textToConsume = textToConsume.substring(0, starts) +
        screenshotsStr +
        textToConsume.substring(ends)
    }
    if (screenshots) {
      screenshotsStrAll += `[b]Screenshots[/b]\n${screenshots}`
    }
    let [quotes, remained] = processTags(
      textToConsume, 'quote',
      matchLeft => {
        return site.quoteStyle === 'writer'
          ? matchLeft.replace(/\[quote(?:=([^\]]+))\]/g, '[b]$1[/b]\n[quote]')
          : matchLeft
      },
      matchRight => { return matchRight },
      false)
    // 只是为了提取出 boxes
    let [boxes] = processTags(remained, site.targetBoxTag,
      matchLeft => { return matchLeft },
      matchRight => { return matchRight },
      false)
    description = `${quotes}${boxes}\n${screenshotsStrAll}`
  }
  return [description, mediainfo, torrentTitle]
}
// 处理简介文本
function processDescription (siteName, description) {
  const site = siteInfoMap[siteName]
  const targetBoxTag = site.targetBoxTag
  const boxSupportDescr = site.boxSupportDescr
  const boxNeedBreakLine = site.boxNeedBreakLine
  const allTagBoxesStr = allTagBoxes.join('|')
  const otherTagBoxesStr = allTagBoxes.filter(tag => tag !== site.targetBoxTag).join('|')
  const unsupportedTagsStr = site.unsupportedTags.join('|')
  // 对于不支持box标签的站，统一替换为'quote'标签
  const replaceTag = targetBoxTag || 'quote'
  if (targetBoxTag) {
    description = nestExplode(description, targetBoxTag)
    description = compactContent(description, targetBoxTag)
  }
  description = description
    // 处理 mediainfo 容器标签，切换为 [box=mediainfo] 的形式，以便于后续统一匹配 mediainfo
    .replace(RegExp('\\[(' + allTagBoxesStr + '|quote|code)(?:\\s*=\\s*mediainfo)?\\]\\s*(General\\s+Unique ID[^\\0]+?)\\[\\/\\1\\]', 'gim'),
      boxSupportDescr
        ? `[${replaceTag}=mediainfo]$2[/${replaceTag}]`
        : `[${replaceTag}]$2[/${replaceTag}]`)
    // NHD mediainfo style
    .replace(/\[mediainfo\](\s*General\s+Unique ID[^\0]+?)\[\/mediainfo\]/gim,
      boxSupportDescr
        ? `[${replaceTag}=mediainfo]$1[/${replaceTag}]`
        : `[${replaceTag}]$1[/${replaceTag}]`)
    // 处理除了 mediainfo 以外的容器类标签
    // 注意 allTagBoxesStr（由多个'|'组成）不需要 escape
    // 注意 GPW虽然 boxSupportDescr===true，但显示效果有区别，所以最后也会处理为`[b]$1[/b]\n[${replaceTag}]`形式，
    // 但这一操作会留到后续才执行，因为现在需要保留这个格式方便识别
    .replace(RegExp('\\[(?:' + otherTagBoxesStr + ')(=([^\\]]+))\\]', 'g'),
      boxSupportDescr
        ? `[${replaceTag}$1]`
        : `[b]$2[/b]\n[${replaceTag}]`)
    .replace(RegExp('\\[(?:' + otherTagBoxesStr + ')\\]', 'g'), `[${replaceTag}]`)
    .replace(RegExp('\\[\\/(?:' + otherTagBoxesStr + ')\\]', 'g'), `[/${replaceTag}]`)
    .replace(RegExp('\\[\\/(?:' + replaceTag + ')\\](?!\\r?\\n)', 'g'),
      boxNeedBreakLine
        ? `[/${replaceTag}]\n`
        : `[/${replaceTag}]`)
    // 不支持的标签
    .replace(RegExp('\\[\\/?(' + unsupportedTagsStr + ')(=[^\\]]+)?\\]', 'g'), '\n')
    .replace(/(\[\/?)(\w+)((?:=(?:[^\r\n\t\f\v [\]])+)?\])/g, (_, p1, p2, p3) => {
      return p1 + p2.toLowerCase() + p3
    })
    .replace(/(?:(?:\[\/(url|flash|flv))|^)(?:(?!\[(url|flash|flv))[\s\S])*(?:(?:\[(url|flash|flv))|$)/g, matches => {
      return (matches.replace(/\[align(=\w*)?\]/g, '\n'))
    })
    // 去除头尾空白
    .replace(/^\s*([\s\S]*\S)\s*$/g, '$1')
    // 至多两个换行
    .replace(/(\r?\n){3,}/g, '\n\n')
    // for pterclub
    .replace(/\[(\/?img)\d+\]/g, '[$1]')
  if (siteName === GPW) {
    description = description
      .replace(/\[\/?(size|color|font|b|i|u|pre)(=[^\]]+)?\]/g, '')
      .replace(/\[\/?center\]/g, '\n')
  }
  return description
}
(() => {
  'use strict'
  //= ========================================================================================================
  // Main
  const siteName = Object.keys(siteInfoMap).find(sn => {
    let st = siteInfoMap[sn]
    return window.location.href.match(escapeRegExp(st.hostName))
  })
  let page = ''
  let site = {}
  if (siteName) {
    site = siteInfoMap[siteName]
    page = Object.keys(site.pages).find(pg => {
      let url = `${site.hostName}/${site.pages[pg]}`
      return window.location.href.match(escapeRegExp(url))
    })
  }
  if (!siteName || !page) {
    return
  }
  console.log(`running in site ${siteName} and page ${page}`)
  if (page === 'upload' || page === 'edit') {
    //= ========================================================================================================
    // 上传和编辑种子页面
    const nameBox = page === 'upload'
      ? site.nameBoxUpload
      : site.nameBoxEdit
    const btnBingo = $('<input>')
    if (site.construct === NEXUSPHP) {
      btnBingo.attr({
        type: 'button',
        name: 'bingo',
        value: 'BINGO',
        style: 'font-size: 11px; font-weight: bold; color: blue; margin-right: 3px'
      })
      const tableBingo = $('<table>').attr({
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
      if (siteName === MTEAM || siteName === NHD || siteName === PTERCLUB || siteName === PUTAO) {
        $('#compose input[name="quote"]').closest('table').after(tableBingo)
      } else if (siteName === TTG) {
        $('#upload input[name="quote"]').closest('table').after(tableBingo)
      }
    } else if (site.construct === GAZELLE) {
      if (siteName === GPW) {
        btnBingo.attr({
          type: 'button',
          name: 'bingo',
          value: 'BINGO',
          style: 'font-weight: bold; color: white;',
          class: 'BBCodeToolbar-button'
        })
        const bbcodeToolbar = $('div.BBCodeToolbar').closest('#description-container').find('div.BBCodeToolbar')
        bbcodeToolbar.append(btnBingo)
      } else if (siteName === UHD) {
        btnBingo.attr({
          type: 'button',
          name: 'bingo',
          value: 'BINGO',
          style: 'font-weight: bold; color: white;',
          class: 'wysibb-toolbar-btn'
        })
        const divBingo = $('<div>').attr({
          class: 'wysibb-toolbar-container'
        }).append(btnBingo)
        const bbcodeToolbar = $('div.wysibb-toolbar').closest('#textarea_wrap_0').find('div.wysibb-toolbar')
        bbcodeToolbar.append(divBingo)
      }
    }
    // function definition
    btnBingo.on('click', async () => {
      const oriTextBingo = btnBingo.val()
      const torrentInfo = {}
      try {
        btnBingo.val('Handling')
        //= ========================================================================================================
        // processing description
        let textToConsume = ''
        if (site.construct === NEXUSPHP) {
          const oldText = site.descrBox.val()
          let readClipboard = false
          if (siteName === NHD || siteName === PTERCLUB || siteName === PUTAO || siteName === MTEAM) {
            readClipboard = !oldText
          } else if (siteName === TTG) {
            readClipboard = !oldText ? true : oldText.length < 125
          }
          textToConsume = readClipboard ? await navigator.clipboard.readText() : oldText
        } else if (site.construct === GAZELLE) {
          const oldText = site.descrBox.val()
          let readClipboard = !oldText
          if (readClipboard) {
            btnBingo.focus()
          }
          textToConsume = readClipboard ? await navigator.clipboard.readText() : oldText
        }
        textToConsume = processDescription(siteName, textToConsume)
        // 为了在未选择种子文件的情况下也能获取torrentTitle，将torrentTitle中信息的识别放到mediainfo之后
        // 优先读取nameBox
        torrentInfo.torrentTitle = nameBox ? nameBox.val() : ''
        // 再读取inpuFile
        if (!torrentInfo.torrentTitle) {
          let inputFile = (site.inputFile.val() || '').replace(/.*?([^\\]+)$/, '$1')
          torrentInfo.torrentTitle = formatTorrentName(inputFile)
        }
        //= ========================================================================================================
        let mediainfoStr = site.mediainfoBox ? site.mediainfoBox.val() : ''
        // decompose description (and generate comparison screenshots)
        ;[textToConsume, torrentInfo.mediainfo, torrentInfo.torrentTitle] = await decomposeDescription(siteName, textToConsume, mediainfoStr, torrentInfo.torrentTitle)
        torrentInfo.audioInfo = {
          dtsX: false, atmos: false, chineseDub: false, foreignDub: false, cantoneseDub: false, commentary: false
        }
        torrentInfo.videoInfo = {
          bit10: false, hdr10: false, hdr10plus: false, dovi: false, container: ''
        }
        torrentInfo.subtitleInfo = {}
        Object.keys(subtitleLanguages).forEach(lang => {
          torrentInfo.subtitleInfo[lang] = false
        })
        // info from mediainfo
        Object.entries(torrentInfo.mediainfo).forEach(([infoKey, infoValue]) => {
          if (infoKey.match(/text( #\d+)?/i)) {
            // subtitle
            let matchLang = false
            const language = [infoValue.Language || '', infoValue.Title || ''].join(' ')
            if (language.match(/chinese/i)) {
              if (language.match(/cht|traditional/i)) {
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
                  return
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
            if (title.match(/cantonese|粤语|广东话|粤配/i) || language.match(/cantonese|粤语|广东话|粤配/i)) {
              torrentInfo.audioInfo.cantoneseDub = true
              console.log('Cantonese dub')
            } else if (title.match(/chinese|mandarin|国语|普通话|国配/i) || language.match(/chinese|mandarin|国语|普通话|国配/i)) {
              torrentInfo.audioInfo.chineseDub = true
              console.log('Chinese Mandarin dub')
            } else {
              torrentInfo.audioInfo.foreignDub = true
              console.log('Foreign dub')
            }
            const commecialName = infoValue['Commercial name']
            if (commecialName) {
              if (commecialName.match(/Dolby Atmos/i)) {
                torrentInfo.audioInfo.atmos = true
                console.log('Dolby Atmos')
              } else if (commecialName.match(/DTS-HD Master Audio/i)) {
                torrentInfo.audioInfo.dtsX = true
                console.log('DTS:X')
              }
            }
          } else if (infoKey.match(/video/i)) {
            // video
            const hdrFormat = infoValue['HDR format']
            const bitDepth = infoValue['Bit depth']
            if (hdrFormat) {
              if (hdrFormat.match(/HDR10\+/i)) {
                torrentInfo.videoInfo.hdr10plus = true
                console.log('HDR10+')
              } else if (hdrFormat.match(/HDR10/i)) {
                torrentInfo.videoInfo.hdr10 = true
                console.log('HDR10')
              }
              if (hdrFormat.match(/Dolby Vision/i)) {
                torrentInfo.videoInfo.dovi = true
                console.log('Dolby Vision')
              }
            } else if (bitDepth.match(/10 bits/i)) {
              torrentInfo.videoInfo.bit10 = true
              console.log('10 bits')
            }
          } else if (infoKey.match(/general/i)) {
            // general
            if (infoValue.Format === 'Matroska') {
              torrentInfo.videoInfo.container = 'MKV'
            } else if (infoValue.Format === 'MPEG-4') {
              torrentInfo.videoInfo.container = 'MP4'
            } else if (infoValue.Format === 'AVI') {
              torrentInfo.videoInfo.container = 'AVI'
            } else {
              torrentInfo.videoInfo.container = infoValue.Format.trim()
            }
            console.log(torrentInfo.videoInfo.container)
            // 如果 torrentInfo.torrentTitle 尚未被赋值，直接使用mediainfo 中的值
            torrentInfo.torrentTitle = torrentInfo.torrentTitle ||
              formatTorrentName(infoValue['Complete name']) ||
              formatTorrentName(infoValue['Movie name'])
          }
        })
        //= ========================================================================================================
        // info from title
        torrentInfo.editionInfo = {}
        torrentInfo.sourceInfo = {}
        torrentInfo.standardInfo = {}
        torrentInfo.processingInfo = {}
        torrentInfo.codecInfo = {}
        if (torrentInfo.torrentTitle) {
          // edition
          torrentInfo.editionInfo.criterionCollection = torrentInfo.torrentTitle.match(/\bcc|criterion\b/i)
          torrentInfo.editionInfo.mastersOfCinema = torrentInfo.torrentTitle.match(/\bmoc\b/i)
          torrentInfo.editionInfo.directorCut = torrentInfo.torrentTitle.match(/\bdc\b/i)
          torrentInfo.editionInfo.unrated = torrentInfo.torrentTitle.match(/\bunrated\b/i)
          torrentInfo.editionInfo.uncut = torrentInfo.torrentTitle.match(/\buncut\b/i)
          torrentInfo.editionInfo.theatrical = torrentInfo.torrentTitle.match(/\btheatrical\b/i)
          torrentInfo.editionInfo.extended = torrentInfo.torrentTitle.match(/\bextended\b/i)
          torrentInfo.editionInfo.remaster4k = torrentInfo.torrentTitle.match(/\b4k remaster\b/i)
          torrentInfo.editionInfo.remaster = !torrentInfo.editionInfo.remaster4k && torrentInfo.torrentTitle.match(/\bremaster\b/i)
          torrentInfo.editionInfo.restoration4k = torrentInfo.torrentTitle.match(/\b4k restoration\b/i)
          torrentInfo.editionInfo.twoInOne = torrentInfo.torrentTitle.match(/\b2in1\b/i)
          torrentInfo.editionInfo.threeInOne = torrentInfo.torrentTitle.match(/\b3in1\b/i)
          torrentInfo.editionInfo.hybrid = torrentInfo.torrentTitle.match(/\bhybrid\b/i)
          torrentInfo.editionInfo.imax = torrentInfo.torrentTitle.match(/\bimax\b/i)
          torrentInfo.editionInfo.tvCut = torrentInfo.torrentTitle.match(/\btv ?cut\b/i)
          // source
          torrentInfo.sourceInfo.remux = torrentInfo.torrentTitle.match(/\b(remux)\b/i)
          torrentInfo.sourceInfo.encode = torrentInfo.torrentTitle.match(/\b(blu-?ray|bdrip|dvdrip|webrip)\b/i)
          torrentInfo.sourceInfo.bluray = torrentInfo.torrentTitle.match(/\b(blu-?ray|bdrip)\b/i)
          torrentInfo.sourceInfo.hdtv = torrentInfo.torrentTitle.match(/\bhdtv(rip)?\b/i)
          torrentInfo.sourceInfo.hdrip = torrentInfo.torrentTitle.match(/\bhdrip\b/i)
          torrentInfo.sourceInfo.webdl = torrentInfo.torrentTitle.match(/\bweb-?dl\b/i)
          torrentInfo.sourceInfo.webrip = torrentInfo.torrentTitle.match(/\bwebrip\b/i)
          torrentInfo.sourceInfo.web = torrentInfo.sourceInfo.webdl || torrentInfo.sourceInfo.webrip
          torrentInfo.sourceInfo.dvd = torrentInfo.torrentTitle.match(/\bdvd(rip)?/i)
          torrentInfo.sourceInfo.hddvd = torrentInfo.torrentTitle.match(/\bhddvd\b/i)
          // resolution
          torrentInfo.standardInfo.res1080p = torrentInfo.torrentTitle.match(/\b1080p\b/i)
          torrentInfo.standardInfo.res1080i = torrentInfo.torrentTitle.match(/\b1080i\b/i)
          torrentInfo.standardInfo.res720p = torrentInfo.torrentTitle.match(/\b720p\b/i)
          torrentInfo.standardInfo.res2160p = torrentInfo.torrentTitle.match(/\b2160p|4k\b/i)
          torrentInfo.standardInfo.sd = torrentInfo.torrentTitle.match(/\b480p\b/i) || torrentInfo.sourceInfo.dvd
          torrentInfo.standardInfo.mhd = torrentInfo.torrentTitle.match(/\bmhd\b/i)
          // processing
          torrentInfo.processingInfo.raw = torrentInfo.torrentTitle.match(/\b(remux|web-?dl|(bd|dvd)?iso)\b/i)
          torrentInfo.processingInfo.encode = !torrentInfo.processingInfo.raw
          torrentInfo.processingInfo.remux = torrentInfo.torrentTitle.match(/\bremux\b/i)
          // codec
          torrentInfo.codecInfo.h264 = torrentInfo.torrentTitle.match(/\bh\.?264\b/i)
          torrentInfo.codecInfo.x264 = torrentInfo.torrentTitle.match(/\bavc|x264\b/i)
          torrentInfo.codecInfo.h265 = torrentInfo.torrentTitle.match(/\bh\.?265\b/i)
          torrentInfo.codecInfo.x265 = torrentInfo.torrentTitle.match(/\bhevc|x265\b/i)
          torrentInfo.codecInfo.x266 = torrentInfo.torrentTitle.match(/\bx266\b/i)
          torrentInfo.codecInfo.vc1 = torrentInfo.torrentTitle.match(/\bvc-1\b/i)
          torrentInfo.codecInfo.av1 = torrentInfo.torrentTitle.match(/\bav1\b/i)
          torrentInfo.codecInfo.mpeg2 = torrentInfo.torrentTitle.match(/\bmpeg-2\b/i)
          torrentInfo.codecInfo.xvid = torrentInfo.torrentTitle.match(/\bxvid\b/i)
          torrentInfo.codecInfo.divx = torrentInfo.torrentTitle.match(/\bdivx\b/i)
          torrentInfo.codecInfo.flac = torrentInfo.torrentTitle.match(/\bflac\b/i)
          torrentInfo.codecInfo.ape = torrentInfo.torrentTitle.match(/\bape\b/i)
          // team
          const teamArray = torrentInfo.torrentTitle.match(/\b(D-Z0N3)|(([^\s-@]*)(@[^\s-]+)?)$/)
          torrentInfo.team = teamArray ? teamArray[0] : ''
        }
        //= ========================================================================================================
        // info from douban / imdb
        const categoryMovie = 'Movie'; const categoryTvSeries = 'TV Series'; const categoryAnimation = 'Animation'
        const categoryDocumentary = 'Documentary'; const categoryTvShow = 'TV Show'
        if (site.construct === NEXUSPHP) {
          torrentInfo.movieInfo = { areaInfo: {} }
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
          // title
          const translatedTitleArray = textToConsume.match(/译\s*名\s*([^/\n]+)(?:\/|\n)/)
          const originalTitleArray = textToConsume.match(/片\s*名\s*([^/\n]+)(?:\/|\n)/)
          if (translatedTitleArray && originalTitleArray) {
            torrentInfo.movieInfo.translatedTitle = translatedTitleArray[1].trim()
            torrentInfo.movieInfo.originalTitle = originalTitleArray[1].trim()
          }
          // festival
          const festivalArray = textToConsume.match(/(\d{4})-\d{2}-\d{2}\((\S+电影节)\)/)
          torrentInfo.movieInfo.festival = festivalArray ? (festivalArray[1] + festivalArray[2]).trim() : ''
          // category
          const genresArray = textToConsume.match(/类\s*别\s+([^\n]*)\s*\n/)
          torrentInfo.movieInfo.genres = genresArray
            ? genresArray[1].replace(/([^ ])\/([^ ])/g, '$1 / $2')
            : ''
          torrentInfo.movieInfo.category = torrentInfo.movieInfo.genres.match('纪录')
            ? categoryDocumentary
            : torrentInfo.movieInfo.genres.match('动画')
              ? categoryAnimation
              : textToConsume.match(/集\s*数\s+/g)
                ? categoryTvSeries
                : torrentInfo.movieInfo.genres.match('秀')
                  ? categoryTvShow
                  : categoryMovie
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
        // 用于记录种子在站点的匹配信息
        torrentInfo.infoInSite = { 'site': siteName }
        // namebox
        if (nameBox && torrentInfo.torrentTitle) {
          torrentInfo.infoInSite.torrentTitle = torrentInfo.torrentTitle
          if (site.translatedChineseNameInTitle) {
            if (torrentInfo.movieInfo.areaInfo.cnMl) {
              torrentInfo.infoInSite.torrentTitle = torrentInfo.torrentTitle.match(torrentInfo.movieInfo.originalTitle)
                ? torrentInfo.torrentTitle
                : `[${torrentInfo.movieInfo.originalTitle}] ${torrentInfo.torrentTitle}`
            } else {
              torrentInfo.infoInSite.torrentTitle = torrentInfo.torrentTitle.match(torrentInfo.movieInfo.translatedTitle)
                ? torrentInfo.torrentTitle
                : `[${torrentInfo.movieInfo.translatedTitle}] ${torrentInfo.torrentTitle}`
            }
          } else {
            torrentInfo.infoInSite.torrentTitle = torrentInfo.torrentTitle
          }
          nameBox.val(torrentInfo.infoInSite.torrentTitle)
        }
        // small description
        if (site.smallDescBox && torrentInfo.movieInfo && (torrentInfo.movieInfo.doubanLink || torrentInfo.movieInfo.imdbLink)) {
          // container for small_desc(副标题) fields
          const smallDescrArray = []
          if (torrentInfo.movieInfo.originalTitle && torrentInfo.movieInfo.translatedTitle) {
            if (!site.translatedChineseNameInTitle) {
              if (torrentInfo.movieInfo.areaInfo.cnMl) {
                smallDescrArray.push(torrentInfo.torrentTitle.match(torrentInfo.movieInfo.originalTitle)
                  ? torrentInfo.movieInfo.translatedTitle
                  : torrentInfo.movieInfo.originalTitle)
              } else {
                smallDescrArray.push(torrentInfo.movieInfo.translatedTitle)
              }
            }
          }
          if (torrentInfo.movieInfo.festival) {
            smallDescrArray.push(torrentInfo.movieInfo.festival)
          }
          if (torrentInfo.movieInfo.genres) {
            smallDescrArray.push(torrentInfo.movieInfo.genres)
          }
          if (!site.pullMovieScore) {
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
          torrentInfo.infoInSite.smallDescr = smallDescrArray.join(' | ')
          site.smallDescBox.val(torrentInfo.infoInSite.smallDescr)
        }
        // douban link
        if (site.doubanLinkBox && torrentInfo.movieInfo && torrentInfo.movieInfo.doubanLink) {
          if (!site.doubanIdInsteadofLink) {
            site.doubanLinkBox.val(torrentInfo.movieInfo.doubanLink)
          } else {
            site.doubanLinkBox.val(torrentInfo.movieInfo.doubanId)
          }
        }
        // imdb link
        if (site.imdbLinkBox && torrentInfo.movieInfo && torrentInfo.movieInfo.imdbLink) {
          if (!site.doubanIdInsteadofLink) {
            site.imdbLinkBox.val(torrentInfo.movieInfo.imdbLink)
          } else {
            site.imdbLinkBox.val(torrentInfo.movieInfo.imdbId)
          }
        }
        // source
        if (site.sourceSel && torrentInfo.sourceInfo && Object.values(torrentInfo.sourceInfo).some(option => option)) {
          torrentInfo.infoInSite.source = site.sourceInfo.default || 0
          if (siteName === PTERCLUB) {
            torrentInfo.infoInSite.source = torrentInfo.sourceInfo.remux
              ? site.sourceInfo.remux// remux
              : torrentInfo.sourceInfo.encode
                ? site.sourceInfo.encode// encode
                : torrentInfo.sourceInfo.hdtv
                  ? site.sourceInfo.hdtv// hdtv
                  : torrentInfo.sourceInfo.webdl
                    ? site.sourceInfo.webdl// web-dl
                    : torrentInfo.sourceInfo.dvd || torrentInfo.sourceInfo.hddvd
                      ? site.sourceInfo.dvd
                      : torrentInfo.infoInSite.source// other
          } else if (siteName === NHD) {
            torrentInfo.infoInSite.source = torrentInfo.sourceInfo.bluray
              ? site.sourceInfo.bluray
              : torrentInfo.sourceInfo.hddvd
                ? site.sourceInfo.hddvd
                : torrentInfo.sourceInfo.dvd
                  ? site.sourceInfo.dvd
                  : torrentInfo.sourceInfo.webdl
                    ? site.sourceInfo.webdl
                    : torrentInfo.sourceInfo.webrip
                      ? site.sourceInfo.webrip
                      : torrentInfo.infoInSite.source
          } else if (siteName === GPW) {
            torrentInfo.infoInSite.source = torrentInfo.sourceInfo.bluray
              ? site.sourceInfo.bluray
              : torrentInfo.sourceInfo.hddvd
                ? site.sourceInfo.hddvd
                : torrentInfo.sourceInfo.dvd
                  ? site.sourceInfo.dvd
                  : torrentInfo.sourceInfo.web
                    ? site.sourceInfo.web
                    : torrentInfo.infoInSite.source
          } else if (siteName === UHD) {
            torrentInfo.infoInSite.source = torrentInfo.sourceInfo.encode
              ? site.sourceInfo.encode
              : torrentInfo.sourceInfo.remux
                ? site.sourceInfo.remux
                : torrentInfo.sourceInfo.webdl
                  ? site.sourceInfo.webdl
                  : torrentInfo.sourceInfo.webrip
                    ? site.sourceInfo.webrip
                    : torrentInfo.sourceInfo.hdrip
                      ? site.sourceInfo.hdrip
                      : torrentInfo.sourceInfo.hdtv
                        ? site.sourceInfo.hdtv
                        : torrentInfo.sourceInfo.bluray
                          ? site.sourceInfo.bluray
                          : torrentInfo.infoInSite.source
          }
          site.sourceSel.val(torrentInfo.infoInSite.source)
        }
        // standard
        if (site.standardSel && torrentInfo.standardInfo && Object.values(torrentInfo.standardInfo).some(option => option)) {
          torrentInfo.infoInSite.standard = torrentInfo.standardInfo.res1080p
            ? site.standardInfo.res1080p
            : torrentInfo.standardInfo.res1080i
              ? site.standardInfo.res1080i
              : torrentInfo.standardInfo.res720p
                ? site.standardInfo.res720p
                : torrentInfo.standardInfo.res2160p
                  ? site.standardInfo.res2160p
                  : site.standardInfo.default
          if (torrentInfo.infoInSite.standard === site.standardInfo.default) {
            if (Object.keys(site.standardInfo).includes('sd') && torrentInfo.standardInfo.sd) {
              torrentInfo.infoInSite.standard = site.standardInfo.sd
            } else if (Object.keys(site.standardInfo).includes('mhd') && torrentInfo.standardInfo.mhd) {
              torrentInfo.infoInSite.standard = site.standardInfo.mhd
            }
          }
          site.standardSel.val(torrentInfo.infoInSite.standard)
        }
        // processing
        if (site.processingSel && torrentInfo.processingInfo && Object.values(torrentInfo.processingInfo).some(option => option)) {
          torrentInfo.infoInSite.processing = site.processingInfo.default || 0
          if (siteName === NHD) {
            torrentInfo.infoInSite.processing = torrentInfo.processingInfo.raw
              ? site.processingInfo.raw
              : torrentInfo.processingInfo.encode
                ? site.processingInfo.encode
                : torrentInfo.infoInSite.processing
          } else if (siteName === GPW) {
            site.processingSel.closest('tr.hidden').removeClass('hidden')
            torrentInfo.infoInSite.processing = torrentInfo.processingInfo.remux
              ? site.processingInfo.remux
              : torrentInfo.processingInfo.encode
                ? site.processingInfo.encode
                : torrentInfo.infoInSite.processing
          }
          site.processingSel.val(torrentInfo.infoInSite.processing)
        }
        // codec
        if (site.codecSel && torrentInfo.codecInfo && Object.values(torrentInfo.codecInfo).some(option => option)) {
          torrentInfo.infoInSite.codec = site.codecInfo.default || 0
          if (siteName === NHD || siteName === PUTAO || siteName === MTEAM) {
            torrentInfo.infoInSite.codec = torrentInfo.codecInfo.x264 || torrentInfo.codecInfo.h264
              ? site.codecInfo.h264
              : torrentInfo.codecInfo.x265 || torrentInfo.codecInfo.h265
                ? site.codecInfo.h265
                : torrentInfo.codecInfo.vc1
                  ? site.codecInfo.vc1
                  : torrentInfo.codecInfo.mpeg2
                    ? site.codecInfo.mpeg2
                    : torrentInfo.codecInfo.xvid
                      ? site.codecInfo.xvid
                      : torrentInfo.codecInfo.flac
                        ? site.codecInfo.flac
                        : torrentInfo.codecInfo.ape
                          ? site.codecInfo.ape
                          : torrentInfo.infoInSite.codec
          } else if (siteName === GPW) {
            torrentInfo.infoInSite.codec = torrentInfo.codecInfo.h264
              ? site.codecInfo.h264
              : torrentInfo.codecInfo.h265
                ? site.codecInfo.h265
                : torrentInfo.codecInfo.x264
                  ? site.codecInfo.x264
                  : torrentInfo.codecInfo.x265
                    ? site.codecInfo.x265
                    : torrentInfo.codecInfo.xvid
                      ? site.codecInfo.xvid
                      : torrentInfo.codecInfo.divx
                        ? site.codecInfo.divx
                        : torrentInfo.infoInSite.codec
          } else if (siteName === UHD) {
            torrentInfo.infoInSite.codec = torrentInfo.codecInfo.h264
              ? site.codecInfo.h264
              : torrentInfo.codecInfo.h265
                ? site.codecInfo.h265
                : torrentInfo.codecInfo.x264
                  ? site.codecInfo.x264
                  : torrentInfo.codecInfo.x265
                    ? site.codecInfo.x265
                    : torrentInfo.codecInfo.x266
                      ? site.codecInfo.x266
                      : torrentInfo.codecInfo.vc1
                        ? site.codecInfo.vc1
                        : torrentInfo.codecInfo.mpeg2
                          ? site.codecInfo.mpeg2
                          : torrentInfo.codecInfo.av1
                            ? site.codecInfo.av1
                            : torrentInfo.infoInSite.codec
          }
          site.codecSel.val(torrentInfo.infoInSite.codec)
        }
        // team
        if (torrentInfo.team) {
          if (site.teamSel) {
            torrentInfo.infoInSite.team = torrentInfo.team
            site.teamSel.find('option').each((_, element) => {
              if (element.text.toLowerCase() === torrentInfo.team.toLowerCase()) {
                site.teamSel.val(element.value)
              }
            })
          } else if (site.teamBox) {
            torrentInfo.infoInSite.team = torrentInfo.team
            site.teamBox.val(torrentInfo.team)
          }
        }
        // area selection
        if (site.areaSel && torrentInfo.movieInfo && torrentInfo.movieInfo.areaInfo) {
          torrentInfo.infoInSite.area = site.areaInfo.default || 0
          if (siteName === PTERCLUB) {
            torrentInfo.infoInSite.area = torrentInfo.movieInfo.areaInfo.cnMl
              ? site.areaInfo.cnMl
              : torrentInfo.movieInfo.areaInfo.hk
                ? site.areaInfo.hk
                : torrentInfo.movieInfo.areaInfo.tw
                  ? site.areaInfo.tw
                  : torrentInfo.movieInfo.areaInfo.euAme
                    ? site.areaInfo.euAme
                    : torrentInfo.movieInfo.areaInfo.kor
                      ? site.areaInfo.kor
                      : torrentInfo.movieInfo.areaInfo.jap
                        ? site.areaInfo.jap
                        : torrentInfo.movieInfo.areaInfo.ind
                          ? site.areaInfo.ind
                          : site.areaInfo.other
          } else if (siteName === MTEAM) {
            torrentInfo.infoInSite.area = torrentInfo.movieInfo.areaInfo.cnMl
              ? site.areaInfo.cnMl
              : torrentInfo.movieInfo.areaInfo.euAme
                ? site.areaInfo.euAme
                : torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                  ? site.areaInfo.hkTw
                  : torrentInfo.movieInfo.areaInfo.jap
                    ? site.areaInfo.jap
                    : torrentInfo.movieInfo.areaInfo.kor
                      ? site.areaInfo.kor
                      : site.areaInfo.other
          }
          site.areaSel.val(torrentInfo.infoInSite.area)
        }
        // category selection
        if (site.categorySel) {
          torrentInfo.infoInSite.category = site.categoryInfo.default || 0
          if ((siteName === NHD || siteName === PTERCLUB) && torrentInfo.movieInfo) {
            torrentInfo.infoInSite.category = torrentInfo.movieInfo.category === categoryMovie
              ? site.categoryInfo.movie
              : torrentInfo.movieInfo.category === categoryTvSeries
                ? site.categoryInfo.tvSeries
                : torrentInfo.movieInfo.category === categoryAnimation
                  ? site.categoryInfo.animation
                  : torrentInfo.movieInfo.category === categoryDocumentary
                    ? site.categoryInfo.documentary
                    : torrentInfo.movieInfo.category === categoryTvShow
                      ? site.categoryInfo.tvShow
                      : torrentInfo.infoInSite.category
          } else if (siteName === PUTAO && torrentInfo.movieInfo && torrentInfo.movieInfo.areaInfo) {
            if (torrentInfo.movieInfo.category === categoryMovie) {
              torrentInfo.infoInSite.category = torrentInfo.movieInfo.areaInfo.cnMl ||
                torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                ? site.categoryInfo.movieCn
                : torrentInfo.movieInfo.areaInfo.euAme
                  ? site.categoryInfo.movieEuAme
                  : torrentInfo.movieInfo.areaInfo.asia
                    ? site.categoryInfo.movieAsia
                    : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryDocumentary) {
              // for clarification
              torrentInfo.infoInSite.category = site.categoryInfo.documentary
            } else if (torrentInfo.movieInfo.category === categoryAnimation) {
              // for clarification
              torrentInfo.infoInSite.category = site.categoryInfo.animation
            } else if (torrentInfo.movieInfo.category === categoryTvSeries) {
              torrentInfo.infoInSite.category = torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                ? site.categoryInfo.tvSeriesHkTw
                : torrentInfo.movieInfo.areaInfo.cnMl
                  ? site.categoryInfo.tvSeriesCnMl
                  : torrentInfo.movieInfo.areaInfo.asia
                    ? site.categoryInfo.tvSeriesAsia
                    : torrentInfo.movieInfo.areaInfo.euAme
                      ? site.categoryInfo.tvSeriesEuAme
                      : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryTvShow) {
              torrentInfo.infoInSite.category = torrentInfo.movieInfo.areaInfo.cnMl
                ? site.categoryInfo.tvShowCnMl
                : torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                  ? site.categoryInfo.tvShowHkTw
                  : torrentInfo.movieInfo.areaInfo.euAme
                    ? site.categoryInfo.tvShowEuAme
                    : torrentInfo.movieInfo.areaInfo.jap || torrentInfo.movieInfo.areaInfo.kor
                      ? site.categoryInfo.tvShowJapKor
                      : torrentInfo.infoInSite.category
            }
          } else if (siteName === MTEAM && torrentInfo.sourceInfo) {
            if (torrentInfo.movieInfo.category === categoryMovie) {
              torrentInfo.infoInSite.category = torrentInfo.sourceRemux
                ? site.categoryInfo.movieRemux
                : torrentInfo.sourceInfo.encode || torrentInfo.sourceInfo.hdtv || torrentInfo.sourceInfo.hddvd || torrentInfo.sourceInfo.web
                  ? site.categoryInfo.movieHd
                  : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryTvSeries || torrentInfo.movieInfo.category === categoryTvShow) {
              torrentInfo.infoInSite.category = torrentInfo.sourceInfo.encode || torrentInfo.sourceInfo.hdtv || torrentInfo.sourceInfo.hddvd || torrentInfo.sourceInfo.web
                ? site.categoryInfo.tvSeriesHd
                : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryDocumentary) {
              torrentInfo.infoInSite.category = site.categoryInfo.documentary
            } else if (torrentInfo.movieInfo.category === categoryAnimation) {
              torrentInfo.infoInSite.category = site.categoryInfo.animation
            }
          } else if (siteName === TTG && torrentInfo.standardInfo && torrentInfo.movieInfo && torrentInfo.movieInfo.areaInfo) {
            if (torrentInfo.movieInfo.category === categoryMovie) {
              torrentInfo.infoInSite.category = torrentInfo.standardInfo.res720p
                ? site.categoryInfo.movie720p
                : torrentInfo.standardInfo.res1080i || torrentInfo.standardInfo.res1080p
                  ? site.categoryInfo.movie1080ip
                  : torrentInfo.standardInfo.res2160p
                    ? site.categoryInfo.movie2160p
                    : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryDocumentary) {
              torrentInfo.infoInSite.category = torrentInfo.standardInfo.res720p
                ? site.categoryInfo.documentary720p
                : torrentInfo.standardInfo.res1080i || torrentInfo.standardInfo.res1080p
                  ? site.categoryInfo.documentary1080ip
                  : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryAnimation) {
              torrentInfo.infoInSite.category = site.categoryInfo.animation
            } else if (torrentInfo.movieInfo.category === categoryTvSeries) {
              torrentInfo.infoInSite.category = torrentInfo.movieInfo.areaInfo.jap
                ? site.categoryInfo.tvSeriesJap
                : torrentInfo.movieInfo.areaInfo.kor
                  ? site.categoryInfo.tvSeriesKor
                  : torrentInfo.euAme
                    ? site.categoryInfo.tvSeriesEuAme
                    : torrentInfo.movieInfo.areaInfo.cnMl || torrentInfo.movieInfo.areaInfo.hk || torrentInfo.movieInfo.areaInfo.tw
                      ? site.categoryInfo.tvSeriesCn
                      : torrentInfo.infoInSite.category
            } else if (torrentInfo.movieInfo.category === categoryTvShow) {
              torrentInfo.infoInSite.category = torrentInfo.movieInfo.areaInfo.kor
                ? site.categoryInfo.tvShowKor
                : torrentInfo.movieInfo.areaInfo.jap
                  ? site.categoryInfo.tvShowJap
                  : site.categoryInfo.tvShow
            }
          }
          site.categorySel.val(torrentInfo.infoInSite.category)
        }
        // site-specific
        if (site.construct === NEXUSPHP) {
          if (siteName === PTERCLUB && torrentInfo.subtitleInfo && torrentInfo.audioInfo) {
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
            if (torrentInfo.subtitleInfo.chinese_simplified && torrentInfo.subtitleInfo.chinese_traditional) {
              site.subtitleBox.val('* 内封简繁字幕')
            } else if (torrentInfo.subtitleInfo.chinese_simplified) {
              site.subtitleBox.val('* 内封简体字幕')
            } else if (torrentInfo.subtitleInfo.chinese_traditional) {
              site.subtitleBox.val('* 内封繁体字幕')
            }
          }
        } else if (site.construct === GAZELLE) {
          if (siteName === GPW) {
            // movie edition
            if (torrentInfo.editionInfo) {
              site.movieEditionCheck.click()
              if (torrentInfo.editionInfo.criterionCollection) { site.movieEditionInfo.criterionCollection.click() }
              if (torrentInfo.editionInfo.mastersOfCinema) { site.movieEditionInfo.mastersOfCinema.click() }
              if (torrentInfo.editionInfo.directorCut) { site.movieEditionInfo.directorCut.click() }
              if (torrentInfo.editionInfo.unrated) { site.movieEditionInfo.unrated.click() }
              if (torrentInfo.editionInfo.uncut) { site.movieEditionInfo.uncut.click() }
              if (torrentInfo.editionInfo.theatrical) { site.movieEditionInfo.theatrical.click() }
              if (torrentInfo.editionInfo.extended) { site.movieEditionInfo.extended.click() }
              if (torrentInfo.editionInfo.remaster4k) { site.movieEditionInfo.remaster4k.click() }
              if (torrentInfo.editionInfo.remaster) { site.movieEditionInfo.remaster.click() }
              if (torrentInfo.editionInfo.restoration4k) { site.movieEditionInfo.restoration4k.click() }
              if (torrentInfo.editionInfo.twoInOne) { site.movieEditionInfo.twoInOne.click() }
              if (torrentInfo.audioInfo && torrentInfo.audioInfo.commentary) { site.movieEditionInfo.withCommentary.click() }
            }
            // subtitles
            const subbed = Object.values(torrentInfo.subtitleInfo).some(x => x)
            site.noSubCheck.checked = !subbed
            site.mixedSubCheck.checked = subbed
            if (subbed) {
              site.otherSubtitlesDiv.removeClass('hidden')
              Object.keys(torrentInfo.subtitleInfo).forEach(lang => {
                if (site.subtitleInfo[lang]) {
                  site.subtitleInfo[lang].checked = torrentInfo.subtitleInfo[lang]
                }
              })
            }
            // video info
            if (torrentInfo.videoInfo) {
              site.videoInfo.bit10.checked = torrentInfo.videoInfo.bit10
              site.videoInfo.hdr10.checked = torrentInfo.videoInfo.hdr10
              site.videoInfo.hdr10plus.checked = torrentInfo.videoInfo.hdr10plus
              site.videoInfo.dovi.checked = torrentInfo.videoInfo.dovi
            }
            // audio info
            if (torrentInfo.audioInfo) {
              site.audioInfo.dtsX.checked = torrentInfo.audioInfo.dtsX
              site.audioInfo.atmos.checked = torrentInfo.audioInfo.atmos
              // GPW的国语配音作为特色属性，特指外语片的译制音轨
              site.audioInfo.chineseDub.checked = torrentInfo.audioInfo.chineseDub && torrentInfo.audioInfo.foreignDub
            }
            // container info
            if (Object.values(site.containerInfo).includes(torrentInfo.videoInfo.container)) {
              site.containerSel.val(torrentInfo.videoInfo.container)
            }
          } else if (siteName === UHD) {
            // movie edition
            if (torrentInfo.editionInfo) {
              if (torrentInfo.editionInfo.criterionCollection) { site.movieEditionInfo.criterionCollection.click() }
              if (torrentInfo.editionInfo.directorCut) { site.movieEditionInfo.directorCut.click() }
              if (torrentInfo.editionInfo.unrated) { site.movieEditionInfo.unrated.click() }
              if (torrentInfo.editionInfo.uncut) { site.movieEditionInfo.uncut.click() }
              if (torrentInfo.editionInfo.theatrical) { site.movieEditionInfo.theatrical.click() }
              if (torrentInfo.editionInfo.extended) { site.movieEditionInfo.extended.click() }
              if (torrentInfo.editionInfo.remaster4k) { site.movieEditionInfo.remaster4k.click() }
              if (torrentInfo.editionInfo.remaster) { site.movieEditionInfo.remaster.click() }
              if (torrentInfo.editionInfo.restoration4k) { site.movieEditionInfo.restoration4k.click() }
              if (torrentInfo.editionInfo.twoInOne) { site.movieEditionInfo.twoInOne.click() }
              if (torrentInfo.editionInfo.threeInOne) { site.movieEditionInfo.threeInOne.click() }
              if (torrentInfo.editionInfo.hybrid) { site.movieEditionInfo.hybrid.click() }
              if (torrentInfo.editionInfo.imax) { site.movieEditionInfo.imax.click() }
              if (torrentInfo.editionInfo.tvCut) { site.movieEditionInfo.tvCut.click() }
              if (torrentInfo.videoInfo && (torrentInfo.videoInfo.bit10 || torrentInfo.videoInfo.hdr10 || torrentInfo.videoInfo.hdr10plus || torrentInfo.videoInfo.dovi)) {
                site.movieEditionInfo.bit10.click()
              }
            }
            // hdr info
            if (torrentInfo.videoInfo) {
              if (torrentInfo.videoInfo.dovi) { site.hdrSel.val(site.hdrInfo.dovi) }
              else if (torrentInfo.videoInfo.hdr10plus) { site.hdrSel.val(site.hdrInfo.hdr10plus) }
              else if (torrentInfo.videoInfo.hdr10) { site.hdrSel.val(site.hdrInfo.hdr10) }
            }
            // season info
            if (site.seasonSel) {
              // totally unnecessary, only to pass the uploading procedure
              site.seasonSel.val(site.seansonInfo.s01)
            }
          }
          // repair the mediainfo in case 'Complete name' is missing
          if (torrentInfo.mediainfo && torrentInfo.mediainfo.General) {
            if (!torrentInfo.mediainfo.General['Complete name'] &&
              torrentInfo.mediainfo.General['Movie name'] &&
              torrentInfo.videoInfo &&
              torrentInfo.videoInfo.container) {
              torrentInfo.mediainfo.General['Complete name'] = `${torrentInfo.mediainfo.General['Movie name']}.${torrentInfo.videoInfo.container.toLowerCase()}`
            }
            site.mediainfoBox.val(mediainfo2String(torrentInfo.mediainfo))
          }
        }
        // anonymously uploading
        if (site.anonymousControl) {
          if (siteName === NHD || siteName === PTERCLUB || siteName === PUTAO || siteName === MTEAM || siteName === UHD) {
            site.anonymousControl.checked = ANONYMOUS
          } else if (siteName === TTG) {
            site.anonymousControl.val(ANONYMOUS ? 'yes' : 'no')
          }
        }
        site.descrBox.val(textToConsume)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        btnBingo.val(oriTextBingo)
      }
    })
  } else if (page === 'subtitles') {
    //= ========================================================================================================
    // 字幕页面
    if (!site.inputFileSubtitle) {
      return
    }
    site.inputFileSubtitle.change(() => {
      if (site.anonymousCheckSubtitle) {
        site.anonymousCheckSubtitle.checked = ANONYMOUS
      }
      const pathSub = site.inputFileSubtitle.val()
      const fileName = pathSub.replace(/.*?([^\\]+)$/, '$1')
      if (fileName) {
        if (site.titleBoxSubtitle) {
          site.titleBoxSubtitle.val(fileName)
        }
        const abbrLangInSub = pathSub.replace(/.*\.([^.]+)\.[^.]+$/i, '$1') || ''
        if (site.languageSelSubtitle) {
          let langSelected = site.subtitleInfo.default
            if (site.subtitleInfo.other && abbrLangInSub.match(/(chs|cht|cn|zh)\s*( |&)?.+/) || abbrLangInSub.match(/.+( |&)?(chs|cht|cn|zh)/)) {
              langSelected = site.subtitleInfo.other
            }
            else {
              Object.entries(subtitleLanguages).forEach(([languageInAll, abbrLang]) => {
                if (abbrLangInSub.match(RegExp(abbrLang, 'i'))) {
                  langSelected = site.subtitleInfo[languageInAll] || site.subtitleInfo.default
                  return
                }
              })
            }
            site.languageSelSubtitle.val(langSelected)
        } else if (siteName === GPW) {
          Object.entries(subtitleLanguages).forEach(([languageInAll, abbrLang]) => {
            if (abbrLangInSub.match(RegExp(abbrLang, 'i'))) {
              if (site.subtitleInfo[languageInAll]) {
                Object.keys(site.subtitleInfo).forEach(lang => {
                  if (site.subtitleInfo[lang]) {
                    site.subtitleInfo[lang].checked = languageInAll === lang
                  }
                })
              }
              return
            }
          })
        }
      }
    })
  }
})()
// ////////////////////////////////////////////////////////////////////////////////////////////////
// for unit test
// Conditionally export for unit testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    collectComparisons, decomposeDescription, processDescription, mediainfo2String, string2Mediainfo, processTags, getTeamSplitterCombinations: getTeamSplitterRegex,
    NHD, PTERCLUB, GPW, MTEAM, TTG, PUTAO, UHD, siteInfoMap
  }
}
