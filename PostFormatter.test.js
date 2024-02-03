// module imports
const {
  collectComparisons, generateComparison, processDescription, mediainfo2String, string2Mediainfo,
  NHD, GPW, PUTAO, TTG, PTERCLUB, MTEAM} = require('./PostFormatter')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const simpleScreenshotsTests = [{
  text: `.org/details.php?id=148204&source=details-related[/quote][quote=Source, EbP, NTb (different source)][url=https://pixhost.to/show/320/411481872_999906.png][img]https://t91.pixhost.to/thumbs/320/411481872_999906.png[/img][/url] [url=https://pixhost.to/show/320/411481874_46oz77.png][img]https://t91.pixhost.to/thumbs/320/411481874_46oz77.png[/img][/url] [url=https://pixhost.to/show/320/411481876_u4061m.png][img]https://t91.pixhost.to/thumbs/320/411481876_u4061m.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481878_oea9as.png][img]https://t91.pixhost.to/thumbs/320/411481878_oea9as.png[/img][/url] [url=https://pixhost.to/show/320/411481883_297v98.png][img]https://t91.pixhost.to/thumbs/320/411481883_297v98.png[/img][/url] [url=https://pixhost.to/show/320/411481888_d12398.png][img]https://t91.pixhost.to/thumbs/320/411481888_d12398.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481893_m50sc6.png][img]https://t91.pixhost.to/thumbs/320/411481893_m50sc6.png[/img][/url] [url=https://pixhost.to/show/320/411481896_t02dhl.png][img]https://t91.pixhost.to/thumbs/320/411481896_t02dhl.png[/img][/url] [url=https://pixhost.to/show/320/411481899_tq032o.png][img]https://t91.pixhost.to/thumbs/320/411481899_tq032o.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481900_5o7131.png][img]https://t91.pixhost.to/thumbs/320/411481900_5o7131.png[/img][/url] [url=https://pixhost.to/show/320/411481901_xxwxmk.png][img]https://t91.pixhost.to/thumbs/320/411481901_xxwxmk.png[/img][/url] [url=https://pixhost.to/show/320/411481904_yx1s17.png][img]https://t91.pixhost.to/thumbs/320/411481904_yx1s17.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481908_b714hm.png][img]https://t91.pixhost.to/thumbs/320/411481908_b714hm.png[/img][/url] [url=https://pixhost.to/show/320/411481912_8p67ox.png][img]https://t91.pixhost.to/thumbs/320/411481912_8p67ox.png[/img][/url] [url=https://pixhost.to/show/320/411481918_r78rs0.png][img]https://t91.pixhost.to/thumbs/320/411481918_r78rs0.png[/img][/url][/quote]`,
  result: [{
    teams: ['Source', 'EbP', 'NTb (different source)'],
    numUrls: 15,
    thumbs: true,
    type: 'boxed',
    length: 1952
  }]
}, {
  text: `Source | Filtered | c0kE | PTER | HANDJOB
  [url=https://pixhost.to/show/395/440442913_rzj9id36_o.png][img]https://t93.pixhost.to/thumbs/395/440442913_rzj9id36_o.png[/img][/url] [url=https://pixhost.to/show/395/440442915_lpstfsy0_o.png][img]https://t93.pixhost.to/thumbs/395/440442915_lpstfsy0_o.png[/img][/url] [url=https://pixhost.to/show/395/440442916_xgqopgwe_o.png][img]https://t93.pixhost.to/thumbs/395/440442916_xgqopgwe_o.png[/img][/url] [url=https://pixhost.to/show/395/440442918_icxis9cn_o.png][img]https://t93.pixhost.to/thumbs/395/440442918_icxis9cn_o.png[/img][/url] [url=https://pixhost.to/show/395/440442919_h4am7bdz_o.png][img]https://t93.pixhost.to/thumbs/395/440442919_h4am7bdz_o.png[/img][/url]
  [url=https://pixhost.to/show/395/440442920_k6riyd50_o.png][img]https://t93.pixhost.to/thumbs/395/440442920_k6riyd50_o.png[/img][/url] [url=https://pixhost.to/show/395/440442921_jvlnrjkq_o.png][img]https://t93.pixhost.to/thumbs/395/440442921_jvlnrjkq_o.png[/img][/url] [url=https://pixhost.to/show/395/440442922_vvdorzur_o.png][img]https://t93.pixhost.to/thumbs/395/440442922_vvdorzur_o.png[/img][/url] [url=https://pixhost.to/show/395/440442923_ubx0rwf4_o.png][img]https://t93.pixhost.to/thumbs/395/440442923_ubx0rwf4_o.png[/img][/url] [url=https://pixhost.to/show/395/440442924_kqdeml4s_o.png][img]https://t93.pixhost.to/thumbs/395/440442924_kqdeml4s_o.png[/img][/url]
  [url=https://pixhost.to/show/395/440442932_s72jum90_o.png][img]https://t93.pixhost.to/thumbs/395/440442932_s72jum90_o.png[/img][/url] [url=https://pixhost.to/show/395/440442933_5ezkdlvf_o.png][img]https://t93.pixhost.to/thumbs/395/440442933_5ezkdlvf_o.png[/img][/url] [url=https://pixhost.to/show/395/440442935_kioo1nwq_o.png][img]https://t93.pixhost.to/thumbs/395/440442935_kioo1nwq_o.png[/img][/url] [url=https://pixhost.to/show/395/440442936_pviauquf_o.png][img]https://t93.pixhost.to/thumbs/395/440442936_pviauquf_o.png[/img][/url] [url=https://pixhost.to/show/395/440442937_z0nemsnc_o.png][img]https://t93.pixhost.to/thumbs/395/440442937_z0nemsnc_o.png[/img][/url]
  [url=https://pixhost.to/show/395/440442939_nyssxueg_o.png][img]https://t93.pixhost.to/thumbs/395/440442939_nyssxueg_o.png[/img][/url] [url=https://pixhost.to/show/395/440442941_ooomolpd_o.png][img]https://t93.pixhost.to/thumbs/395/440442941_ooomolpd_o.png[/img][/url] [url=https://pixhost.to/show/395/440442943_qdrnnkum_o.png][img]https://t93.pixhost.to/thumbs/395/440442943_qdrnnkum_o.png[/img][/url] [url=https://pixhost.to/show/395/440442945_aaf44qw4_o.png][img]https://t93.pixhost.to/thumbs/395/440442945_aaf44qw4_o.png[/img][/url] [url=https://pixhost.to/show/395/440442946_5px4gz8x_o.png][img]https://t93.pixhost.to/thumbs/395/440442946_5px4gz8x_o.png[/img][/url][/center]`,
  result: [{
    teams: ['Source', 'Filtered', 'c0kE', 'PTER', 'HANDJOB'],
    numUrls: 20,
    thumbs: true,
    type: 'titled',
    length: 2729
  }]
}, {
  text: `[/quote]
  [comparison=Source,  Encode]https://img61.pixhost.to/images/119/238035749_237889334_1.png https://img61.pixhost.to/images/119/238035750_237889336_1a.png https://img61.pixhost.to/images/119/238035751_237889339_2.png https://img61.pixhost.to/images/119/238035752_237889340_2a.png https://img61.pixhost.to/images/119/238035753_237889342_3.png https://img61.pixhost.to/images/119/238035754_237889345_3a.png https://img61.pixhost.to/images/119/238035755_237889377_8.png https://img61.pixhost.to/images/119/238035756_237889380_8a.png[/comparison]
  [b]Screenshots[/b]
  [img]https://img61.pixhost.to/images/119/238035750_237889336_1a.png[/img] [img]https://img61.pixhost.to/images/119/238035752_237889340_2a.png[/img] [img]https://img61.pixhost.to/images/119/238035754_237889345_3a.png[/img] [img]https://img61.pixhost.to/images/119/238035756_237889380_8a.png[/img]`,
  result: [{
    teams: ['Source', 'Encode'],
    numUrls: 8,
    thumbs: false,
    type: 'comparison',
    length: 540
  }]
}, {
  text: `
  Both cuts maintain a constant aspect ratio of 2.4:1, overall the US Cut overcrops on all sides and stretches the picture; the CAN has much more picture in that regard, however it also sports a black bar on the right side. Scenes toward the end which LaBeouf and Wasikowska share, share the same aspect ratio and crop across both cuts
  
  F2:1 - November, 1940[box][img]https://ptpimg.me/3psjbv.png[/img][img]https://ptpimg.me/sd10kv.png[/img][/box]F2:2 - Bootlegger[box][img]https://ptpimg.me/d13p3w.png[/img][img]https://ptpimg.me/lc33si.png[/img][/box]F2:3 - Swamp[box][img]https://ptpimg.me/75c4fz.png[/img][img]https://ptpimg.me/356xm9.png[/img][/box]F2:4 - Chastain[box][img]https://ptpimg.me/gwr5o8.png[/img][img]https://ptpimg.me/3r5o0t.png[/img][/box]F2:5 - Ride[box][img]https://ptpimg.me/ok283p.png[/img][img]https://ptpimg.me/q7o6ri.png[/img][/box][size=5]Colours[/size]
  
  Self explanatory, there are only a handful of scenes where the colours are different; here are a few of those:
  
  F3:1 - Kids from F1:2[box][img]https://ptpimg.me/096p9l.png[/img][img]https://ptpimg.me/tcuhe7.png[/img][/box]F3:2 - Farm[box][img]https://ptpimg.me/93j5my.png[/img][img]https://ptpimg.me/yto0a7.png[/img][/box]F3:3 - Cup of Joe[box][img]https://ptpimg.me/o9qa48.png[/img][img]https://ptpimg.me/6dy75d.png[/img][/box]F3:4 - Law Enforcement[box][img]https://ptpimg.me/b8626y.png[/img][img]https://ptpimg.me/44xh1w.png[/img][/box]F3:5 - I see through[box][img]https://ptpimg.me/05emya.png[/img][img]https://ptpimg.me/54q2b4.png[/img][/box]Original https://hdbits.org/details.php?id=148204&source=details-related[/quote][box=Source, EbP, NTb (different source)][url=https://pixhost.to/show/320/411481872_999906.png][img]https://t91.pixhost.to/thumbs/320/411481872_999906.png[/img][/url] [url=https://pixhost.to/show/320/411481874_46oz77.png][img]https://t91.pixhost.to/thumbs/320/411481874_46oz77.png[/img][/url] [url=https://pixhost.to/show/320/411481876_u4061m.png][img]https://t91.pixhost.to/thumbs/320/411481876_u4061m.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481878_oea9as.png][img]https://t91.pixhost.to/thumbs/320/411481878_oea9as.png[/img][/url] [url=https://pixhost.to/show/320/411481883_297v98.png][img]https://t91.pixhost.to/thumbs/320/411481883_297v98.png[/img][/url] [url=https://pixhost.to/show/320/411481888_d12398.png][img]https://t91.pixhost.to/thumbs/320/411481888_d12398.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481893_m50sc6.png][img]https://t91.pixhost.to/thumbs/320/411481893_m50sc6.png[/img][/url] [url=https://pixhost.to/show/320/411481896_t02dhl.png][img]https://t91.pixhost.to/thumbs/320/411481896_t02dhl.png[/img][/url] [url=https://pixhost.to/show/320/411481899_tq032o.png][img]https://t91.pixhost.to/thumbs/320/411481899_tq032o.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481900_5o7131.png][img]https://t91.pixhost.to/thumbs/320/411481900_5o7131.png[/img][/url] [url=https://pixhost.to/show/320/411481901_xxwxmk.png][img]https://t91.pixhost.to/thumbs/320/411481901_xxwxmk.png[/img][/url] [url=https://pixhost.to/show/320/411481904_yx1s17.png][img]https://t91.pixhost.to/thumbs/320/411481904_yx1s17.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481908_b714hm.png][img]https://t91.pixhost.to/thumbs/320/411481908_b714hm.png[/img][/url] [url=https://pixhost.to/show/320/411481912_8p67ox.png][img]https://t91.pixhost.to/thumbs/320/411481912_8p67ox.png[/img][/url] [url=https://pixhost.to/show/320/411481918_r78rs0.png][img]https://t91.pixhost.to/thumbs/320/411481918_r78rs0.png[/img][/url][/box]`,
  result: [{
    teams: ['Source', 'EbP', 'NTb (different source)'],
    numUrls: 15,
    thumbs: true,
    type: 'boxed',
    length: 1948
  }]
}, {
  text: `
  * Dirty line fixed with bbmod.
  * Audio bit-depth reduced to 16-bit with SoX and encoded to FLAC.
  * English subs ocr'd from Artificial Eye Blu-ray, synced, spell checked & Fixed common errors.
  * Thanks to Red, quangr4ge, cqustlym, tmpnam and all c0kE's members.
  * Enjoy! image
  
  
  [b]x264 LOG:[/b]
  x264 [info]: frame I:801   Avg QP:19.91  size:275311
  x264 [info]: frame P:30459 Avg QP:21.32  size:195216
  x264 [info]: frame B:129657 Avg QP:23.52  size:102072
  x264 [info]: consecutive B-frames:  0.7%  0.7%  3.4% 18.7% 15.2% 39.6% 12.2%  7.8%  1.7%[/quote][center][b]Screenshot Comparisons:
  Source | c0kE | POH
  [url=https://pixhost.to/show/90/312208619_1.png][img]https://t78.pixhost.to/thumbs/90/312208619_1.png[/img][/url] [url=https://pixhost.to/show/90/312208637_2.png][img]https://t78.pixhost.to/thumbs/90/312208637_2.png[/img][/url] [url=https://pixhost.to/show/90/312208642_3.png][img]https://t78.pixhost.to/thumbs/90/312208642_3.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208650_4.png][img]https://t78.pixhost.to/thumbs/90/312208650_4.png[/img][/url] [url=https://pixhost.to/show/90/312208663_5.png][img]https://t78.pixhost.to/thumbs/90/312208663_5.png[/img][/url] [url=https://pixhost.to/show/90/312208679_6.png][img]https://t78.pixhost.to/thumbs/90/312208679_6.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208706_7.png][img]https://t78.pixhost.to/thumbs/90/312208706_7.png[/img][/url] [url=https://pixhost.to/show/90/312208728_8.png][img]https://t78.pixhost.to/thumbs/90/312208728_8.png[/img][/url] [url=https://pixhost.to/show/90/312208737_9.png][img]https://t78.pixhost.to/thumbs/90/312208737_9.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208745_10.png][img]https://t78.pixhost.to/thumbs/90/312208745_10.png[/img][/url] [url=https://pixhost.to/show/90/312208752_11.png][img]https://t78.pixhost.to/thumbs/90/312208752_11.png[/img][/url] [url=https://pixhost.to/show/90/312208766_12.png][img]https://t78.pixhost.to/thumbs/90/312208766_12.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208773_13.png][img]https://t78.pixhost.to/thumbs/90/312208773_13.png[/img][/url] [url=https://pixhost.to/show/90/312208779_14.png][img]https://t78.pixhost.to/thumbs/90/312208779_14.png[/img][/url] [url=https://pixhost.to/show/90/312208790_15.png][img]https://t78.pixhost.to/thumbs/90/312208790_15.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208792_16.png][img]https://t78.pixhost.to/thumbs/90/312208792_16.png[/img][/url] [url=https://pixhost.to/show/90/312208796_17.png][img]https://t78.pixhost.to/thumbs/90/312208796_17.png[/img][/url] [url=https://pixhost.to/show/90/312208798_18.png][img]https://t78.pixhost.to/thumbs/90/312208798_18.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208806_19.png][img]https://t78.pixhost.to/thumbs/90/312208806_19.png[/img][/url] [url=https://pixhost.to/show/90/312208813_20.png][img]https://t78.pixhost.to/thumbs/90/312208813_20.png[/img][/url] [url=https://pixhost.to/show/90/312208815_21.png][img]https://t78.pixhost.to/thumbs/90/312208815_21.png[/img][/url] 
  [url=https://pixhost.to/show/90/312208818_22.png][img]https://t78.pixhost.to/thumbs/90/312208818_22.png[/img][/url] [url=https://pixhost.to/show/90/312208820_23.png][img]https://t78.pixhost.to/thumbs/90/312208820_23.png[/img][/url] [url=https://pixhost.to/show/90/312208823_24.png][img]https://t78.pixhost.to/thumbs/90/312208823_24.png[/img][/url]
  [b]More Comparisons:
  Source | c0kE
  [url=https://pixhost.to/show/88/312140035_1.png][img]https://t78.pixhost.to/thumbs/88/312140035_1.png[/img][/url] [url=https://pixhost.to/show/88/312140037_2.png][img]https://t78.pixhost.to/thumbs/88/312140037_2.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140040_3.png][img]https://t78.pixhost.to/thumbs/88/312140040_3.png[/img][/url] [url=https://pixhost.to/show/88/312140044_4.png][img]https://t78.pixhost.to/thumbs/88/312140044_4.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140047_5.png][img]https://t78.pixhost.to/thumbs/88/312140047_5.png[/img][/url] [url=https://pixhost.to/show/88/312140049_6.png][img]https://t78.pixhost.to/thumbs/88/312140049_6.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140055_7.png][img]https://t78.pixhost.to/thumbs/88/312140055_7.png[/img][/url] [url=https://pixhost.to/show/88/312140058_8.png][img]https://t78.pixhost.to/thumbs/88/312140058_8.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140063_9.png][img]https://t78.pixhost.to/thumbs/88/312140063_9.png[/img][/url] [url=https://pixhost.to/show/88/312140066_10.png][img]https://t78.pixhost.to/thumbs/88/312140066_10.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140068_11.png][img]https://t78.pixhost.to/thumbs/88/312140068_11.png[/img][/url] [url=https://pixhost.to/show/88/312140069_12.png][img]https://t78.pixhost.to/thumbs/88/312140069_12.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140071_13.png][img]https://t78.pixhost.to/thumbs/88/312140071_13.png[/img][/url] [url=https://pixhost.to/show/88/312140073_14.png][img]https://t78.pixhost.to/thumbs/88/312140073_14.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140075_15.png][img]https://t78.pixhost.to/thumbs/88/312140075_15.png[/img][/url] [url=https://pixhost.to/show/88/312140077_16.png][img]https://t78.pixhost.to/thumbs/88/312140077_16.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140079_17.png][img]https://t78.pixhost.to/thumbs/88/312140079_17.png[/img][/url] [url=https://pixhost.to/show/88/312140081_18.png][img]https://t78.pixhost.to/thumbs/88/312140081_18.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140083_19.png][img]https://t78.pixhost.to/thumbs/88/312140083_19.png[/img][/url] [url=https://pixhost.to/show/88/312140088_20.png][img]https://t78.pixhost.to/thumbs/88/312140088_20.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140089_21.png][img]https://t78.pixhost.to/thumbs/88/312140089_21.png[/img][/url] [url=https://pixhost.to/show/88/312140092_22.png][img]https://t78.pixhost.to/thumbs/88/312140092_22.png[/img][/url] 
  [url=https://pixhost.to/show/88/312140094_23.png][img]https://t78.pixhost.to/thumbs/88/312140094_23.png[/img][/url] [url=https://pixhost.to/show/88/312140098_24.png][img]https://t78.pixhost.to/thumbs/88/312140098_24.png[/img][/url]
  [/center]`,
  result: [{
    teams: ['Source', 'c0kE', 'POH'],
    numUrls: 24,
    thumbs: true,
    type: 'titled',
    length: 2808
  }, {
    teams: ['Source', 'c0kE'],
    numUrls: 24,
    thumbs: true,
    type: 'titled',
    length: 2814
  }]
}, {
  text: `Zoned Dark and Red Scenes[/quote]Source, iFT, SOIGNEUR, NTG

  [url=https://imgbox.com/k4OSkBQA][img]https://thumbs2.imgbox.com/fb/6d/k4OSkBQA_t.png[/img][/url][url=https://imgbox.com/k4OSkBQA][img]https://thumbs2.imgbox.com/fb/6d/k4OSkBQA_t.png[/img][/url]`,
  result: [{
    teams: ['Source', 'iFT', 'SOIGNEUR', 'NTG'],
    numUrls: 2,
    thumbs: true,
    type: 'titled',
    length: 224
  }]
}]
const descriptionTests = {
  [NHD]: [ {
    'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
    'output': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]',
      'output': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[quote]General \nUnique Id: blahblahblah[/quote]',
      'output': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[hide]General \nUnique Id: blahblahblah[/hide]',
      'output': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[box]General \nUnique Id: blahblahblah[/box]',
      'output': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[box=test expand]blahblahblah[/box]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[box]blahblahblah[/box]'
    }
  ],
  [GPW]: [ {
    'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
    'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[quote]General \nUnique Id: blahblahblah[/quote]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box]General \nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[hide]General \nUnique Id: blahblahblah[/hide]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[hide=test expand]blahblahblah[/hide]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[hide]blahblahblah[/hide]'
    }
  ],
  [PUTAO]: [ {
    'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
    'output': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]',
      'output': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[quote]General \nUnique Id: blahblahblah[/quote]',
      'output': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box]General \nUnique Id: blahblahblah[/box]',
      'output': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[quote=test expand]blahblahblah[/quote]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[quote]blahblahblah[/quote]'
    }
  ],
  [TTG]: [ {
    'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
    'output': '[quote]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]',
      'output': '[quote]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[quote]General \nUnique Id: blahblahblah[/quote]',
      'output': '[quote]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box]General \nUnique Id: blahblahblah[/box]',
      'output': '[quote]General \nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[b]test expand[/b]\n[quote]blahblahblah[/quote]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[quote]blahblahblah[/quote]'
    }
  ],
  [MTEAM]: [ {
    'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
    'output': '[expand]General \nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]',
      'output': '[expand]General \nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
      'output': '[expand]General \nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]',
      'output': '[expand]General \nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[expand]General \nUnique Id: blahblahblah[/expand]',
      'output': '[expand]General \nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[box=test expand]blahblahblah[/box]',
      'output': '[b]test expand[/b]\n[expand]blahblahblah[/expand]'
    }, {
      'input': '[box]blahblahblah[/box]',
      'output': '[expand]blahblahblah[/expand]'
    }
  ],
  [PTERCLUB]: [ {
      'input': '[quote=mediainfo]General \nUnique Id: blahblahblah[/quote]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box=mediainfo]General \nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[quote]General \nUnique Id: blahblahblah[/quote]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box]General \nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[hide]General \nUnique Id: blahblahblah[/hide]',
      'output': '[hide=mediainfo]General \nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box=test expand]blahblahblah[/box]',
      'output': '[hide=test expand]blahblahblah[/hide]'
    }, {
      'input': '[box]blahblahblah[/box]',
      'output': '[hide]blahblahblah[/hide]'
    }
  ],
}
const mediainfoTest = `General
Unique ID                      : 212039964144989170962682310739403163448 (0x9F856960EF662AE2AB6E54A9F9974738)
Complete name                  : At.First.Sight.1999.1080p.BluRay.DD5.1.x264-VietHD.mkv
Format                         : Matroska
Format version                 : Version 4
File size                      : 14.2 GiB
Duration                       : 2 h 8 min
Overall bit rate               : 15.8 Mb/s
Frame rate                     : 23.976 FPS
Encoded date                   : 2017-02-07 05:18:03 UTC
Writing application            : mkvmerge v9.7.1 ('Pandemonium') 64bit
Writing library                : libebml v1.3.4 + libmatroska v1.4.5

Video
ID                             : 3
Format                         : AVC
Format/Info                    : Advanced Video Codec
Format profile                 : High@L4.1
Format settings                : CABAC / 4 Ref Frames
Format settings, CABAC         : Yes
Format settings, Reference fra : 4 frames
Codec ID                       : V_MPEG4/ISO/AVC
Duration                       : 2 h 8 min
Bit rate                       : 15.2 Mb/s
Width                          : 1 914 pixels
Height                         : 1 038 pixels
Display aspect ratio           : 1.85:1
Frame rate mode                : Constant
Frame rate                     : 23.976 (24000/1001) FPS
Color space                    : YUV
Chroma subsampling             : 4:2:0
Bit depth                      : 8 bits
Scan type                      : Progressive
Bits/(Pixel*Frame)             : 0.319
Stream size                    : 13.7 GiB (96%)
Writing library                : x264 core 148 r2744kMod b97ae06
Encoding settings              : cabac=1 / ref=4 / deblock=1:-3:-3 / analyse=0x3:0x133 / me=umh / subme=10 / psy=1 / fade_compensate=0.00 / psy_rd=1.00:0.00 / mixed_ref=1 / me_range=24 / chroma_me=1 / trellis=2 / 8x8dct=1 / cqm=0 / deadzone=21,11 / fast_pskip=0 / chroma_qp_offset=-2 / threads=32 / lookahead_threads=5 / sliced_threads=0 / nr=0 / decimate=0 / interlaced=0 / bluray_compat=0 / constrained_intra=0 / bframes=8 / b_pyramid=2 / b_adapt=2 / b_bias=0 / direct=3 / weightb=1 / open_gop=0 / weightp=2 / keyint=250 / keyint_min=23 / scenecut=40 / intra_refresh=0 / rc_lookahead=60 / rc=crf / mbtree=0 / crf=16.5000 / qcomp=0.60 / qpmin=0 / qpmax=69 / qpstep=4 / vbv_maxrate=62500 / vbv_bufsize=78125 / crf_max=0.0 / nal_hrd=none / filler=0 / ip_ratio=1.30 / pb_ratio=1.20 / aq=3:0.70
Language                       : English
Default                        : Yes
Forced                         : No
Color range                    : Limited
Matrix coefficients            : BT.709

Audio
ID                             : 1
Format                         : AC-3
Format/Info                    : Audio Coding 3
Commercial name                : Dolby Digital
Codec ID                       : A_AC3
Duration                       : 2 h 8 min
Bit rate mode                  : Constant
Bit rate                       : 640 kb/s
Channel(s)                     : 6 channels
Channel layout                 : L R C LFE Ls Rs
Sampling rate                  : 48.0 kHz
Frame rate                     : 31.250 FPS (1536 SPF)
Compression mode               : Lossy
Stream size                    : 590 MiB (4%)
Language                       : English
Service kind                   : Complete Main
Default                        : Yes
Forced                         : No

Text
ID                             : 2
Format                         : UTF-8
Codec ID                       : S_TEXT/UTF8
Codec ID/Info                  : UTF-8 Plain Text
Duration                       : 2 h 2 min
Bit rate                       : 60 b/s
Frame rate                     : 0.214 FPS
Count of elements              : 1574
Stream size                    : 54.4 KiB (0%)
Language                       : English
Default                        : No
Forced                         : No

Menu
00:00:00.000                   : en:Logos/Main Titles
00:03:13.652                   : en:Tension to Tears
00:08:15.702                   : en:Amy Sees the Light
00:10:51.651                   : en:A "Sleeping" Eye Dog
00:13:03.157                   : en:A KISS TO BUILD A DREAM ON
00:13:52.206                   : en:Canceled Apologies
00:15:20.420                   : en:"What's Out There?"
00:18:58.513                   : en:Rhythm of the Rain
00:21:51.186                   : en:Heavenly Memories
00:25:24.149                   : en:Scorched Date
00:26:17.493                   : en:Second-Chance Guy
00:28:48.894                   : en:A Search for Insight
00:30:52.060                   : en:Cold/Hot Kisses
00:35:23.079                   : en:No Changes, Please!
00:37:59.152                   : en:"Some Great News"
00:40:23.713                   : en:There Are No Miracles
00:42:10.487                   : en:Stomping Like Bigfoot
00:44:19.324                   : en:A Restless Night
00:45:14.464                   : en:THEY CAN'T TAKE THAT AWAY FROM ME
00:46:54.394                   : en:Cataract Interaction
00:47:58.251                   : en:Cool Kid
00:48:21.399                   : en:Obstacles/Art/Plans
00:51:14.446                   : en:Surgery &amp; Bad Coffee
00:52:44.453                   : en:"Can" This Be Sight?
00:58:14.281                   : en:"So This Is You?"
01:01:45.618                   : en:Covering Up Holes
01:03:01.652                   : en:A Beautiful Surprise
01:06:33.072                   : en:No Manual for Limbo
01:10:23.928                   : en:Mixed Media
01:14:09.528                   : en:Sculptured Talk
01:15:52.547                   : en:Reconstructing Dad
01:17:10.959                   : en:Crashing a Party
01:25:06.268                   : en:Happy-Hour Therapy
01:28:41.608                   : en:EASY COME EASY GO
01:31:56.511                   : en:Park Perspectives
01:35:47.116                   : en:Flirting with Colors
01:38:41.457                   : en:The Light Grows Dim
01:42:17.673                   : en:A Father Fails
01:44:33.809                   : en:A Seeing Celebration
01:46:14.118                   : en:A Cloudy Hockey Game
01:51:08.871                   : en:Broken Dreams
01:54:17.732                   : en:Reaching Back Home
01:58:31.812                   : en:Seeing the Horizon
02:04:10.944                   : en:LOVE IS WHERE YOU ARE/End Credits`

