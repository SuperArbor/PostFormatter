// ==UserScript==
// @name         Post Formatter
// @description  Format upload info and smilies
// @version      1.3.1.3
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
const $ = window.jQuery;
(function () {
  'use strict'
  function insertTyt (myValue, switcher) {
    let objTarget
    if (switcher === 1) {
      objTarget = $('#compose textarea', window.opener.document)[0]
    } else if (switcher === 0) {
      if ($('#compose textarea').length) {
        objTarget = $('#compose textarea')[0]
      } else if ($('#shbox_text').length) {
        objTarget = $('#shbox_text')[0]
      }
    } else {
      return false
    }
    const matchObj = /(\n\[\/|\](\[\/|$))/.exec(myValue)
    const startPos = objTarget.selectionStart
    const endPos = objTarget.selectionEnd
    objTarget.value = objTarget.value.substring(0, startPos) + myValue + objTarget.value.substring(endPos, objTarget.value.length)
    objTarget.selectionEnd = startPos + myValue.length
    objTarget.focus()
    if (matchObj) {
      objTarget.setSelectionRange(startPos + matchObj.index + 1, startPos + matchObj.index + 1)
    }
    return true
  }
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
      const urlsToSend = matches || []
      const size = numTeams === 2
        ? 350
        : numTeams === 3
          ? 250
          : numTeams === 4
            ? 190
            : numTeams === 5
              ? 150
              : 150
      const urls = await sendImagesToPixhost(urlsToSend, size)
      return urls
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
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://pixhost.to/remote/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
        },
        data: encodeURI(`imgs=${urls.join('\r\n')}&content_type=0&max_th_size=${size}`),
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
              reject('上传失败，请重试')
            }
          }
        }
      })
    })
  }
  //= ========================================================================================================
  // Main
  const NHD = 'nhd'; const PTER = 'pter'; const PUTAO = 'putao'; const MTEAM = 'mteam'; const TTG = 'ttg'
  const GPW = 'gpw'; const UHD = 'uhd'
  const NEXUSPHP = 'nexusphp'; const GAZELLE = 'gazelle'
  const PIXHOST = 'pixhost'; const IMGBOX = 'imghost'; const IMG4K = 'img4k'
  const PTERCLUB = 'pterclub'; const IMGPILE = 'imgpile'; const PTPIMG = 'ptpimg'
  const domainMatchArray = window.location.href.match(/(.*)\/(upload|edit|subtitles|dox)\.php/)
  if (!domainMatchArray) {
    return
  }
  const site = domainMatchArray[1].match(/nexushd/i)
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
  const construct = [NHD, PTER, PUTAO, MTEAM, TTG].includes(site)
    ? NEXUSPHP
    : [GPW, UHD].includes(site)
        ? GAZELLE
        : ''
  let page = domainMatchArray[2]
  if (site === TTG) {
    if (page === 'dox') {
      page = 'subitles'
    }
  }
  if (!site || !page) {
    return
  }
  // 匿名发布开关
  const anonymous = true
  console.log(`running in site ${site} and page ${page}`)
  if (page === 'upload' || page === 'edit') {
    //= ========================================================================================================
    // 上传和编辑种子页面
    const btnBingo = $('<input>')
    if (construct === NEXUSPHP) {
      btnBingo.attr({
        type: 'button',
        name: 'bingo_converter',
        value: 'BINGO',
        style: 'font-size: 11px; font-weight: bold; color: blue; margin-right: 3px'
      })
      const td1 = $('<td>')
      td1.attr({
        class: 'embedded'
      })
      const tr1 = $('<tr>')
      tr1.attr({
        id: 'multi_function'
      })
      const tbody1 = $('<tbody>')
      const table1 = $('<table>')
      table1.attr({
        cellspaceing: '1',
        cellpadding: '2',
        border: '0',
        style: 'margin-top:3px'
      })
      td1.append(btnBingo)
      tr1.append(td1)
      tbody1.append(tr1)
      table1.append(tbody1)
      if (site === MTEAM || site === NHD || site === PTER || site === PUTAO) {
        $('#compose input[name="quote"]').closest('table').after(table1)
      } else if (site === TTG) {
        $('#upload input[name="quote"]').closest('table').after(table1)
      }
      let switcher = 0
      if (window.location.href.match(/moresmilies\.php/)) {
        switcher = 1
      }
      $("a[href*='SmileIT']").click(function () {
        insertTyt(this.getAttribute('href').match(/\[em\d+\]/)[0], switcher)
        return false
      })
    } else if (construct === GAZELLE) {
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
    // control for anonymously publishing
    let anonymousControl = null
    let inputFile = null
    //= ========================================================================================================
    // initialization
    // common controls
    let nameBox = null; let smallDescBox = null; let imdbLinkBox = null; let doubanLinkBox = null
    let descrBox = null; let categorySel = null; let sourceSel = null
    // this is normally useful even when area_sel == null.
    let areaCnMl = false; let areaHk = false; let areaTw = false; let areaEuAme = false; let areaKor = false
    let areaJap = false; let areaInd = false; let areaAsia = false
    let areaNumDefault = 0; let areaNumCnMl = 1; let areaNumHk = 2; let areaNumTw = 3
    let areaNumEuAme = 4; let areaNumKor = 5; let areaNumJap = 6; let areaNumInd = 7; let areaNumOther = 8
    // categories
    let cateNumDefault = 0; let cateNumMovie = 1; let cateNumDocumentary = 2; let cateNumAnimation = 3
    let cateNumTvSeries = 4; let cateNumTvShow = 5
    // sources
    let sourceNumDefault = 0; let sourceNumBluray = 1; let sourceNumRemux = 2; let sourceNumHddvd = 3
    let sourceNumDvd = 4; let sourceNumEncode = 5
    let sourceNumWeb = 6; let sourceNumWebDl = 7; let sourceNumWebrip = 8; let sourceNumHdtv = 9
    // 站点支持的box标签类型
    let targetTagBox = ''
    // 其他站点的box标签类型（需要统一替换）
    let otherTagBoxes = ''
    // box是否支持添加说明[box=descr][/box]
    let boxSupportDescr = false
    // 其他不支持的标签（如center）
    let unsupportedTags = ''
    // need mediainfo
    let decodingMediainfo = false
    // site-specific
    // (pter) areas
    let areaSel = null
    let chsubCheck = null; let englishSubCheck = null; let chdubCheck = null; let cantodubCheck = null
    // (nhd, mteam) controls
    let standardSel = null; let processingSel = null; let codecSel = null
    // (nhd, mteam) standards
    let standardNumDefault = 0; let standardNum1080p = 1; let standardNum1080i = 2
    let standardNum720p = 3; let standardNum2160p = 4; let standardNumSd = 5
    // (nhd) processing
    let processNumDefault = 0; let processNumRaw = 1; let processNumEncode = 2; let processNumRemux = 3
    // (nhd, mteam) codec
    let codecNumDefault = 0; let codecNumH264 = 1; let codecNumH265 = 2; let codecNumVc1 = 3
    let codecNumXvid = 4; let codecNumMpeg2 = 5; let codecNumFlac = 6; let codecNumApe = 7
    let codecNumX264 = 8; let codecNumX265 = 9; let codecNumDivX = 10
    // (putao) categories
    let cateNumMovieCnMl = 0; let cateNumMovieEuAme = 1; let cateNumMovieAsia = 2; let cateNumTvSeriesHkTw = 3
    let cateNumTvSeriesAsia = 4; let cateNumTvSeriesCnMl = 5; let cateNumTvSeriesEuAme = 6
    let cateNumTvShowCnMl = 7; let cateNumTvShowEuAme = 8; let cateNumTvShowHkTw = 9; let cateNumTvShowJpKor = 10
    // (mteam) categories
    let teamSel = null
    let cateNumMovieHd = 2; let cateNumMovieRemux = 5; let cateNumTvSeriesHd = 7
    // (ttg) controls
    let subtitleBox = null
    // (ttg) values
    let cateNumMovie720p = 2; let cateNumMovie1080ip = 3; let cateNumMovie2160p = 4
    let cateNumDocumentary720p = 5; let cateNumDocumentary1080ip = 6
    let cateNumTvSeriesJap = 7; let cateNumTvSeriesKor = 8; let cateNumTvShowJap = 9; let cateNumTvShowKor = 10
    // (gpw) controls
    let mediainfoBox = null; let containerSel = null; let hdr10Check = null; let doviCheck = null
    let noSubCheck = null; let mixedSubCheck = null; let otherSubtitlesDiv = null
    let chineseSimplifiedSubCheck = null; let chineseTraditionalSubCheck = null
    let japaneseSubCheck = null; let koreanSubCheck = null; let frenchSubCheck = null; let germanSubCheck = null
    let greekSubCheck = null; let polishSubCheck = null; let italianSubCheck = null; let hindiSubCheck = null
    let russianSubCheck = null; let swedishSubCheck = null; let spanishSubCheck = null; let turkishSubCheck = null
    let vietnameseSubCheck = null; let thaiSubCheck = null; let romanianSubCheck = null; let azerbaijaniSubCheck = null
    let bulgarianSubCheck = null; let danishSubCheck = null; let estonianSubCheck = null; let finnishSubCheck = null
    let hebrewSubCheck = null; let croatianSubCheck = null; let icelandicSubCheck = null; let latvianSubCheck = null
    let lithuanianSubCheck = null; let dutchSubCheck = null; let norwegianSubCheck = null; let portugueseSubCheck = null
    let slovenianSubCheck = null; let latinSubCheck = null; let ukrainianSubCheck = null; let hungarianSubCheck = null
    let persianSubCheck = null; let arabicSubCheck = null; let slovakSubCheck = null; let brazilianPortSubCheck = null
    let czechSubCheck = null; let idonesianSubCheck = null; let serbianSubCheck = null
    let movieEditionCheck = null; let dcClick = null; let commentAudioClick = null; let ccClick = null
    let theatricClick = null; let uncutClick = null; let unratedClick = null; let extendedClick = null
    let containerNumDefault = 0; let containerNumMkv = 1; let containerNumMp4 = 2; let containerNumAvi = 3
    let maxScreenshots = 10
    // site definitions
    if (site === NHD) {
      inputFile = $('input[type="file"][name="file"]')
      targetTagBox = 'box'
      boxSupportDescr = true
      otherTagBoxes = ['hide', 'spoiler', 'expand'].join('|')
      unsupportedTags = ['align'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      anonymousControl = $("input[name='uplver'][type='checkbox']")[0]
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      doubanLinkBox = $("input[name='douban_url']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')
      sourceSel = $("select[name='source_sel']")

      standardSel = $("select[name='standard_sel']")
      processingSel = $("select[name='processing_sel']")
      codecSel = $("select[name='codec_sel']")

      decodingMediainfo = false

      cateNumDefault = 0; cateNumMovie = 101; cateNumTvSeries = 102; cateNumTvShow = 103; cateNumDocumentary = 104; cateNumAnimation = 105
      sourceNumDefault = 0; sourceNumBluray = 1; sourceNumHddvd = 2; sourceNumDvd = 3; sourceNumHdtv = 4; sourceNumWebDl = 7; sourceNumWebrip = 9
      standardNumDefault = 0; standardNum1080p = 1; standardNum1080i = 2; standardNum720p = 3; standardNum2160p = 6; standardNumSd = 4
      processNumDefault = 0; processNumRaw = 1; processNumEncode = 2
      codecNumDefault = 0; codecNumH264 = 1; codecNumH265 = 2; codecNumVc1 = 3; codecNumXvid = 4; codecNumMpeg2 = 5; codecNumFlac = 10; codecNumApe = 11
    } else if (site === PTER) {
      inputFile = $('input[type="file"][name="file"]')
      targetTagBox = 'hide'
      boxSupportDescr = true
      otherTagBoxes = ['box', 'spoiler', 'expand'].join('|')
      unsupportedTags = ['align'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      anonymousControl = $("input[name='uplver'][type='checkbox']")[0]
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      doubanLinkBox = $("input[name='douban']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')
      sourceSel = $("select[name='source_sel']")

      areaSel = $("select[name='team_sel']")
      chsubCheck = $('#zhongzi')[0]
      englishSubCheck = $('#ensub')[0]
      chdubCheck = $('#guoyu')[0]
      cantodubCheck = $('#yueyu')[0]

      decodingMediainfo = true

      cateNumDefault = 0; cateNumMovie = 401; cateNumTvSeries = 404; cateNumTvShow = 405; cateNumDocumentary = 402; cateNumAnimation = 403
      sourceNumDefault = 0; sourceNumBluray = 2; sourceNumRemux = 3; sourceNumEncode = 6; sourceNumHdtv = 4; sourceNumWebDl = 5; sourceNumDvd = 7
      areaNumDefault = 0; areaNumCnMl = 1; areaNumHk = 2; areaNumTw = 3; areaNumEuAme = 4; areaNumKor = 5; areaNumJap = 6; areaNumInd = 7; areaNumOther = 8
    } else if (site === PUTAO) {
      inputFile = $('input[type="file"][name="file"]')
      targetTagBox = ''
      boxSupportDescr = true
      otherTagBoxes = ['box', 'hide', 'spoiler', 'expand'].join('|')
      unsupportedTags = ['align', 'center'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      anonymousControl = $("input[name='uplver'][type='checkbox']")[0]
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      doubanLinkBox = $("input[name='douban_url']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')

      standardSel = $("select[name='standard_sel']")
      codecSel = $("select[name='codec_sel']")

      decodingMediainfo = false

      cateNumDefault = 0; cateNumDocumentary = 406; cateNumAnimation = 431; cateNumMovieCnMl = 401; cateNumMovieEuAme = 402
      cateNumMovieAsia = 403; cateNumTvSeriesHkTw = 407; cateNumTvSeriesAsia = 408; cateNumTvSeriesCnMl = 409; cateNumTvSeriesEuAme = 410
      cateNumTvShowCnMl = 411; cateNumTvShowHkTw = 412; cateNumTvShowEuAme = 413; cateNumTvShowJpKor = 414

      standardNumDefault = 0; standardNum1080p = 1; standardNum1080i = 2; standardNum720p = 3; standardNum2160p = 6; standardNumSd = 4
      codecNumDefault = 0; codecNumH264 = 1; codecNumVc1 = 2; codecNumXvid = 3; codecNumMpeg2 = 4; codecNumFlac = 5; codecNumApe = 6; codecNumH265 = 10
    } else if (site === MTEAM) {
      inputFile = $('input[type="file"][name="file"]')
      targetTagBox = 'expand'
      boxSupportDescr = false
      otherTagBoxes = ['box', 'hide', 'spoiler'].join('|')
      unsupportedTags = ['align'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      anonymousControl = $("input[name='uplver'][type='checkbox']")[0]
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')
      teamSel = $("select[name='team_sel']")

      standardSel = $("select[name='standard_sel']")
      areaSel = $("select[name='processing_sel']")
      codecSel = $("select[name='codec_sel']")

      chsubCheck = $("input[type='checkbox'][name='l_sub']")[0]
      chdubCheck = $("input[type='checkbox'][name='l_dub']")[0]

      decodingMediainfo = true

      cateNumDefault = 0; cateNumMovieHd = 419; cateNumMovieRemux = 439; cateNumTvSeriesHd = 402; cateNumDocumentary = 404; cateNumAnimation = 405
      areaNumCnMl = 1; areaNumEuAme = 2; areaNumHk = 3; areaNumTw = 3; areaNumJap = 4; areaNumKor = 5; areaNumOther = 6
      standardNumDefault = 0; standardNum1080p = 1; standardNum1080i = 2; standardNum720p = 3; standardNum2160p = 6; standardNumSd = 5
      codecNumDefault = 0; codecNumH264 = 1; codecNumVc1 = 2; codecNumH265 = 16; codecNumXvid = 3; codecNumMpeg2 = 4; codecNumFlac = 5; codecNumApe = 10
    } else if (site === TTG) {
      inputFile = $('input[type="file"][name="file"]')
      targetTagBox = ''
      boxSupportDescr = false
      otherTagBoxes = ['box', 'hide', 'spoiler', 'expand'].join('|')
      unsupportedTags = ['align'].join('|')
      nameBox = $("input[type='text'][name='name']")
      smallDescBox = $("input[type='text'][name='subtitle']")
      subtitleBox = $("input[type='text'][name='highlight']")
      imdbLinkBox = $("input[name='imdb_c'][type='text']")
      doubanLinkBox = $("input[name='douban_id'][type='text']")
      descrBox = $('textarea[name="descr"]')
      categorySel = $('select[name="type"]')
      anonymousControl = $('select[name="anonymity"]')

      decodingMediainfo = true

      cateNumDefault = 0; cateNumMovie720p = 52; cateNumMovie1080ip = 53; cateNumMovie2160p = 108
      cateNumDocumentary720p = 62; cateNumDocumentary1080ip = 63
      cateNumTvSeriesEuAme = 87; cateNumTvSeriesJap = 88; cateNumTvSeriesKor = 99; cateNumTvSeriesCnMl = 90; cateNumTvSeriesHkTw = 90
      cateNumTvShowJap = 101; cateNumTvShowKor = 103; cateNumTvShow = 60
    } else if (site === GPW) {
      inputFile = $('#file')
      targetTagBox = ''
      // GPW 并不支持带description的box类标签，为了方便处理特殊设置，最后会统一去掉quote里的说明
      boxSupportDescr = true
      otherTagBoxes = ['box', 'hide', 'spoiler', 'expand'].join('|')
      unsupportedTags = ['align'].join('|')
      mediainfoBox = $('textarea[name="mediainfo[]"]')
      descrBox = $('#release_desc')
      sourceSel = $('select[id="source"]')
      codecSel = $('select[id="codec"]')
      standardSel = $('select[id="resolution"]')
      processingSel = $('select[id="processing"]')
      containerSel = $('select[id="container"]')

      hdr10Check = $('input[type="checkbox"][id="hdr10"]')[0]
      doviCheck = $('input[type="checkbox"][id="dolby_vision"]')[0]
      movieEditionCheck = $('input[type="checkbox"][id="movie_edition_information"]')[0]
      commentAudioClick = $("a:contains('评论音轨')")[0]
      dcClick = $("a:contains('导演剪辑版')")[0]
      ccClick = $("a:contains('标准收藏')")[0]
      theatricClick = $("a:contains('影院版')")[0]
      uncutClick = $("a:contains('未删减版')")[0]
      unratedClick = $("a:contains('未分级版')")[0]
      extendedClick = $("a:contains('加长版')")[0]

      mixedSubCheck = $('input[type="radio"][id="mixed_subtitles"]')[0]
      noSubCheck = $('input[type="radio"][id="no_subtitles"]')[0]
      otherSubtitlesDiv = $('div[id="other_subtitles"]')
      chineseSimplifiedSubCheck = $('input[type="checkbox"][id="chinese_simplified"]')[0]
      chineseTraditionalSubCheck = $('input[type="checkbox"][id="chinese_traditional"]')[0]
      englishSubCheck = $('input[type="checkbox"][id="english"]')[0]
      japaneseSubCheck = $('input[type="checkbox"][id="japanese"]')[0]
      koreanSubCheck = $('input[type="checkbox"][id="korean"]')[0]
      frenchSubCheck = $('input[type="checkbox"][id="french"]')[0]
      germanSubCheck = $('input[type="checkbox"][id="german"]')[0]
      italianSubCheck = $('input[type="checkbox"][id="italian"]')[0]
      polishSubCheck = $('input[type="checkbox"][id="polish"]')[0]
      romanianSubCheck = $('input[type="checkbox"][id="romanian"]')[0]
      russianSubCheck = $('input[type="checkbox"][id="russian"]')[0]
      spanishSubCheck = $('input[type="checkbox"][id="spanish"]')[0]
      thaiSubCheck = $('input[type="checkbox"][id="thai"]')[0]
      turkishSubCheck = $('input[type="checkbox"][id="turkish"]')[0]
      vietnameseSubCheck = $('input[type="checkbox"][id="vietnamese"]')[0]
      hindiSubCheck = $('input[type="checkbox"][id="hindi"]')[0]
      greekSubCheck = $('input[type="checkbox"][id="greek"]')[0]
      swedishSubCheck = $('input[type="checkbox"][id="swedish"]')[0]
      azerbaijaniSubCheck = $('input[type="checkbox"][id="azerbaijani"]')[0]
      bulgarianSubCheck = $('input[type="checkbox"][id="bulgarian"]')[0]
      danishSubCheck = $('input[type="checkbox"][id="danish"]')[0]
      estonianSubCheck = $('input[type="checkbox"][id="estonian"]')[0]
      finnishSubCheck = $('input[type="checkbox"][id="finnish"]')[0]
      hebrewSubCheck = $('input[type="checkbox"][id="hebrew"]')[0]
      croatianSubCheck = $('input[type="checkbox"][id="croatian"]')[0]
      hungarianSubCheck = $('input[type="checkbox"][id="hungarian"]')[0]
      icelandicSubCheck = $('input[type="checkbox"][id="icelandic"]')[0]
      latvianSubCheck = $('input[type="checkbox"][id="latvian"]')[0]
      lithuanianSubCheck = $('input[type="checkbox"][id="lithuanian"]')[0]
      dutchSubCheck = $('input[type="checkbox"][id="dutch"]')[0]
      norwegianSubCheck = $('input[type="checkbox"][id="norwegian"]')[0]
      portugueseSubCheck = $('input[type="checkbox"][id="portuguese"]')[0]
      slovenianSubCheck = $('input[type="checkbox"][id="slovenian"]')[0]
      slovakSubCheck = $('input[type="checkbox"][id="slovak"]')[0]
      latinSubCheck = $('input[type="checkbox"][id="latin"]')[0]
      ukrainianSubCheck = $('input[type="checkbox"][id="ukrainian"]')[0]
      persianSubCheck = $('input[type="checkbox"][id="persian"]')[0]
      arabicSubCheck = $('input[type="checkbox"][id="arabic"]')[0]
      brazilianPortSubCheck = $('input[type="checkbox"][id="brazilian_port"]')[0]
      czechSubCheck = $('input[type="checkbox"][id="czech"]')[0]
      idonesianSubCheck = $('input[type="checkbox"][id="idonesian"]')[0]
      serbianSubCheck = $('input[type="checkbox"][id="serbian"]')[0]

      chdubCheck = $('input[type="checkbox"][id="chinese_dubbed"]')[0]

      decodingMediainfo = true
      maxScreenshots = 10

      sourceNumDefault = '---'; sourceNumBluray = 'Blu-ray'; sourceNumWeb = 'WEB'; sourceNumHdtv = 'HDTV'; sourceNumDvd = 'DVD'
      codecNumDefault = '---'; codecNumH264 = 'H.264'; codecNumH265 = 'H.265'; codecNumXvid = 'Xvid'; codecNumDivX = 'DivX'; codecNumX264 = 'x264'; codecNumX265 = 'x265'
      standardNumDefault = '---'; standardNum1080i = '1080i'; standardNum1080p = '1080p'; standardNum2160p = '2160p'; standardNum720p = '720p'; standardNumSd = '480p'
      processNumDefault = '---'; processNumEncode = 'Encode'; processNumRemux = 'Remux'
      containerNumDefault = '---'; containerNumMkv = 'MKV'; containerNumMp4 = 'MP4'; containerNumAvi = 'AVI'
    }
    // function definition
    btnBingo.click(async function () {
      //= ========================================================================================================
      // prehandling description
      let textToConsume = ''
      if (construct === NEXUSPHP) {
        if (anonymousControl) {
          if (site === NHD || site === PTER || site === PUTAO || site === MTEAM) {
            anonymousControl.checked = anonymous
          } else if (site === TTG) {
            anonymousControl.val(anonymous ? 'yes' : 'no')
          }
        }
        const oldText = descrBox.val()
        let readClipboard = false
        if (site === NHD || site === PTER || site === PUTAO || site === MTEAM) {
          readClipboard = !oldText
        } else if (site === TTG) {
          readClipboard = !oldText ? true : oldText.length < 125
        }
        let descriptionAll = readClipboard ? await navigator.clipboard.readText() : oldText
        // 对于不支持box标签的站，统一替换为'quote'标签
        const replaceTag = targetTagBox || 'quote'
        if (targetTagBox) {
          descriptionAll = nestExplode(descriptionAll, targetTagBox)
          descriptionAll = compactContent(descriptionAll, targetTagBox)
        }
        descriptionAll = descriptionAll
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
        descrBox.val(descriptionAll)
        textToConsume = descriptionAll
      } else if (construct === GAZELLE) {
        if (site === GPW) {
          const oldText = descrBox.val()
          let readClipboard = false
          readClipboard = !oldText
          let descriptionAll = readClipboard ? await navigator.clipboard.readText() : oldText
          // 对于不支持box标签的站，统一替换为'quote'标签
          const replaceTag = targetTagBox || 'quote'
          if (targetTagBox) {
            descriptionAll = nestExplode(descriptionAll, targetTagBox)
            descriptionAll = compactContent(descriptionAll, targetTagBox)
          }
          descriptionAll = descriptionAll
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
          descrBox.val(descriptionAll)
          textToConsume = descriptionAll
        }
      }
      //= ========================================================================================================
      // checking torrent name
      // name
      let torTitle = inputFile.val()
      let containerNum = ''
      let cc = false; let dc = false; let uncut = false; let unrated = false; let theatric = false; let extended = false
      if (torTitle) {
        torTitle = /([^\\]+)$/.exec(torTitle)[1]
        torTitle = formatTorrentName(torTitle)
        cc = torTitle.match(/\bcc|criterion\b/i)
        dc = torTitle.match(/\bdc\b/i)
        unrated = torTitle.match(/\bunrated\b/i)
        uncut = torTitle.match(/\buncut\b/i)
        theatric = torTitle.match(/\btheatrical\b/i)
        extended = torTitle.match(/\bextended\b/i)
      }
      if (site === GPW) {
        movieEditionCheck.click()
        if (cc) { ccClick.click() }
        if (dc) { dcClick.click() }
        if (unrated) { unratedClick.click() }
        if (uncut) { uncutClick.click() }
        if (theatric) { theatricClick.click() }
        if (extended) { extendedClick.click() }
      }
      // source
      let sourceNum = sourceNumDefault
      if (site === PTER || site === MTEAM) {
        sourceNum = torTitle.match(/\b(remux)\b/i)
          ? sourceNumRemux// remux
          : torTitle.match(/\b(blu-?ray|bdrip|dvdrip|webrip)\b/i)
            ? sourceNumEncode// encode
            : torTitle.match(/\bhdtv\b/i)
              ? sourceNumHdtv// hdtv
              : torTitle.match(/\bweb-?dl\b/i)
                ? sourceNumWebDl// web-dl
                : sourceNumDefault// other
      } else if (site === NHD) {
        sourceNum = torTitle.match(/\b(blu-?ray|bdrip)\b/i)
          ? sourceNumBluray
          : torTitle.match(/\bhdtv\b/i)
            ? sourceNumHddvd
            : torTitle.match(/\bdvd(rip)?/i)
              ? sourceNumDvd
              : torTitle.match(/\bweb-?dl\b/i)
                ? sourceNumWebDl
                : torTitle.match(/\bwebrip\b/i)
                  ? sourceNumWebrip
                  : sourceNumDefault
      } else if (site === GPW) {
        sourceNum = torTitle.match(/\b(blu-?ray|bdrip)\b/i)
          ? sourceNumBluray
          : torTitle.match(/\bhdtv\b/i)
            ? sourceNumHddvd
            : torTitle.match(/\bdvd(rip)?/i)
              ? sourceNumDvd
              : torTitle.match(/\bweb(-?dl|rip)?\b/i)
                ? sourceNumWeb
                : sourceNumDefault
      }
      if (sourceSel) {
        sourceSel.val(sourceNum)
      }
      // resolution
      let standardNum = standardNumDefault
      if (site === NHD || site === PUTAO || site === MTEAM || site === TTG || site === GPW) {
        standardNum = torTitle.match(/\b1080p\b/i)
          ? standardNum1080p
          : torTitle.match(/\b1080i\b/i)
            ? standardNum1080i
            : torTitle.match(/\b720p\b/i)
              ? standardNum720p
              : torTitle.match(/\b(2160p|4k)\b/i)
                ? standardNum2160p
                : torTitle.match(/\bdvd(rip)?\b/i)
                  ? standardNumSd
                  : standardNumDefault
      }
      if (standardSel) {
        standardSel.val(standardNum)
      }
      // processing
      let processNum = processNumDefault
      if (site === NHD) {
        processNum = torTitle.match(/\b(remux|web-?dl|(bd|dvd)?iso)\b/i)
          ? processNumRaw
          : processNumEncode
      } else if (site === GPW) {
        processingSel.closest('tr.hidden').removeClass('hidden')
        processNum = torTitle.match(/\bremux\b/i)
          ? processNumRemux
          : processNumEncode
      }
      if (processingSel) {
        processingSel.val(processNum)
      }
      // codec
      let codecNum = codecNumDefault
      if (site === NHD || site === PUTAO || site === MTEAM) {
        codecNum = torTitle.match(/\b(h|x)\.?264\b/i)
          ? codecNumH264
          : torTitle.match(/\b(h|x)\.?265\b/i)
            ? codecNumH265
            : torTitle.match(/\bavc\b/i)
              ? codecNumH264
              : torTitle.match(/\bhevc\b/i)
                ? codecNumH265
                : torTitle.match(/\bvc-1\b/i)
                  ? codecNumVc1
                  : torTitle.match(/\bmpeg-2\b/i)
                    ? codecNumMpeg2
                    : torTitle.match(/\bxvid\b/i)
                      ? codecNumXvid
                      : torTitle.match(/\bflac\b/i)
                        ? codecNumFlac
                        : torTitle.match(/\bape\b/i)
                          ? codecNumApe
                          : codecNumDefault
      } else if (site === GPW) {
        codecNum = torTitle.match(/\bh\.?264\b/i)
          ? codecNumH264
          : torTitle.match(/\bh\.?265\b/i)
            ? codecNumH265
            : torTitle.match(/\bavc|x264\b/i)
              ? codecNumX264
              : torTitle.match(/\bhevc|x265\b/i)
                ? codecNumX265
                : torTitle.match(/\bxvid\b/i)
                  ? codecNumXvid
                  : torTitle.match(/\bdivx\b/i)
                    ? codecNumDivX
                    : codecNumDefault
      }
      if (codecSel) {
        codecSel.val(codecNum)
      }
      // team
      let team = ''
      const teamArray = torTitle.match(/\b(D-Z0N3)|(([^\s-@]*)(@[^\s-]+)?)$/)
      if (teamArray) {
        team = teamArray[0]
        if (teamSel && site === MTEAM) {
          teamSel.find('option').each((_, element) => {
            if (element.text.toLowerCase() === team.toLowerCase()) {
              teamSel.val(element.value)
            }
          })
        }
      }
      //= ========================================================================================================
      // checking mediainfo
      let chineseDub = false; let cantoneseDub = false; let commentary = false; let nosub = true
      const subInfoDict = {
        chinese_simplified: { check: chineseSimplifiedSubCheck, present: false },
        chinese_traditional: { check: chineseTraditionalSubCheck, present: false },
        japanese: { check: japaneseSubCheck, present: false },
        korean: { check: koreanSubCheck, present: false },
        english: { check: englishSubCheck, present: false },
        french: { check: frenchSubCheck, present: false },
        german: { check: germanSubCheck, present: false },
        italian: { check: italianSubCheck, present: false },
        polish: { check: polishSubCheck, present: false },
        romanian: { check: romanianSubCheck, present: false },
        russian: { check: russianSubCheck, present: false },
        spanish: { check: spanishSubCheck, present: false },
        thai: { check: thaiSubCheck, present: false },
        turkish: { check: turkishSubCheck, present: false },
        vietnamese: { check: vietnameseSubCheck, present: false },
        hindi: { check: hindiSubCheck, present: false },
        greek: { check: greekSubCheck, present: false },
        swedish: { check: swedishSubCheck, present: false },
        azerbaijani: { check: azerbaijaniSubCheck, present: false },
        bulgarian: { check: bulgarianSubCheck, present: false },
        danish: { check: danishSubCheck, present: false },
        estonian: { check: estonianSubCheck, present: false },
        finnish: { check: finnishSubCheck, present: false },
        hebrew: { check: hebrewSubCheck, present: false },
        croatian: { check: croatianSubCheck, present: false },
        hungarian: { check: hungarianSubCheck, present: false },
        icelandic: { check: icelandicSubCheck, present: false },
        latvian: { check: latvianSubCheck, present: false },
        lithuanian: { check: lithuanianSubCheck, present: false },
        dutch: { check: dutchSubCheck, present: false },
        norwegian: { check: norwegianSubCheck, present: false },
        portuguese: { check: portugueseSubCheck, present: false },
        slovenian: { check: slovenianSubCheck, present: false },
        slovak: { check: slovakSubCheck, present: false },
        latin: { check: latinSubCheck, present: false },
        ukrainian: { check: ukrainianSubCheck, present: false },
        persian: { check: persianSubCheck, present: false },
        arabic: { check: arabicSubCheck, present: false },
        brazilian_port: { check: brazilianPortSubCheck, present: false },
        czech: { check: czechSubCheck, present: false },
        idonesian: { check: idonesianSubCheck, present: false },
        serbian: { check: serbianSubCheck, present: false }
      }
      let hdr10 = false; let dovi = false
      let mediainfo = {}
      if (decodingMediainfo) {
        let mediainfoStr = ''
        // 优先从简介中获取mediainfo
        const tagForMediainfo = targetTagBox || 'quote'
        const regexMIStr = boxSupportDescr
          ? '\\[' + tagForMediainfo + '\\s*=\\s*mediainfo\\][^]*?(General\\s*Unique\\s*ID[^\\0]*?)\\[\\/' + tagForMediainfo + '\\]'
          : '\\[' + tagForMediainfo + '\\][^]*?(General\\s*Unique\\s*ID[^\\0]*?)\\[\\/' + tagForMediainfo + '\\]'
        const regexMI = RegExp(regexMIStr, 'im')
        const mediainfoArray = textToConsume.match(regexMI)
        if (mediainfoArray) {
          const consumeStart = mediainfoArray.index
          const consumLength = mediainfoArray[0].length
          // remove text consumed (to ease regex matching later)
          textToConsume = textToConsume.substring(0, consumeStart) + textToConsume.substring(consumeStart + consumLength)
          mediainfoStr = mediainfoArray[1]
            .replace(/^\s*\[\w+(\s*=[^\]]+)?\]/g, '')
            .replace(/\s*\[\/\w+\]\s*$/g, '')
          mediainfo = decodeMediaInfo(mediainfoStr)
        }
        if (Object.keys(mediainfo).length === 0 && mediainfoBox) {
          // 如果简介中没有有效的mediainfo，读取mediainfobox
          mediainfoStr = mediainfoBox.val()
          mediainfo = decodeMediaInfo(mediainfoStr)
        }
        Object.entries(mediainfo).forEach(([infoKey, infoValue]) => {
          if (infoKey.match(/text( #\d+)?/i)) {
            // subtitle
            nosub = false
            let matchLang = false
            const language = infoValue.Language || infoValue.Title
            if (language.match(/chinese|chs|cht/i)) {
              if (language.match(/cht|(chinese( |_)traditional)/i)) {
                subInfoDict.chinese_traditional.present = true
              } else {
                subInfoDict.chinese_simplified.present = true
              }
              matchLang = true
            } else {
              Object.keys(subInfoDict).forEach(lang => {
                if (language.match(RegExp(escapeRegExp(lang), 'i')) || language.match(RegExp(escapeRegExp(lang.replace(/_/ig, ' ')), 'i'))) {
                  subInfoDict[lang].present = true
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
              commentary = true
            }
            if (title.match(/cantonese/i) || language.match(/cantonese/i)) {
              cantoneseDub = true
              console.log('Cantonese dub')
            } else if (title.match(/chinese|mandarin/i) || language.match(/chinese|mandarin/i)) {
              chineseDub = true
              console.log('Chinese Mandarin dub')
            } else {
              console.log('Other dub')
            }
          } else if (infoKey.match(/video/i)) {
            // video
            const hdrFormat = infoValue['HDR format']
            if (hdrFormat) {
              if (hdrFormat.match(/HDR10/i)) {
                hdr10 = true
                console.log('HDR10')
              }
              if (hdrFormat.match(/Dolby Vision/i)) {
                dovi = true
                console.log('Dolby Vision')
              }
            }
          } else if (infoKey.match(/general/i)) {
            // general
            if (infoValue.Format === 'Matroska') {
              containerNum = containerNumMkv
              console.log('MKV')
            } else if (infoValue.Format === 'MPEG-4') {
              containerNum = containerNumMp4
              console.log('MP4')
            } else if (infoValue.Format === 'AVI') {
              containerNum = containerNumAvi
              console.log('AVI')
            } else {
              containerNum = containerNumDefault
            }
          }
        })
        if (site === PTER) {
          if (chsubCheck && englishSubCheck && chdubCheck && cantodubCheck) {
            chsubCheck.checked = subInfoDict.chinese_simplified.present || subInfoDict.chinese_traditional.present
            englishSubCheck.checked = subInfoDict.english.present
            chdubCheck.checked = chineseDub
            cantodubCheck.checked = cantoneseDub
          }
        } else if (site === MTEAM) {
          if (chsubCheck && chdubCheck) {
            chsubCheck.checked = subInfoDict.chinese_simplified.present || subInfoDict.chinese_traditional.present
            chdubCheck.checked = chineseDub
          }
        } else if (site === TTG) {
          if (subInfoDict.chinese_simplified.present || subInfoDict.chinese_traditional.present) {
            subtitleBox.val('* 内封简繁字幕')
          } else if (subInfoDict.chinese_simplified.present) {
            subtitleBox.val('* 内封简体字幕')
          } else if (subInfoDict.chinese_traditional.present) {
            subtitleBox.val('* 内封繁体字幕')
          }
        } else if (site === GPW) {
          if (Object.keys(mediainfo).length > 0) {
            let mediainfoNew = mediainfoStr
            const completeNameArray = mediainfo.General['Complete name']
            if (!completeNameArray) {
              const movieNameArray = mediainfoStr.match(/^Movie name\s*:\s*(.+?)\s*$/mi)
              if (movieNameArray) {
                const completeName = mediainfo.General['Movie name'] + `.${containerNum.toLowerCase()}`
                mediainfoNew = mediainfoStr.replace(/(General\s+Unique ID.+$)\s+(Format\s+.+$)/mi,
                  '$1\n' + `Complete name                            : ${completeName}` + '\n$2')
              }
            }
            mediainfoBox.val(mediainfoNew)
            noSubCheck.checked = nosub; mixedSubCheck.checked = !nosub
            if (!nosub) {
              otherSubtitlesDiv.removeClass('hidden')
              Object.values(subInfoDict).forEach(infoLang => {
                if (infoLang.check) {
                  infoLang.check.checked = infoLang.present
                }
              })
            }
            chdubCheck.checked = chineseDub
            hdr10Check.checked = hdr10; doviCheck.checked = dovi
            if (commentary) {
              commentAudioClick.click()
            }
            containerSel.val(containerNum)
          }
        }
      }
      //= ========================================================================================================
      // checking movie info
      let cateNum = cateNumDefault
      if (construct === NEXUSPHP) {
        // container for small_desc (副标题)
        const smallDescrArray = []
        // name
        const translatedTitleArray = textToConsume.match(/译\s*名\s*([^/\n]+)(?:\/|\n)/)
        const originalTitleArray = textToConsume.match(/片\s*名\s*([^/\n]+)(?:\/|\n)/)
        // area
        const areaArray = textToConsume.match(/产\s*地\s*(.*)\s*/)
        const area = areaArray ? areaArray[1] : ''
        if (area.match(/中国大陆/)) {
          areaCnMl = true
        } else if (area.match(/香港/)) {
          areaHk = true
        } else if (area.match(/台湾/)) {
          areaTw = true
        } else if (area.match(/美国|加拿大|英国|法国|德国|希腊|匈牙利|爱尔兰|意大利|阿尔巴尼亚|安道尔|奥地利|白俄罗斯|比利时|波斯尼亚|黑塞哥维那|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛|冰岛|芬兰|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|梵蒂冈/)) {
          areaEuAme = true
        } else if (area.match(/印度|韩国|日本|新加坡|泰国|印度尼西亚|菲律宾|越南|土耳其|老挝|柬埔寨|缅甸|马来西亚|文莱|东帝汶|尼泊尔|不丹|孟加拉国|巴基斯坦|斯里兰卡|马尔代夫|阿富汗|伊拉克|伊朗|叙利亚|约旦|黎巴嫩|以色列|巴勒斯坦|沙特阿拉伯|阿曼|也门|格鲁吉亚|亚美尼亚|塞浦路斯|哈萨克斯坦|吉尔吉斯斯坦|塔吉克斯坦|乌兹别克斯坦|土库曼斯坦|蒙古|朝鲜/)) {
          areaAsia = true
          if (area.match(area.match(/韩国/))) {
            areaKor = true
          } else if (area.match(/日本/)) {
            areaJap = true
          } else if (area.match(/印度/)) {
            areaInd = true
          }
        }
        if (translatedTitleArray && originalTitleArray) {
          const transTitle = translatedTitleArray[1]
          const oriTitle = originalTitleArray[1]
          if (site === NHD || site === PTER || site === MTEAM || site === TTG) {
            if (areaCnMl) {
              smallDescrArray.push(torTitle.match(oriTitle) ? transTitle : oriTitle)
            } else {
              smallDescrArray.push(transTitle)
            }
          } else if (site === PUTAO) {
            if (areaCnMl) {
              torTitle = torTitle.match(oriTitle) ? torTitle : `[${oriTitle}] ${torTitle}`
              nameBox.val(torTitle)
            } else {
              torTitle = torTitle.match(transTitle) ? torTitle : `[${transTitle}] ${torTitle}`
              nameBox.val(torTitle)
            }
          }
        }
        // festival
        const festivalArray = textToConsume.match(/(\d{4})-\d{2}-\d{2}\((\S+电影节)\)/)
        if (festivalArray) {
          smallDescrArray.push(festivalArray[1] + festivalArray[2])
        }
        // category
        const categoryArray = textToConsume.match(/类\s*别\s+([^\n]*)\s*\n/)
        let category = ''
        if (categoryArray) {
          category = categoryArray[1].replace(/([^ ])\/([^ ])/g, '$1 / $2')
          smallDescrArray.push(category)
        }
        cateNum = category.match('纪录')
          ? cateNumDocumentary
          : category.match('动画')
            ? cateNumAnimation
            : textToConsume.match(/集\s*数\s+/g)
              ? cateNumTvSeries
              : category.match('秀')
                ? cateNumTvShow
                : cateNumMovie
        // douban and imdb score in small_desc
        if (site === NHD || site === PUTAO) {
          const doubScoreArray = textToConsume.match(/豆\s*瓣\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/)
          if (doubScoreArray) {
            smallDescrArray.push('豆瓣 ' + doubScoreArray[1] + '（' + doubScoreArray[2] + '）')
          }
          const imdbScoreArray = textToConsume.match(/IMDb\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/i)
          if (imdbScoreArray) {
            smallDescrArray.push('IMDb ' + imdbScoreArray[1] + '（' + imdbScoreArray[2] + '）')
          }
        }
        // director
        const directorArray = textToConsume.match(/导\s*演\s+([^\w\n\s]*)\s*/)
        if (directorArray) {
          smallDescrArray.push(directorArray[1])
        }
        // complete small_descr
        const smallDescr = smallDescrArray.join(' | ')
        smallDescBox.val(smallDescr)
        // douban link
        if (doubanLinkBox) {
          const doubanLinkArray = textToConsume.match(/豆瓣\s*链\s*接.+(https?:\/\/movie\.douban\.com\/subject\/(\d+)\/?)/)
          if (site === NHD || site === PTER || site === PUTAO) {
            doubanLinkBox.val(doubanLinkArray ? doubanLinkArray[1] : '')
          } else if (site === TTG) {
            console.log(`current content in douban link ${doubanLinkBox.val()}`)
            doubanLinkBox.val(doubanLinkArray ? doubanLinkArray[2] : '')
          }
        }
        // imdb link
        if (imdbLinkBox) {
          const imdbLinkArray = textToConsume.match(/IMDb\s*链\s*接.+(https?:\/\/www\.imdb\.com\/title\/(tt\d+)\/?)/i)
          if (site === NHD || site === PTER || site === PUTAO || site === MTEAM) {
            imdbLinkBox.val(imdbLinkArray ? imdbLinkArray[1] : '')
          } else if (site === TTG) {
            imdbLinkBox.val(imdbLinkArray ? imdbLinkArray[2] : '')
          }
        }
        // area selection
        if (areaSel) {
          let areaNum = areaNumDefault
          if (site === PTER) {
            areaNum = areaCnMl
              ? areaNumCnMl
              : areaHk
                ? areaNumHk
                : areaTw
                  ? areaNumTw
                  : areaEuAme
                    ? areaNumEuAme
                    : areaKor
                      ? areaNumKor
                      : areaJap
                        ? areaNumJap
                        : areaInd
                          ? areaNumInd
                          : areaNumOther
          } else if (site === MTEAM) {
            areaNum = areaCnMl
              ? areaNumCnMl
              : areaEuAme
                ? areaNumEuAme
                : areaHk || areaTw
                  ? areaNumHk
                  : areaJap
                    ? areaNumJap
                    : areaKor
                      ? areaNumKor
                      : areaNumOther
          }
          areaSel.val(areaNum)
        }
      }
      //= ========================================================================================================
      // checking screenshots
      // compare with comparison (GPW style)
      const regexScreenshotsComparison = /\[comparison=(\b\w[\w()-.[\] ]+\s*(,\s*\b\w[\w()-.[\] ]+?)+)\](\s*([^, [\]]+(\s+|\s*,)\s*)+[^, [\]]+)\[\/comparison\]/gmi
      // compare with thumbs
      const regexScreenshotsThumbs = /(\s*(\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\])?\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\](\[\/url\])?\s*)+/gmi
      if (construct === NEXUSPHP) {
        const screenshotsArrayComparison = textToConsume.match(regexScreenshotsComparison)
        let removePlainScreenshots = false
        if (screenshotsArrayComparison) {
          for (const slice of screenshotsArrayComparison) {
            const matchSlice = textToConsume.match(escapeRegExp(slice))
            const matchSingle = slice.match(RegExp(regexScreenshotsComparison.source, 'im'))
            const teams = matchSingle[1]
              .replace(/\s*,\s*/g, ', ')
              .split(',')
              .map(value => { return value.trim() })
            const teamsStr = teams.join(' | ')
            const imagesThumbs = await comparison2UrlImg(matchSingle[3], teams.length)
            let currentCompareStr = ''
            if (imagesThumbs.length > 0) {
              currentCompareStr = `[b]${teamsStr}[/b]`
              imagesThumbs.forEach((imagesThumbsSingle, i) => {
                currentCompareStr += (i % teams.length === 0 ? '\n' + imagesThumbsSingle : ' ' + imagesThumbsSingle)
              })
              currentCompareStr = `[center]${currentCompareStr}[/center]\n`
              textToConsume = textToConsume.substring(0, matchSlice.index) +
                currentCompareStr +
                textToConsume.substring(matchSlice.index + matchSlice[0].length)
              removePlainScreenshots = true
            }
          }
          if (removePlainScreenshots) {
            textToConsume = textToConsume.replace(/(\[b\])?Screenshots(\[\/b\])?(\s*\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\[\/img\])+/gi, '')
          }
          descrBox.val(textToConsume)
        }
      } else if (construct === GAZELLE) {
        let description = ''
        if (site === GPW) {
          // 如果没有选中种子文件，使用mediainfo来判断team名
          if (!torTitle && mediainfo && mediainfo.General) {
            let movieName = mediainfo.General['Complete name'] || mediainfo.General['Movie name']
            if (movieName) {
              movieName = formatTorrentName(movieName)
              const teamArray = movieName.match(/\b(D-Z0N3)|(([^\s-@]*)(@[^\s-]+)?)$/)
              if (teamArray) {
                team = teamArray[0]
              }
            }
          }
          let screenshots = ''
          let currentScreenshots = 0
          const screenshotsArrayComparison = textToConsume.match(regexScreenshotsComparison)
          if (screenshotsArrayComparison) {
            // 移除其他截图，重新生成
            textToConsume = textToConsume.replace(/(\[b\])?Screenshots(\[\/b\])?(\s*\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\[\/img\])+/gi, '')
            screenshotsArrayComparison.forEach(slice => {
              const matchSlice = textToConsume.match(escapeRegExp(slice))
              const matchSingle = slice.match(RegExp(regexScreenshotsComparison.source, 'im'))
              const teams = matchSingle[1]
                .replace(/\s*,\s*/g, ', ')
                .split(',')
                .map(value => { return value.trim() })
              const images = matchSingle[3]
                .split(/\s+|\s*,\s*/gi)
                .map(img => { return img.trim() })
              description += slice
              // remove the matched comparison
              textToConsume = textToConsume.substring(0, matchSlice.index) + textToConsume.substring(matchSlice.index + matchSlice[0].length)
              // extract screenshots
              if (images.length > 0 && images.length % teams.length === 0) {
                const groups = images.length / teams.length
                if (!screenshots && groups >= 3) {
                  images.forEach((image, i) => {
                    const teamCurrent = teams[i % teams.length]
                    if (currentScreenshots < maxScreenshots && (teamCurrent === 'Encode' || teamCurrent.toLowerCase() === team.toLowerCase())) {
                      screenshots += `[img]${image}[/img]`
                      currentScreenshots += 1
                    }
                  })
                }
              }
            })
          } else {
            const screenshotsArray = textToConsume.match(regexScreenshotsThumbs)
            // 用于回溯查找team
            const maxBacktrace = 100
            // 两种截图模式，第一种是包含[box|hide|expand|spoiler|quote=]标签的
            // possible splitters for teams: '|',',','/','-','vs'
            const regexComparison1 = /\[(box|hide|expand|spoiler|quote)\s*=\s*(\b\w[\w()-.[\] ]+(\s*(\||,|\/|-|>?\s*vs\.?\s*<?)\s*\b\w[\w()-.[\] ]+)+)\]((\s*(\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\])?\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\](\[\/url\])?\s*)+)\[\/(box|hide|expand|spoiler|quote)\]/mi
            // 第二种不包含[box|hide|expand|spoiler|quote=]标签，要求Source, Encode与截图之间至少有一个换行符
            const regexComparison2 = /^\W*((\b\w[\w()-.[\] ]+(\s*(\||,|\/|-|>?\s*vs\.?\s*<?)\s*\b\w[\w()-.[\] ]+)+)[\W]*\n+\s*((\s*(\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\])?\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+?\[\/img\](\[\/url\])?\s*)+))/mi
            const regexImageUrlWithThumb = /\s*\[url=[A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\]\[img\][A-Za-z0-9\-._~!$&'()*+,;=:@/?]+\[\/img\]\[\/url\]\s*/gi
            const regexSimpleImageUrl = /\s*\[img\]([A-Za-z0-9\-._~!$&'()*+,;=:@/?]+)\[\/img\]\s*/gi
            const regexTeamsSplitter = /\s*(\||,|\/|-|>?\s*vs\.?\s*<?)\s*/gi
            if (screenshotsArray) {
              screenshotsArray.forEach(slice => {
                const matchSlice = textToConsume.match(escapeRegExp(slice))
                if (!matchSlice) {
                  // not possible generally
                  return
                }
                const sliceStart = matchSlice.index
                const sliceLength = matchSlice[0].length
                const newStart = Math.max(0, sliceStart - maxBacktrace)
                const longerSlice = textToConsume.substring(newStart, sliceStart + sliceLength)
                let matchSingle = longerSlice.match(regexComparison1)
                let teamsStr = ''
                let imagesComparison = []
                let teamsComparison = []
                // global match in the whole text
                let globalMatch = []
                if (matchSingle) {
                  // 'Source, Encode, Other'
                  teamsStr = matchSingle[2].replace(regexTeamsSplitter, ', ')
                  teamsComparison = teamsStr
                    .split(',')
                    .map(value => { return value.trim() })
                  // '[url=https://show.png][img]https://thumb.png[/img][/url][url=https://show.png][img]https://thumb.png[/img][/url][url=https://show.png][img]https://thumb.png[/img][/url]'
                  const imagesStr = matchSingle[5]
                  // check if '[/url] exists'
                  if (matchSingle[8]) {
                    imagesComparison = urlImg2Comparison(imagesStr)
                  } else {
                    const matchSimple = imagesStr.match(regexSimpleImageUrl)
                    if (matchSimple) {
                      imagesComparison = imagesStr.replace(regexSimpleImageUrl, (_, group) => {
                        return group + ' '
                      }).split(/\s+/).filter(ele => { return ele })
                    }
                  }
                  globalMatch = textToConsume.match(escapeRegExp(matchSingle[0]))
                } else {
                  matchSingle = longerSlice.match(regexComparison2)
                  // 'Source, Encode, Other'
                  if (matchSingle) {
                    teamsStr = matchSingle[2].replace(regexTeamsSplitter, ', ')
                    teamsComparison = teamsStr
                      .split(',')
                      .map(value => { return value.trim() })
                    // '[url=https://show.png][img]https://thumb.png[/img][/url][url=https://show.png][img]https://thumb.png[/img][/url][url=https://show.png][img]https://thumb.png[/img][/url]'
                    const imagesStr = matchSingle[5]
                    // check if '[/url] exists'
                    if (matchSingle[8]) {
                      imagesComparison = urlImg2Comparison(imagesStr)
                    } else {
                      const matchSimple = imagesStr.match(regexSimpleImageUrl)
                      if (matchSimple) {
                        imagesComparison = imagesStr.replace(regexSimpleImageUrl, (_, group) => {
                          return group + ' '
                        }).split(/\s+/).filter(ele => { return ele })
                      }
                    }
                    // in this case, the \W* matched in the regex should be excluded
                    globalMatch = textToConsume.match(escapeRegExp(matchSingle[1]))
                  } else if (!screenshots) {
                    // consider the remained to be possible non-comparison screenshots
                    const imagesStr = slice
                    let imagesNonComparison = []
                    if (imagesStr.match(regexImageUrlWithThumb)) {
                      imagesNonComparison = urlImg2Comparison(imagesStr)
                    } else {
                      const matchSimple = imagesStr.match(regexSimpleImageUrl)
                      if (matchSimple) {
                        imagesComparison = imagesStr.replace(regexSimpleImageUrl, (_, group) => {
                          return group + ' '
                        }).split(/\s+/).filter(ele => { return ele })
                      }
                    }
                    if (imagesNonComparison.length >= 3) {
                      imagesNonComparison.forEach(image => { screenshots += `[img]${image}[/img]` })
                    }
                    globalMatch = textToConsume.match(escapeRegExp(slice))
                  }
                }
                // remove the matched comparison
                textToConsume = textToConsume.substring(0, globalMatch.index) + textToConsume.substring(globalMatch.index + globalMatch[0].length)
                // extract screenshots
                if (imagesComparison.length > 0 && imagesComparison.length % teamsComparison.length === 0) {
                  description += `[comparison=${teamsStr}]${imagesComparison.join(', ')}[/comparison]`
                  const groups = imagesComparison.length / teamsComparison.length
                  if (!screenshots && groups >= 3) {
                    imagesComparison.forEach((image, i) => {
                      const teamCurrent = teamsComparison[i % teamsComparison.length]
                      if (currentScreenshots < maxScreenshots && (teamCurrent === 'Encode' || teamCurrent.toLowerCase() === team.toLowerCase())) {
                        screenshots += `[img]${image}[/img]`
                        currentScreenshots += 1
                      }
                    })
                  }
                }
              })
            }
          }
          if (screenshots) {
            screenshots = '[b]Screenshots[/b]\n' + screenshots
            description += screenshots
          }
          const regexQuote = /\[quote(=(.*?))?\]([^]+)\[\/quote\]/gim
          const matchQuote = textToConsume.match(regexQuote)
          let quotes = ''
          if (matchQuote) {
            matchQuote.forEach(quote => {
              quotes += quote.replace(/\[quote=(.*?)\]/gi, '[b]$1[/b][quote]')
            })
          }
          description = quotes + description
          descrBox.val(description)
        }
      }
      // category selection
      if (categorySel) {
        if (site === PUTAO) {
          if (cateNum === cateNumMovie) {
            cateNum = areaCnMl
              ? cateNumMovieCnMl
              : areaEuAme
                ? cateNumMovieEuAme
                : areaAsia
                  ? cateNumMovieAsia
                  : cateNumMovieEuAme
          } else if (cateNum === cateNumDocumentary) {
            // for clarification
            cateNum = cateNumDocumentary
          } else if (cateNum === cateNumAnimation) {
            // for clarification
            cateNum = cateNumAnimation
          } else if (cateNum === cateNumTvSeries) {
            cateNum = areaHk || areaTw
              ? cateNumTvSeriesHkTw
              : areaAsia
                ? cateNumTvSeriesAsia
                : areaCnMl
                  ? cateNumTvSeriesCnMl
                  : areaEuAme
                    ? cateNumTvSeriesEuAme
                    : cateNumTvSeriesEuAme
          } else if (cateNum === cateNumTvShow) {
            cateNum = areaCnMl
              ? cateNumTvShowCnMl
              : areaHk || areaTw
                ? cateNumTvShowHkTw
                : areaEuAme
                  ? cateNumTvShowEuAme
                  : areaJap || areaKor
                    ? cateNumTvShowJpKor
                    : cateNumDefault
          }
        } else if (site === MTEAM) {
          if (cateNum === cateNumMovie) {
            cateNum = sourceNum === sourceNumRemux
              ? cateNumMovieRemux
              : sourceNum === sourceNumEncode || sourceNum === sourceNumHdtv || sourceNum === sourceNumHddvd || sourceNum === sourceNumWebDl
                ? cateNumMovieHd
                : cateNumDefault
          } else if (cateNum === cateNumTvSeries || cateNum === cateNumTvShow) {
            cateNum = sourceNum === sourceNumEncode || sourceNum === sourceNumHdtv || sourceNum === sourceNumHddvd || sourceNum === sourceNumWebDl
              ? cateNumTvSeriesHd
              : cateNumDefault
          } else if (cateNum === cateNumDocumentary) {
            cateNum = cateNumDocumentary
          } else if (cateNum === cateNumAnimation) {
            cateNum = cateNumAnimation
          } else {
            cateNum = cateNumDefault
          }
        } else if (site === TTG) {
          if (cateNum === cateNumMovie) {
            cateNum = standardNum === standardNum720p
              ? cateNumMovie720p
              : standardNum === standardNum1080i || standardNum === standardNum1080p
                ? cateNumMovie1080ip
                : standardNum === standardNum2160p
                  ? cateNumMovie2160p
                  : cateNumDefault
          } else if (cateNum === cateNumDocumentary) {
            cateNum = standardNum === standardNum720p
              ? cateNumDocumentary720p
              : standardNum === standardNum1080i || standardNum === standardNum1080p
                ? cateNumDocumentary1080ip
                : cateNumDefault
          } else if (cateNum === cateNumAnimation) {
            cateNum = cateNumAnimation
          } else if (cateNum === cateNumTvSeries) {
            cateNum = areaJap
              ? cateNumTvSeriesJap
              : areaKor
                ? cateNumTvSeriesKor
                : areaEuAme
                  ? cateNumTvSeriesEuAme
                  : areaCnMl || areaHk || areaTw
                    ? cateNumTvSeriesCnMl
                    : cateNumDefault
          } else if (cateNum === cateNumTvShow) {
            cateNum = areaKor
              ? cateNumTvShowKor
              : areaJap
                ? cateNumTvShowJap
                : cateNumTvShow
          }
        }
        categorySel.val(cateNum)
      }
      descrBox.focus()
    })
  } else if (page === 'subtitles') {
    //= ========================================================================================================
    // 字幕页面
    // 不需要填充信息的站点
    if (site === TTG) {
      return
    }
    let inputFile = null; let titleBox = null; let languageSel = null; let anonymousCheck = null
    if (site === NHD || site === PTER || site === PUTAO) {
      inputFile = $('input[type="file"][name="file"]')
      titleBox = $('input[type="text"][name="title"]')
      languageSel = $('select[name="sel_lang"]')
      anonymousCheck = $("input[name='uplver'][type='checkbox']")[0]
    } else if (site === MTEAM) {
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
      let langNumEng = 1; let langNumChs = 2; let langNumCht = 3
      let langNumJap = 4; let langNumFre = 5; let langNumGer = 6; let langNumIta = 7
      let langNumKor = 8; let langNumSpa = 9; let langNumOther = 10
      let langNum = 0
      const pathSub = inputFile.val()
      const fileName = /([^\\]+)$/.exec(pathSub)[1]
      if (fileName) {
        titleBox.val(fileName)
        const lang = pathSub.replace(/.*\.(.*)\..*/i, '$1')
        if (lang) {
          if (site === NHD || site === PTER || site === PUTAO) {
            langNumEng = 6; langNumChs = 25; langNumCht = 28
            langNumJap = 15; langNumFre = 9; langNumGer = 10; langNumIta = 14
            langNumKor = 16; langNumSpa = 26; langNumOther = 18
            langNum = lang.match(/(chs|cht|cn|zh)\s*( |&)?.+/) || lang.match(/.+( |&)?(chs|cht|cn|zh)/)
              ? langNumOther
              : lang.match(/chs/)
                ? langNumChs
                : lang.match(/cht/)
                  ? langNumCht
                  : lang.match(/eng/)
                    ? langNumEng
                    : lang.match(/jap|jp/)
                      ? langNumJap
                      : lang.match(/fre|fra/)
                        ? langNumFre
                        : lang.match(/ger/)
                          ? langNumGer
                          : lang.match(/ita/)
                            ? langNumIta
                            : lang.match(/kor/)
                              ? langNumKor
                              : lang.match(/spa/)
                                ? langNumSpa
                                : langNumOther
          } else if (site === MTEAM) {
            langNumEng = 6; langNumChs = 25; langNumCht = 28
            langNumJap = 15; langNumKor = 16; langNumOther = 18
            langNum = lang.match(/(chs|cht|cn|zh)\s*( |&)?.+/) || lang.match(/.+( |&)?(chs|cht|cn|zh)/)
              ? langNumOther
              : lang.match(/chs/)
                ? langNumChs
                : lang.match(/cht/)
                  ? langNumCht
                  : lang.match(/eng/)
                    ? langNumEng
                    : lang.match(/jap|jp/)
                      ? langNumJap
                      : lang.match(/kor/)
                        ? langNumKor
                        : langNumOther
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
