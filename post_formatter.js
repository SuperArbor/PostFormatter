// ==UserScript==
// @name         Post Formatter
// @description  Format upload info and smilies
// @version      1.2.5
// @author       Anonymous inspired by Secant(TYT@NexusHD)
// @match        http://*.nexushd.org/*
// @match        https://pterclub.com/*
// @match        https://pt.sjtu.edu.cn/*
// @match        https://kp.m-team.cc/*
// @require      https://cdn.staticfile.org/jquery/2.1.4/jquery.js
// @require      https://code.jquery.com/jquery-migrate-1.0.0.js
// @grant        none
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
  function switchBoxQuote (inputText, targetBoxTag) {
    let outputText, c
    const pat = '(\\[)(?:' +
            targetBoxTag + '|_x~bTYt_)((?:=[^\\]]+)?\\](?:(?!\\[\\/(?:' +
            targetBoxTag + '|_x~bTYt_)\\])[\\s\\S])*\\[)quote((?:=[^\\]]+)?\\](?:(?!\\[\\/quote\\])[\\s\\S])*\\[\\/)quote((?:=[^\\]]+)?\\](?:(?!\\[(?:' +
            targetBoxTag + '|_x~bTYt_)(?:=[^\\]]+)?\\])[\\s\\S])*\\[\\/)(?:' +
            targetBoxTag + '|_x~bTYt_)(\\])'
    const regex = RegExp(pat, 'g')
    do {
      outputText = inputText.replace(regex, '$1_x~bTYt_$2_e~qTYt_$3_e~qTYt_$4_x~bTYt_$5')
      c = (inputText !== outputText)
      inputText = outputText
    } while (c)
    outputText = outputText.replace(/_x~bTYt_/g, 'quote')
    outputText = outputText.replace(/_e~qTYt_/g, targetBoxTag)
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
  //= ========================================================================================================
  // Main
  const domainMatchArray = window.location.href.match(/(.*)\/(upload|edit|subtitles)\.php/)
  if (!domainMatchArray) {
    return
  }
  const site = domainMatchArray[1].match(/nexushd/i)
    ? 'nhd'
    : domainMatchArray[1].match(/pterclub/i)
      ? 'pter'
      : domainMatchArray[1].match(/pt\.sjtu/i)
        ? 'putao'
        : domainMatchArray[1].match(/m-team/i)
          ? 'mteam'
          : ''
  const page = domainMatchArray[2]
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
    btnBingo.attr({
      type: 'button',
      name: 'bingo_converter',
      value: 'BINGO',
      style: 'font-size: 11px; color: blue; margin-right: 3px'
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
    $('#compose input[name="quote"]').closest('table').after(table1)
    let switcher = 0
    if (window.location.href.match(/moresmilies\.php/)) {
      switcher = 1
    }
    $("a[href*='SmileIT']").click(function () {
      insertTyt(this.getAttribute('href').match(/\[em\d+\]/)[0], switcher)
      return false
    })
    const anonymousCheck = $("input[name='uplver'][type='checkbox']")[0]
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
    let sourceNumDvd = 4; let sourceNumEncode = 5; let sourceNumWebDl = 6; let sourceNumWebrip = 7; let sourceNumHdtv = 8
    // 站点支持的box标签类型
    let targetTagBox = ''
    // 其他站点的box标签类型（需要统一替换）
    let otherTagBoxes = ''
    // box是否支持添加说明[box=descr][/box]
    let boxSupportDescr = false
    // site-specific
    // (pter) areas
    let areaSel = null
    let chsubCheck = null; let ensubCheck = null; let chdubCheck = null; let cantodubCheck = null
    // (nhd, mteam) controls
    let standardSel = null; let processingSel = null; let codecSel = null
    // (nhd, mteam) standards
    let standardNumDefault = 0; let standardNum1080p = 1; let standardNum1080i = 2
    let standardNum720p = 3; let standardNum2160p = 4; let standardNumSd = 5
    // (nhd) processing
    let processNumDefault = 0; let processNumRaw = 1; let processNumEncode = 2
    // (nhd, mteam) codec
    let codecNumDefault = 0; let codecNumH264 = 1; let codecNumH265 = 2; let codecNumXvid = 3
    let codecNumMpeg2 = 4; let codecNumFlac = 5
    // (putao) categories
    let cateNumMovieCnMl = 0; let cateNumMovieEuAme = 1; let cateNumMovieAsia = 2; let cateNumTvSeriesHkTw = 3
    let cateNumTvSeriesAsia = 4; let cateNumTvSeriesCnMl = 5; let cateNumTvSeriesEuAme = 6
    let cateNumTvShowCnMl = 7; let cateNumTvShowEuAme = 8; let cateNumTvShowHkTw = 9; let cateNumTvShowJpKor = 10
    // (mteam) categories
    let cateNumMovieHd = 2; let cateNumMovieRemux = 5; let cateNumTvSeriesHd = 7
    // site definitions
    if (site === 'nhd') {
      targetTagBox = 'box'
      boxSupportDescr = true
      otherTagBoxes = ['hide', 'spoiler', 'expand'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      doubanLinkBox = $("input[name='douban_url']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')
      sourceSel = $("select[name='source_sel']")

      standardSel = $("select[name='standard_sel']")
      processingSel = $("select[name='processing_sel']")
      codecSel = $("select[name='codec_sel']")

      cateNumDefault = 0; cateNumMovie = 101; cateNumTvSeries = 102; cateNumTvShow = 103; cateNumDocumentary = 104; cateNumAnimation = 105
      sourceNumDefault = 0; sourceNumBluray = 1; sourceNumHddvd = 2; sourceNumDvd = 3; sourceNumHdtv = 4; sourceNumWebDl = 7; sourceNumWebrip = 9
      standardNumDefault = 0; standardNum1080p = 1; standardNum1080i = 2; standardNum720p = 3; standardNum2160p = 6; standardNumSd = 4
      processNumDefault = 0; processNumRaw = 1; processNumEncode = 2
      codecNumDefault = 0; codecNumH264 = 1; codecNumH265 = 2; codecNumXvid = 4; codecNumMpeg2 = 5; codecNumFlac = 10
    } else if (site === 'pter') {
      targetTagBox = 'hide'
      boxSupportDescr = true
      otherTagBoxes = ['box', 'spoiler', 'expand'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      doubanLinkBox = $("input[name='douban']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')
      sourceSel = $("select[name='source_sel']")

      areaSel = $("select[name='team_sel']")
      chsubCheck = $('#zhongzi')[0]
      ensubCheck = $('#ensub')[0]
      chdubCheck = $('#guoyu')[0]
      cantodubCheck = $('#yueyu')[0]

      cateNumDefault = 0; cateNumMovie = 401; cateNumTvSeries = 404; cateNumTvShow = 405; cateNumDocumentary = 402; cateNumAnimation = 403
      sourceNumDefault = 0; sourceNumBluray = 2; sourceNumRemux = 3; sourceNumEncode = 6; sourceNumHdtv = 4; sourceNumWebDl = 5; sourceNumDvd = 7
      areaNumDefault = 0; areaNumCnMl = 1; areaNumHk = 2; areaNumTw = 3; areaNumEuAme = 4; areaNumKor = 5; areaNumJap = 6; areaNumInd = 7; areaNumOther = 8
    } else if (site === 'putao') {
      targetTagBox = ''
      boxSupportDescr = true
      otherTagBoxes = ['box', 'hide', 'spoiler', 'expand'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      doubanLinkBox = $("input[name='douban_url']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')

      standardSel = $("select[name='standard_sel']")
      codecSel = $("select[name='codec_sel']")

      cateNumDefault = 0; cateNumDocumentary = 406; cateNumAnimation = 431; cateNumMovieCnMl = 401; cateNumMovieEuAme = 402
      cateNumMovieAsia = 403; cateNumTvSeriesHkTw = 407; cateNumTvSeriesAsia = 408; cateNumTvSeriesCnMl = 409; cateNumTvSeriesEuAme = 410
      cateNumTvShowCnMl = 411; cateNumTvShowHkTw = 412; cateNumTvShowEuAme = 413; cateNumTvShowJpKor = 414

      standardNumDefault = 0; standardNum1080p = 1; standardNum1080i = 2; standardNum720p = 3; standardNum2160p = 6; standardNumSd = 4
      codecNumDefault = 0; codecNumH264 = 1; codecNumXvid = 3; codecNumMpeg2 = 4; codecNumFlac = 5; codecNumH265 = 10
    } else if (site === 'mteam') {
      targetTagBox = 'expand'
      boxSupportDescr = false
      otherTagBoxes = ['box', 'hide', 'spoiler'].join('|')
      if (page === 'upload') {
        nameBox = $('#name')
      } else {
        nameBox = $("input[type='text'][name='name']")
      }
      smallDescBox = $("input[name='small_descr']")
      imdbLinkBox = $("input[name='url'][type='text']")
      descrBox = $('#descr')
      categorySel = $('#browsecat')

      standardSel = $("select[name='standard_sel']")
      areaSel = $("select[name='processing_sel']")
      codecSel = $("select[name='codec_sel']")

      chsubCheck = $("input[type='checkbox'][name='l_sub']")[0]
      chdubCheck = $("input[type='checkbox'][name='l_dub']")[0]

      cateNumDefault = 0; cateNumMovieHd = 419; cateNumMovieRemux = 439; cateNumTvSeriesHd = 402; cateNumDocumentary = 404; cateNumAnimation = 405
      areaNumCnMl = 1; areaNumEuAme = 2; areaNumHk = 3; areaNumTw = 3; areaNumJap = 4; areaNumKor = 5; areaNumOther = 6
      standardNumDefault = 0; standardNum1080p = 1; standardNum1080i = 2; standardNum720p = 3; standardNum2160p = 6; standardNumSd = 5
      codecNumDefault = 0; codecNumH264 = 1; codecNumH265 = 16; codecNumXvid = 3; codecNumMpeg2 = 4; codecNumFlac = 5
    }
    // function definition
    btnBingo.click(function () {
      if (anonymousCheck) {
        anonymousCheck.checked = anonymous
      }
      const oldText = descrBox.val()
      let newText = oldText.replace(/(\[\/?)([A-Z]+)((?:=(?:[^\r\n\t\f\v [\]])+)?\])/g, function (match, p1, p2, p3) {
        p2 = p2.toLowerCase()
        return p1 + p2 + p3
      })
      // 替换为当前box标签类型
      const regex1 = RegExp('\\[(\\/)?(?:' + otherTagBoxes + ')((?:=[^\\]]+)?)\\]', 'g')
      // NHD mediainfo style，切换为[box=mediainfo]的形式，以便于后续统一匹配mediainfo
      const regex2 = /\[mediainfo\]([^\0]*?)\[\/mediainfo\]/gi
      // 对于不支持box标签的站，统一替换为'quote'标签
      const replaceTag = targetTagBox || 'quote'
      // 对于不支持[box=...]形式的，去除box后面的内容
      const replaceContent1 = boxSupportDescr ? '[$1' + replaceTag + '$2]' : '[$1' + replaceTag + ']'
      // 替换mediainfo格式
      const replaceContent2 = boxSupportDescr ? '[' + replaceTag + '=mediainfo]$1[/' + replaceTag + ']' : '[' + replaceTag + ']$1[/' + replaceTag + ']'
      newText = newText.replace(regex1, replaceContent1).replace(regex2, replaceContent2)
      newText = newText.replace(/\[pre\]/g, '[font=courier new]').replace(/\[\/pre\]/g, '[/font]')
      if (targetTagBox) {
        newText = nestExplode(newText, targetTagBox)
        newText = switchBoxQuote(newText, targetTagBox)
      }
      newText = newText.replace(/(?:(?:\[\/(url|flash|flv))|^)(?:(?!\[(url|flash|flv))[\s\S])*(?:(?:\[(url|flash|flv))|$)/g, function (matches) {
        return (matches.replace(/\[align(=\w*)?\]/g, '\n'))
      })
      newText = newText
        .replace(/\[(\/)?align(=\w*)?\]/g, '')
        .replace(/^\s*([\s\S]*\S)\s*$/g, '$1')// 是否要加上第一行？/^(\s*\n)?([\s\S]*\S)\s*$/g
        .replace(/\[size=(\d+)\]/g, function (match, p1) {
          if (parseInt(p1) > 7) {
            return ('[size=7]')
          }
          return (match)
        })
      if (targetTagBox) {
        newText = compactContent(newText, targetTagBox)
      }
      descrBox.val(newText)
      //= ========================================================================================================
      // checking torrent name
      // name
      let torTitle = nameBox.val()
      torTitle = torTitle
        // 去除.torrent后缀
        .replace(/(.*)\.torrent/gi, '$1')
        // 去除视频文件后缀
        .replace(/\s+(?:mkv|mp4|iso|ts)\s*$/gi, '')
        // 去除'[] '开头的内容
        .replace(/^\[.*\]\s(\S)/gi, '$1')
      nameBox.val(torTitle)
      // source
      let sourceNum = sourceNumDefault
      if (site === 'pter' || site === 'mteam') {
        sourceNum = torTitle.match(/\W(?:remux)\W/i)
          ? sourceNumRemux// remux
          : torTitle.match(/\W(?:blu(?:e|-)?ray|bdrip|dvdrip|webrip)\W/i)
            ? sourceNumEncode// encode
            : torTitle.match(/\Whdtv\W/i)
              ? sourceNumHdtv// hdtv
              : torTitle.match(/\Wweb-?dl\W/i)
                ? sourceNumWebDl// web-dl
                : sourceNumDefault// other
      } else if (site === 'nhd') {
        sourceNum = torTitle.match(/\W(?:blu(?:e|-)?ray|bdrip)\W/i)
          ? sourceNumBluray
          : torTitle.match(/\Whdtv\W/i)
            ? sourceNumHddvd
            : torTitle.match(/\Wdvd/i)
              ? sourceNumDvd
              : torTitle.match(/\Wweb-?dl\W/i)
                ? sourceNumWebDl
                : torTitle.match(/\Wwebrip\W/i)
                  ? sourceNumWebrip
                  : sourceNumDefault
      }
      if (sourceSel) {
        sourceSel.val(sourceNum)
      }
      // resolution
      let stantdardNum = standardNumDefault
      if (site === 'nhd' || site === 'putao' || site === 'mteam') {
        stantdardNum = torTitle.match(/\W1080p\W/i)
          ? standardNum1080p
          : torTitle.match(/\W1080i\W/i)
            ? standardNum1080i
            : torTitle.match(/\W720p\W/i)
              ? standardNum720p
              : torTitle.match(/\W(?:2160p|4k)\W/i)
                ? standardNum2160p
                : torTitle.match(/\Wdvd/i)
                  ? standardNumSd
                  : standardNumDefault
      }
      if (standardSel) {
        standardSel.val(stantdardNum)
      }
      // processing
      let processNum = processNumDefault
      if (site === 'nhd') {
        processNum = torTitle.match(/\W(?:remux|web-?dl)\W/i)
          ? processNumRaw
          : processNumEncode
      }
      if (processingSel) {
        processingSel.val(processNum)
      }
      // codec
      let codecNum = codecNumDefault
      if (site === 'nhd' || site === 'putao' || site === 'mteam') {
        codecNum = torTitle.match(/\W(?:h|x)\.?264\W/i)
          ? codecNumH264
          : torTitle.match(/\W(?:h|x)\.?265\W/i)
            ? codecNumH265
            : torTitle.match(/\Wmpeg-2/i)
              ? codecNumMpeg2
              : torTitle.match(/\Wxvid/i)
                ? codecNumXvid
                : torTitle.match(/\Wflac/i)
                  ? codecNumFlac
                  : codecNumDefault
      }
      if (codecSel) {
        codecSel.val(codecNum)
      }
      //= ========================================================================================================
      // checking movie info
      if (newText.match('◎')) {
        // container for small_desc (副标题)
        const smallDescrArray = []
        // name
        const translatedTitleArray = newText.match(/译\s*名\s*([^/\n]+)(?:\/|\n)/)
        const originalTitleArray = newText.match(/片\s*名\s*([^/\n]+)(?:\/|\n)/)
        // area
        const areaArray = newText.match(/产\s*地\s*(.*)\s*/)
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
          if (site === 'nhd' || site === 'pter' || site === 'mteam') {
            if (areaCnMl) {
              smallDescrArray.push(torTitle.match(oriTitle) ? transTitle : oriTitle)
            } else {
              smallDescrArray.push(transTitle)
            }
          } else if (site === 'putao') {
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
        const festivalArray = newText.match(/(\d{4})-\d{2}-\d{2}\((\S+电影节)\)/)
        if (festivalArray) {
          smallDescrArray.push(festivalArray[1] + festivalArray[2])
        }
        // category
        const categoryArray = newText.match(/类\s*别\s+([^\n]*)\s*\n/)
        let category = ''
        if (categoryArray) {
          category = categoryArray[1].replace(/([^ ])\/([^ ])/g, '$1 / $2')
          smallDescrArray.push(category)
        }
        let cateNum = category.match('纪录')
          ? cateNumDocumentary
          : category.match('动画')
            ? cateNumAnimation
            : newText.match(/集\s*数\s+/g)
              ? cateNumTvSeries
              : category.match('秀')
                ? cateNumTvShow
                : cateNumMovie
        // douban and imdb score in small_desc
        if (site === 'nhd' || site === 'putao') {
          const doubScoreArray = newText.match(/豆\s*瓣\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/)
          if (doubScoreArray) {
            smallDescrArray.push('豆瓣 ' + doubScoreArray[1] + '（' + doubScoreArray[2] + '）')
          }
          const imdbScoreArray = newText.match(/IMDb\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/i)
          if (imdbScoreArray) {
            smallDescrArray.push('IMDb ' + imdbScoreArray[1] + '（' + imdbScoreArray[2] + '）')
          }
        }
        // director
        const directorArray = newText.match(/导\s*演\s+([^\w\n\s]*)\s*/)
        if (directorArray) {
          smallDescrArray.push(directorArray[1])
        }
        // complete small_descr
        const smallDescr = smallDescrArray.join(' | ')
        smallDescBox.val(smallDescr)
        // douban link
        if (doubanLinkBox) {
          const doubanLinkArray = newText.match(/豆瓣\s*链\s*接.+(https?:\/\/movie\.douban\.com\/subject\/\d+\/?)/)
          doubanLinkBox.val(doubanLinkArray ? doubanLinkArray[1].replace(/\[url=(.*?)\].*?\[\/url\]/, '$1') : '')
        }
        // imdb link
        if (imdbLinkBox) {
          const imdbLinkArray = newText.match(/IMDb\s*链\s*接.+(https?:\/\/www\.imdb\.com\/title\/tt\d+\/?)/i)
          imdbLinkBox.val(imdbLinkArray ? imdbLinkArray[1].replace(/\[url=(.*?)\].*?\[\/url\]/, '$1') : '')
        }
        // area selection
        if (areaSel) {
          let areaNum = areaNumDefault
          if (site === 'pter') {
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
          } else if (site === 'mteam') {
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
        // category selection
        if (categorySel) {
          if (site === 'putao') {
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
          } else if (site === 'mteam') {
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
          }
          categorySel.val(cateNum)
        }
      }
      //= ========================================================================================================
      // checking mediainfo
      let chineseSub = false
      let englishSub = false
      let chineseDub = false
      let cantoneseDub = false
      if (site === 'pter' || site === 'mteam') {
        const tagForMediainfo = targetTagBox || 'quote'
        const regexStr = boxSupportDescr
          ? '\\[' + tagForMediainfo + '\\s*=\\s*mediainfo\\].*?(General\\s*?Unique\\s*?ID[^\\0]*?)\\[\\/' + tagForMediainfo + '\\]'
          : '\\[' + tagForMediainfo + '\\].*?(General\\s*?Unique\\s*?ID[^\\0]*?)\\[\\/' + tagForMediainfo + '\\]'
        const regex2 = RegExp(regexStr, 'im')
        const mediainfoArray = newText.match(regex2)
        if (mediainfoArray) {
          const mediainfo = mediainfoArray[1]
          const subtitles = mediainfo.match(/Text.*?\nID[^\0]*?Forced.*/gm)
          if (subtitles) {
            console.log(`${subtitles.length} subtitles`)
            subtitles.forEach((subtitle) => {
              let languageArray = subtitle.match(/language\s*:(.*)/i)
              if (!languageArray) {
                languageArray = subtitle.match(/title\s*:(.*)/i)
              }
              if (languageArray) {
                const language = languageArray[1]
                if (language.match(/chinese|chs|cht/i)) {
                  console.log('Chinese sub')
                  chineseSub = true
                } else if (language.match(/english/i)) {
                  englishSub = true
                  console.log('Englis sub')
                } else {
                  console.log('Other sub')
                }
              } else {
                console.log('No language specified for the sub')
              }
            })
          } else {
            console.log('No subs')
          }
          const dubs = mediainfo.match(/Audio.*\nID[^\0]*?Forced.*/gm)
          if (dubs) {
            console.log(`${dubs.length} dubs`)
            dubs.forEach((dub) => {
              if (dub.match(/cantonese/i)) {
                cantoneseDub = true
                console.log('Cantonese dub')
              } else if (dub.match(/chinese/i)) {
                chineseDub = true
                console.log('Chinese Mandarin dub')
              } else {
                console.log('Other dub')
              }
            })
          } else {
            console.log('No dubs')
          }
          if (site === 'pter') {
            if (chsubCheck && ensubCheck && chdubCheck && cantodubCheck) {
              chsubCheck.checked = chineseSub
              ensubCheck.checked = englishSub
              chdubCheck.checked = chineseDub
              cantodubCheck.checked = cantoneseDub
            }
          } else if (site === 'mteam') {
            if (chsubCheck && chdubCheck) {
              chsubCheck.checked = chineseSub
              chdubCheck.checked = chineseDub
            }
          }
        }
      }
      descrBox.focus()
    })
  } else if (page === 'subtitles') {
    //= ========================================================================================================
    // 字幕页面
    let inputFile = null; let titleBox = null; let languageSel = null
    if (site === 'nhd' || site === 'pter' || site === 'putao') {
      inputFile = $('input[type="file"][name="file"]')
      titleBox = $('input[type="text"][name="title"]')
      languageSel = $('select[name="sel_lang"]')
    } else if (site === 'mteam') {
      inputFile = $('input[type="file"][name="file[]"]')
      titleBox = $('input[type="text"][name="title[]"]')
      languageSel = $('select[name="sel_lang[]"]')
    }
    if (!inputFile) {
      return
    }
    const anonymousCheck = $("input[name='uplver'][type='checkbox']")[0]
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
          if (site === 'nhd' || site === 'pter' || site === 'putao') {
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
          } else if (site === 'mteam') {
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