test ('test mediainfo conversion', () => {
  const mediainfo = string2Mediainfo(mediainfoTest)
  expect(Object.entries(mediainfo.General).length > 0)
  const mediainfoStr = mediainfo2String(mediainfo)
  expect(mediainfoStr.trim()).toBe(mediainfoTest.trim())
})
test ('test processDescription', () => {
  Object.entries(descriptionTests).forEach(([siteName, tests]) => {
    tests.forEach(test => {
      const input = test.input
      const expectedOutput = test.output
      const actualOutput = processDescription(siteName, input)
      if (actualOutput !== expectedOutput) {
        console.log(`Error happens in\nsite: ${siteName}\ninput: ${input}`)
      }
      expect(actualOutput).toBe(expectedOutput)
    })
  })
})
test('test simple screenshots conversion', () => {
  simpleScreenshotsTests.forEach(test => {
    const result = collectComparisons(test.text)
    expect(result.length).toBe(test.result.length)
    if (result.length === test.result.length) {
      for (const i in result) {
        const output = result[i]
        const input = test.result[i]
        expect(output.urls.length).toBe(input.numUrls)
        expect(output.regexType).toBe(input.type)
        expect(output.thumbs).toBe(input.thumbs)
        expect(JSON.stringify(output.teams)).toBe(JSON.stringify(input.teams))
        let outputLength = output.text.trim().length
        expect(outputLength).toBe(input.length)
      }
    }
  })
})
test('test whole screenshots conversion', async () => {
  const dirOutput = './test files/output'
  // remove existing outputs
  fs.readdir(dirOutput, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(dirOutput, file), (err) => {
        if (err) throw err;
      });
    }
  });
  const inputs = await glob.glob('./test files/input/*.bbcode')
  const targetSites = [NHD, GPW]
  for (const input of inputs) {
    const [movieName, originalSite] = path.basename(input).split('.')
    try {
      let data = fs.readFileSync(input, 'utf8')
      for (const targetSite of targetSites) {
        data = processDescription(targetSite, data)
        const description = await generateComparison(targetSite, data, '', {})
        const output = `${dirOutput}/${movieName}.${targetSite} from ${originalSite}.bbcode`
        if (description) {
          fs.writeFileSync(output, description)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}, 30000)
