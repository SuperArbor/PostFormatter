// module imports
const {
  collectComparisons, decomposeDescription, processDescription, mediainfo2String, string2Mediainfo, processTags, getTeamSplitterCombinations,
  NHD, GPW, PUTAO, TTG, PTERCLUB, MTEAM, UHD} = require('./PostFormatter')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { fail } = require('assert')

const simpleScreenshotsTests = [{
  text: `.org/details.php?id=148204&source=details-related[/quote][quote=Source, EbP, NTb (different source)][url=https://pixhost.to/show/320/411481872_999906.png][img]https://t91.pixhost.to/thumbs/320/411481872_999906.png[/img][/url] [url=https://pixhost.to/show/320/411481874_46oz77.png][img]https://t91.pixhost.to/thumbs/320/411481874_46oz77.png[/img][/url] [url=https://pixhost.to/show/320/411481876_u4061m.png][img]https://t91.pixhost.to/thumbs/320/411481876_u4061m.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481878_oea9as.png][img]https://t91.pixhost.to/thumbs/320/411481878_oea9as.png[/img][/url] [url=https://pixhost.to/show/320/411481883_297v98.png][img]https://t91.pixhost.to/thumbs/320/411481883_297v98.png[/img][/url] [url=https://pixhost.to/show/320/411481888_d12398.png][img]https://t91.pixhost.to/thumbs/320/411481888_d12398.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481893_m50sc6.png][img]https://t91.pixhost.to/thumbs/320/411481893_m50sc6.png[/img][/url] [url=https://pixhost.to/show/320/411481896_t02dhl.png][img]https://t91.pixhost.to/thumbs/320/411481896_t02dhl.png[/img][/url] [url=https://pixhost.to/show/320/411481899_tq032o.png][img]https://t91.pixhost.to/thumbs/320/411481899_tq032o.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481900_5o7131.png][img]https://t91.pixhost.to/thumbs/320/411481900_5o7131.png[/img][/url] [url=https://pixhost.to/show/320/411481901_xxwxmk.png][img]https://t91.pixhost.to/thumbs/320/411481901_xxwxmk.png[/img][/url] [url=https://pixhost.to/show/320/411481904_yx1s17.png][img]https://t91.pixhost.to/thumbs/320/411481904_yx1s17.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481908_b714hm.png][img]https://t91.pixhost.to/thumbs/320/411481908_b714hm.png[/img][/url] [url=https://pixhost.to/show/320/411481912_8p67ox.png][img]https://t91.pixhost.to/thumbs/320/411481912_8p67ox.png[/img][/url] [url=https://pixhost.to/show/320/411481918_r78rs0.png][img]https://t91.pixhost.to/thumbs/320/411481918_r78rs0.png[/img][/url][/quote]`,
  result: [{
    teams: ['Source', 'EbP', 'NTb (different source)'],
    numUrls: 15,
    urlType: 'thumbsBbCode',
    containerStyle: 'boxed',
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
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
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
    urlType: 'images',
    containerStyle: 'comparison',
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
    urlType: 'thumbsBbCode',
    containerStyle: 'boxed',
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
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
    length: 2808
  }, {
    teams: ['Source', 'c0kE'],
    numUrls: 24,
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
    length: 2814
  }]
}, {
  text: `Zoned Dark and Red Scenes[/quote]Source, iFT, SOIGNEUR, NTG

  [url=https://imgbox.com/k4OSkBQA][img]https://thumbs2.imgbox.com/fb/6d/k4OSkBQA_t.png[/img][/url][url=https://imgbox.com/k4OSkBQA][img]https://thumbs2.imgbox.com/fb/6d/k4OSkBQA_t.png[/img][/url]`,
  result: [{
    teams: ['Source', 'iFT', 'SOIGNEUR', 'NTG'],
    numUrls: 2,
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
    length: 224
  }]
}, {
  text: `[box=Source vs SA89 vs D-Z0N3]
  [url=http://imgbox.com/nuev0hIZ][img]https://thumbs2.imgbox.com/9e/31/nuev0hIZ_t.png[/img][/url] [url=http://imgbox.com/dUkK8F8I][img]https://thumbs2.imgbox.com/d7/82/dUkK8F8I_t.png[/img][/url] [url=http://imgbox.com/Pv21A211][img]https://thumbs2.imgbox.com/8e/2b/Pv21A211_t.png[/img][/url] [url=http://imgbox.com/6QnVQZwF][img]https://thumbs2.imgbox.com/5f/d0/6QnVQZwF_t.png[/img][/url] [url=http://imgbox.com/DxmxAOm2][img]https://thumbs2.imgbox.com/c7/cc/DxmxAOm2_t.png[/img][/url] [url=http://imgbox.com/zLSPYX4g][img]https://thumbs2.imgbox.com/e1/f1/zLSPYX4g_t.png[/img][/url] [url=http://imgbox.com/Z0t95QEJ][img]https://thumbs2.imgbox.com/66/ca/Z0t95QEJ_t.png[/img][/url] [url=http://imgbox.com/01xFPk8U][img]https://thumbs2.imgbox.com/0a/1f/01xFPk8U_t.png[/img][/url] [url=http://imgbox.com/NCOpuwsc][img]https://thumbs2.imgbox.com/f1/2e/NCOpuwsc_t.png[/img][/url] [url=http://imgbox.com/SWvUtub8][img]https://thumbs2.imgbox.com/63/8d/SWvUtub8_t.png[/img][/url] [url=http://imgbox.com/TyQeel8Z][img]https://thumbs2.imgbox.com/59/1d/TyQeel8Z_t.png[/img][/url] [url=http://imgbox.com/tDOzetUt][img]https://thumbs2.imgbox.com/f5/7c/tDOzetUt_t.png[/img][/url] [url=http://imgbox.com/Ne3LyAS2][img]https://thumbs2.imgbox.com/a9/c7/Ne3LyAS2_t.png[/img][/url] [url=http://imgbox.com/vkWmPlNR][img]https://thumbs2.imgbox.com/77/ee/vkWmPlNR_t.png[/img][/url] [url=http://imgbox.com/swffa2aQ][img]https://thumbs2.imgbox.com/11/96/swffa2aQ_t.png[/img][/url][/box]`,
  result: [{
    teams: ['Source', 'SA89', 'D-Z0N3'],
    numUrls: 15,
    urlType: 'thumbsBbCode',
    containerStyle: 'boxed',
    length: 1493
  }]
}, {
  text: `encoded 226105 frames, 25.28 fps, 11046.58 kb/s, 12419 MB[/code]

  [b][u]Source Compare[/u][/b]
  
  USA BD | Hybrid(Merged) Source | AMZN WEB-DL(Resized)
  [url=https://pixhost.to/show/674/444102172_x7l819.png][img]https://t92.pixhost.to/thumbs/674/444102172_x7l819.png[/img][/url] [url=https://pixhost.to/show/674/444102192_8v89r5.png][img]https://t92.pixhost.to/thumbs/674/444102192_8v89r5.png[/img][/url] [url=https://pixhost.to/show/674/444102198_to9mr9.png][img]https://t92.pixhost.to/thumbs/674/444102198_to9mr9.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102205_h6yj9p.png][img]https://t92.pixhost.to/thumbs/674/444102205_h6yj9p.png[/img][/url] [url=https://pixhost.to/show/674/444102209_61fyr7.png][img]https://t92.pixhost.to/thumbs/674/444102209_61fyr7.png[/img][/url] [url=https://pixhost.to/show/674/444102213_g004wa.png][img]https://t92.pixhost.to/thumbs/674/444102213_g004wa.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102214_81s2fz.png][img]https://t92.pixhost.to/thumbs/674/444102214_81s2fz.png[/img][/url] [url=https://pixhost.to/show/674/444102216_19w170.png][img]https://t92.pixhost.to/thumbs/674/444102216_19w170.png[/img][/url] [url=https://pixhost.to/show/674/444102219_4mlzx2.png][img]https://t92.pixhost.to/thumbs/674/444102219_4mlzx2.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102221_y61106.png][img]https://t92.pixhost.to/thumbs/674/444102221_y61106.png[/img][/url] [url=https://pixhost.to/show/674/444102226_x5cd4j.png][img]https://t92.pixhost.to/thumbs/674/444102226_x5cd4j.png[/img][/url] [url=https://pixhost.to/show/674/444102228_o0esan.png][img]https://t92.pixhost.to/thumbs/674/444102228_o0esan.png[/img][/url]
  [url=https://pixhost.to/show/674/444102231_0a9lh6.png][img]https://t92.pixhost.to/thumbs/674/444102231_0a9lh6.png[/img][/url] [url=https://pixhost.to/show/674/444102233_du5e3p.png][img]https://t92.pixhost.to/thumbs/674/444102233_du5e3p.png[/img][/url] [url=https://pixhost.to/show/674/444102236_07835j.png][img]https://t92.pixhost.to/thumbs/674/444102236_07835j.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102239_mz47i1.png][img]https://t92.pixhost.to/thumbs/674/444102239_mz47i1.png[/img][/url] [url=https://pixhost.to/show/674/444102241_hn0n4m.png][img]https://t92.pixhost.to/thumbs/674/444102241_hn0n4m.png[/img][/url] [url=https://pixhost.to/show/674/444102243_o9k5s3.png][img]https://t92.pixhost.to/thumbs/674/444102243_o9k5s3.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102245_82m0u7.png][img]https://t92.pixhost.to/thumbs/674/444102245_82m0u7.png[/img][/url] [url=https://pixhost.to/show/674/444102246_d0y5ed.png][img]https://t92.pixhost.to/thumbs/674/444102246_d0y5ed.png[/img][/url] [url=https://pixhost.to/show/674/444102248_8zh2pv.png][img]https://t92.pixhost.to/thumbs/674/444102248_8zh2pv.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102249_6d258k.png][img]https://t92.pixhost.to/thumbs/674/444102249_6d258k.png[/img][/url] [url=https://pixhost.to/show/674/444102251_x4s5hr.png][img]https://t92.pixhost.to/thumbs/674/444102251_x4s5hr.png[/img][/url] [url=https://pixhost.to/show/674/444102252_2fz31g.png][img]https://t92.pixhost.to/thumbs/674/444102252_2fz31g.png[/img][/url]
  [url=https://pixhost.to/show/674/444102255_6xu8pt.png][img]https://t92.pixhost.to/thumbs/674/444102255_6xu8pt.png[/img][/url] [url=https://pixhost.to/show/674/444102256_v033fm.png][img]https://t92.pixhost.to/thumbs/674/444102256_v033fm.png[/img][/url] [url=https://pixhost.to/show/674/444102259_f5dt1k.png][img]https://t92.pixhost.to/thumbs/674/444102259_f5dt1k.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102260_va9q57.png][img]https://t92.pixhost.to/thumbs/674/444102260_va9q57.png[/img][/url] [url=https://pixhost.to/show/674/444102262_78n84s.png][img]https://t92.pixhost.to/thumbs/674/444102262_78n84s.png[/img][/url] [url=https://pixhost.to/show/674/444102264_h5quj1.png][img]https://t92.pixhost.to/thumbs/674/444102264_h5quj1.png[/img][/url] 
  [url=https://pixhost.to/show/674/444102266_8k9mcu.png][img]https://t92.pixhost.to/thumbs/674/444102266_8k9mcu.png[/img][/url] [url=https://pixhost.to/show/674/444102267_xy8y3c.png][img]https://t92.pixhost.to/thumbs/674/444102267_xy8y3c.png[/img][/url] [url=https://pixhost.to/show/674/444102268_129h2k.png][img]https://t92.pixhost.to/thumbs/674/444102268_129h2k.png[/img][/url]
  
  [b][u]Deband Compare[/u][/b]
  
  USA BD | Filtered Source | eXterminator | HiDt
  [url=https://pixhost.to/show/673/444101825_u9r8q8.png][img]https://t92.pixhost.to/thumbs/673/444101825_u9r8q8.png[/img][/url] [url=https://pixhost.to/show/673/444101826_pr92h7.png][img]https://t92.pixhost.to/thumbs/673/444101826_pr92h7.png[/img][/url] [url=https://pixhost.to/show/673/444101827_9xqe58.png][img]https://t92.pixhost.to/thumbs/673/444101827_9xqe58.png[/img][/url] [url=https://pixhost.to/show/673/444101828_2jwd17.png][img]https://t92.pixhost.to/thumbs/673/444101828_2jwd17.png[/img][/url]
  [url=https://pixhost.to/show/673/444101829_yzzjhs.png][img]https://t92.pixhost.to/thumbs/673/444101829_yzzjhs.png[/img][/url] [url=https://pixhost.to/show/673/444101831_m40i49.png][img]https://t92.pixhost.to/thumbs/673/444101831_m40i49.png[/img][/url] [url=https://pixhost.to/show/673/444101834_03p2b8.png][img]https://t92.pixhost.to/thumbs/673/444101834_03p2b8.png[/img][/url] [url=https://pixhost.to/show/673/444101836_0jl859.png][img]https://t92.pixhost.to/thumbs/673/444101836_0jl859.png[/img][/url]
  [url=https://pixhost.to/show/673/444101837_h7o785.png][img]https://t92.pixhost.to/thumbs/673/444101837_h7o785.png[/img][/url] [url=https://pixhost.to/show/673/444101839_999fh2.png][img]https://t92.pixhost.to/thumbs/673/444101839_999fh2.png[/img][/url] [url=https://pixhost.to/show/673/444101841_2nbyct.png][img]https://t92.pixhost.to/thumbs/673/444101841_2nbyct.png[/img][/url] [url=https://pixhost.to/show/673/444101842_r216yr.png][img]https://t92.pixhost.to/thumbs/673/444101842_r216yr.png[/img][/url]
  [url=https://pixhost.to/show/673/444101843_c2hpjy.png][img]https://t92.pixhost.to/thumbs/673/444101843_c2hpjy.png[/img][/url] [url=https://pixhost.to/show/673/444101845_sa1387.png][img]https://t92.pixhost.to/thumbs/673/444101845_sa1387.png[/img][/url] [url=https://pixhost.to/show/673/444101857_m2zqt2.png][img]https://t92.pixhost.to/thumbs/673/444101857_m2zqt2.png[/img][/url] [url=https://pixhost.to/show/673/444101858_x35o33.png][img]https://t92.pixhost.to/thumbs/673/444101858_x35o33.png[/img][/url]
  
  [b][u]Screenshot Compare[/u][/b]
  
  USA BD | Hybrid(Merged) Source | eXterminator | HiDt | AMZN 4K(Resized)
  [url=https://pixhost.to/show/674/444102407_n5y8zl.png][img]https://t92.pixhost.to/thumbs/674/444102407_n5y8zl.png[/img][/url] [url=https://pixhost.to/show/674/444102408_998u37.png][img]https://t92.pixhost.to/thumbs/674/444102408_998u37.png[/img][/url] [url=https://pixhost.to/show/674/444102409_93p545.png][img]https://t92.pixhost.to/thumbs/674/444102409_93p545.png[/img][/url] [url=https://pixhost.to/show/674/444102410_r53r40.png][img]https://t92.pixhost.to/thumbs/674/444102410_r53r40.png[/img][/url] [url=https://pixhost.to/show/674/444102412_tzo6b7.png][img]https://t92.pixhost.to/thumbs/674/444102412_tzo6b7.png[/img][/url]
  [url=https://pixhost.to/show/674/444102414_4526er.png][img]https://t92.pixhost.to/thumbs/674/444102414_4526er.png[/img][/url] [url=https://pixhost.to/show/674/444102417_3e7l5y.png][img]https://t92.pixhost.to/thumbs/674/444102417_3e7l5y.png[/img][/url] [url=https://pixhost.to/show/674/444102418_wri2t0.png][img]https://t92.pixhost.to/thumbs/674/444102418_wri2t0.png[/img][/url] [url=https://pixhost.to/show/674/444102419_28b6e3.png][img]https://t92.pixhost.to/thumbs/674/444102419_28b6e3.png[/img][/url] [url=https://pixhost.to/show/674/444102420_kwc6y6.png][img]https://t92.pixhost.to/thumbs/674/444102420_kwc6y6.png[/img][/url]
  [url=https://pixhost.to/show/674/444102421_zyxvi8.png][img]https://t92.pixhost.to/thumbs/674/444102421_zyxvi8.png[/img][/url] [url=https://pixhost.to/show/674/444102422_c39aib.png][img]https://t92.pixhost.to/thumbs/674/444102422_c39aib.png[/img][/url] [url=https://pixhost.to/show/674/444102424_uy4071.png][img]https://t92.pixhost.to/thumbs/674/444102424_uy4071.png[/img][/url] [url=https://pixhost.to/show/674/444102425_dne9w5.png][img]https://t92.pixhost.to/thumbs/674/444102425_dne9w5.png[/img][/url] [url=https://pixhost.to/show/674/444102426_x1781f.png][img]https://t92.pixhost.to/thumbs/674/444102426_x1781f.png[/img][/url]
  [url=https://pixhost.to/show/674/444102428_g15v5h.png][img]https://t92.pixhost.to/thumbs/674/444102428_g15v5h.png[/img][/url] [url=https://pixhost.to/show/674/444102431_jwc1yt.png][img]https://t92.pixhost.to/thumbs/674/444102431_jwc1yt.png[/img][/url] [url=https://pixhost.to/show/674/444102432_535ft5.png][img]https://t92.pixhost.to/thumbs/674/444102432_535ft5.png[/img][/url] [url=https://pixhost.to/show/674/444102433_56476f.png][img]https://t92.pixhost.to/thumbs/674/444102433_56476f.png[/img][/url] [url=https://pixhost.to/show/674/444102435_n1syi8.png][img]https://t92.pixhost.to/thumbs/674/444102435_n1syi8.png[/img][/url]
  [url=https://pixhost.to/show/674/444102436_13241e.png][img]https://t92.pixhost.to/thumbs/674/444102436_13241e.png[/img][/url] [url=https://pixhost.to/show/674/444102437_5511s5.png][img]https://t92.pixhost.to/thumbs/674/444102437_5511s5.png[/img][/url] [url=https://pixhost.to/show/674/444102438_sb457t.png][img]https://t92.pixhost.to/thumbs/674/444102438_sb457t.png[/img][/url] [url=https://pixhost.to/show/674/444102440_h2y066.png][img]https://t92.pixhost.to/thumbs/674/444102440_h2y066.png[/img][/url] [url=https://pixhost.to/show/674/444102442_k80n2k.png][img]https://t92.pixhost.to/thumbs/674/444102442_k80n2k.png[/img][/url]
  [url=https://pixhost.to/show/674/444102443_0l37z0.png][img]https://t92.pixhost.to/thumbs/674/444102443_0l37z0.png[/img][/url] [url=https://pixhost.to/show/674/444102444_9l83wg.png][img]https://t92.pixhost.to/thumbs/674/444102444_9l83wg.png[/img][/url] [url=https://pixhost.to/show/674/444102445_7ye5u5.png][img]https://t92.pixhost.to/thumbs/674/444102445_7ye5u5.png[/img][/url] [url=https://pixhost.to/show/674/444102446_do01sh.png][img]https://t92.pixhost.to/thumbs/674/444102446_do01sh.png[/img][/url] [url=https://pixhost.to/show/674/444102447_82zisu.png][img]https://t92.pixhost.to/thumbs/674/444102447_82zisu.png[/img][/url]
  [url=https://pixhost.to/show/674/444102448_j562so.png][img]https://t92.pixhost.to/thumbs/674/444102448_j562so.png[/img][/url] [url=https://pixhost.to/show/674/444102449_1pi2v5.png][img]https://t92.pixhost.to/thumbs/674/444102449_1pi2v5.png[/img][/url] [url=https://pixhost.to/show/674/444102451_4sld87.png][img]https://t92.pixhost.to/thumbs/674/444102451_4sld87.png[/img][/url] [url=https://pixhost.to/show/674/444102453_5z23e7.png][img]https://t92.pixhost.to/thumbs/674/444102453_5z23e7.png[/img][/url] [url=https://pixhost.to/show/674/444102454_49aw8b.png][img]https://t92.pixhost.to/thumbs/674/444102454_49aw8b.png[/img][/url]`,
  result: [{
    teams: ['USA BD', 'Hybrid(Merged) Source', 'AMZN WEB-DL(Resized)'],
    numUrls: 33,
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
    length: 4241
  }, {
    teams: ['USA BD', 'Filtered Source', 'eXterminator', 'HiDt'],
    numUrls: 16,
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
    length: 2070
  }, {
    teams: ['USA BD', 'Hybrid(Merged) Source', 'eXterminator', 'HiDt', 'AMZN 4K(Resized)'],
    numUrls: 35,
    urlType: 'thumbsBbCode',
    containerStyle: 'titled',
    length: 4495
  }]
}]
const descriptionTests = {
  [NHD]: [ {
    'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
    'output': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]',
      'output': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[quote]General\nUnique Id: blahblahblah[/quote]',
      'output': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[hide]General\nUnique Id: blahblahblah[/hide]',
      'output': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[box]General\nUnique Id: blahblahblah[/box]',
      'output': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[box=test expand]blahblahblah[/box]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[box]blahblahblah[/box]'
    }
  ],
  [PUTAO]: [ {
    'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
    'output': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]',
      'output': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[quote]General\nUnique Id: blahblahblah[/quote]',
      'output': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box]General\nUnique Id: blahblahblah[/box]',
      'output': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[quote=test expand]blahblahblah[/quote]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[quote]blahblahblah[/quote]'
    }
  ],
  [TTG]: [ {
    'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
    'output': '[quote]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]',
      'output': '[quote]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[quote]General\nUnique Id: blahblahblah[/quote]',
      'output': '[quote]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[box]General\nUnique Id: blahblahblah[/box]',
      'output': '[quote]General\nUnique Id: blahblahblah[/quote]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand]',
      'output': '[b]test expand[/b]\n[quote]blahblahblah[/quote]'
    }, {
      'input': '[expand]blahblahblah[/expand]',
      'output': '[quote]blahblahblah[/quote]'
    }
  ],
  [MTEAM]: [ {
    'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
    'output': '[expand]General\nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]',
      'output': '[expand]General\nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
      'output': '[expand]General\nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]',
      'output': '[expand]General\nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[expand]General\nUnique Id: blahblahblah[/expand]',
      'output': '[expand]General\nUnique Id: blahblahblah[/expand]'
    }, {
      'input': '[box=test expand]blahblahblah[/box]',
      'output': '[b]test expand[/b]\n[expand]blahblahblah[/expand]'
    }, {
      'input': '[box]blahblahblah[/box]',
      'output': '[expand]blahblahblah[/expand]'
    }
  ],
  [PTERCLUB]: [ {
      'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box=mediainfo]General\nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[quote]General\nUnique Id: blahblahblah[/quote]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box]General\nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[hide]General\nUnique Id: blahblahblah[/hide]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box=test expand]blahblahblah[/box]',
      'output': '[hide=test expand]blahblahblah[/hide]'
    }, {
      'input': '[box]blahblahblah[/box]',
      'output': '[hide]blahblahblah[/hide]'
    },
  ],
  [GPW]: [ {
    'input': '[quote=mediainfo]General\nUnique Id: blahblahblah[/quote][quote=mediainfo]General\nUnique Id: blahblahblah[/quote]',
    'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]\n[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box=mediainfo]General\nUnique Id: blahblahblah[/box][box=mediainfo]General\nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]\n[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[quote]General\nUnique Id: blahblahblah[/quote][quote]General\nUnique Id: blahblahblah[/quote]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]\n[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[box]General\nUnique Id: blahblahblah[/box][box]General\nUnique Id: blahblahblah[/box]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]\n[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[hide]General\nUnique Id: blahblahblah[/hide][hide]General\nUnique Id: blahblahblah[/hide]',
      'output': '[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]\n[hide=mediainfo]General\nUnique Id: blahblahblah[/hide]'
    }, {
      'input': '[expand=test expand]blahblahblah[/expand][expand=test expand]blahblahblah[/expand]',
      'output': '[hide=test expand]blahblahblah[/hide]\n[hide=test expand]blahblahblah[/hide]'
    }, {
      'input': '[expand]blahblahblah[/expand][expand]blahblahblah[/expand]',
      'output': '[hide]blahblahblah[/hide]\n[hide]blahblahblah[/hide]'
    }
  ]
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
const processTagsTests = [{
    input: {
      tag: 'quote',
      inputText: `quote]A0[quote=A0]A0B0[quote]B0C0[quote=C0]C0[/quote]C0B0[/quote]B0B1[quote=B1]B1B0[/quote]B0A0[/quote]Level 0 Text[quote=A0]A0[/quote]Level 0 Text`,
    },
    output: {
      keepNonQuoted: [
        `quote]A0[b]A0[/b][quote]A0B0[quote]B0C0[b]C0[/b][quote]C0[/quote]C0B0[/quote]B0B1[b]B1[/b][quote]B1B0[/quote]B0A0[/quote]Level 0 Text[b]A0[/b][quote]A0[/quote]Level 0 Text`,
        ``
      ],
      noNonQuoted: [
        `[b]A0[/b][quote]A0B0[quote]B0C0[b]C0[/b][quote]C0[/quote]C0B0[/quote]B0B1[b]B1[/b][quote]B1B0[/quote]B0A0[/quote][b]A0[/b][quote]A0[/quote]`,
        `quote]A0Level 0 TextLevel 0 Text`
      ]
    }
  }, {
    input: {
      tag: 'quote',
      inputText: `A0[/quote][quote=A0]A0B0[quote]B0C0[quote=C0]C0[/quote]C0B0[/quote]B0B1[quote=B1]B1B0[/quote]B0A0[/quote]Level 0 Text[quote=A0]A0[/quote]Level 0 Text`,
    },
    output: {
      keepNonQuoted: [
        `[b]A0[/b][quote]A0B0[quote]B0C0[b]C0[/b][quote]C0[/quote]C0B0[/quote]B0B1[b]B1[/b][quote]B1B0[/quote]B0A0[/quote]Level 0 Text[b]A0[/b][quote]A0[/quote]Level 0 Text`,
        `A0[/quote]`
      ],
      noNonQuoted: [
        `[b]A0[/b][quote]A0B0[quote]B0C0[b]C0[/b][quote]C0[/quote]C0B0[/quote]B0B1[b]B1[/b][quote]B1B0[/quote]B0A0[/quote][b]A0[/b][quote]A0[/quote]`,
        `A0[/quote]Level 0 TextLevel 0 Text`
      ]
    }
  }
]
const teamSplitterTests = [{
  teams: ['D-Z0N3', 'WEB-DL'],
  splitters: ['-'],
  patterns: ['(?<=D)-(?!Z0N3)', '(?<!D)-(?=Z0N3)', '(?<=WEB)-(?!DL)', '(?<!WEB)-(?=DL)', '(?<!D|WEB)-(?!Z0N3|DL)']
}, {
  teams: ['D-Z0N3,Z0N4', 'WEB-DL'],
  splitters: ['-', ','],
  patterns: [
    '(?<=D)-(?!Z0N3,Z0N4)', '(?<!D)-(?=Z0N3,Z0N4)', '(?<=WEB)-(?!DL)', '(?<!WEB)-(?=DL)', '(?<!D|WEB)-(?!Z0N3,Z0N4|DL)',
    '(?<=D-Z0N3),(?!Z0N4)', '(?<!D-Z0N3),(?=Z0N4)', '(?<!D-Z0N3),(?!Z0N4)'
  ]
}]

test ('test tags', () => {
  processTagsTests.forEach(test => {
    const input = test.input
    const output = test.output
    const actualOutputKeepNoneQuoted = processTags(input.inputText, input.tag, 
      matchLeft => { return matchLeft.replace(/\[quote=([^\]]+)\]/g, '[b]$1[/b][quote]') },
      matchRight => { return matchRight }, true)
    const actualOutputNoNoneQuoted = processTags(input.inputText, input.tag, 
      matchLeft => { return matchLeft.replace(/\[quote=([^\]]+)\]/g, '[b]$1[/b][quote]') },
      matchRight => { return matchRight }, false)
    expect(JSON.stringify(actualOutputKeepNoneQuoted)).toBe(JSON.stringify(output.keepNonQuoted))
    expect(JSON.stringify(actualOutputNoNoneQuoted)).toBe(JSON.stringify(output.noNonQuoted))
  })
})
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
    if (result.length !== test.result.length) {
      console.log(`expected result length ${test.result.length}, actual length ${result.length}`)
    }
    expect(result.length).toBe(test.result.length)
    if (result.length === test.result.length) {
      for (const i in result) {
        const output = result[i]
        const expected = test.result[i]
        if (output.urls.length !== expected.numUrls) {
          console.log(`expected urls ${expected.numUrls}, actual urls ${output.urls.length}`)
        }
        if (output.urls.length !== expected.numUrls) {
          console.log(`expected urls ${expected.numUrls}, actual urls ${output.urls.length}`)
        }
        expect(output.urls.length).toBe(expected.numUrls)
        expect(output.containerStyle).toBe(expected.containerStyle)
        if (output.urlType !== expected.urlType) {
          console.log(`expected urlType ${expected.urlType}, actual urlType ${output.urlType}`)
        }
        expect(output.urlType).toBe(expected.urlType)
        if (JSON.stringify(output.teams) !== JSON.stringify(expected.teams)) {
          console.log(`expected teams ${expected.teams}, actual teams ${output.teams}`)
        }
        expect(JSON.stringify(output.teams)).toBe(JSON.stringify(expected.teams))
        let outputLength = output.text.trim().length
        if (outputLength !== expected.length) {
          console.log(`expected length ${expected.length}, actual length ${outputLength}`)
        }
        expect(outputLength).toBe(expected.length)
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
  const pathsinput = await glob.glob('./test files/input/*.bbcode')
  const targetSites = [NHD, GPW, UHD]
  for (const pathInput of pathsinput) {
    const [movieName, originalSite] = path.basename(pathInput).split('.')
    try {
      let input = fs.readFileSync(pathInput, 'utf8')
      for (const targetSite of targetSites) {
        input = processDescription(targetSite, input)
        // let comparisonsInput = collectComparisons(input)
        let [output] = await decomposeDescription(targetSite, input, '')
        output = processDescription(targetSite, output)
        // let comparisonsOutput = collectComparisons(output)
        // expect(comparisonsOutput.length).toBe(comparisonsInput.length)
        const pathOutput = `${dirOutput}/${movieName}.${targetSite} from ${originalSite}.bbcode`
        if (output) {
          fs.writeFileSync(pathOutput, output)
        }
      }
    } catch (err) {
      fail(err)
    }
  }
}, 30000)
test('test teamSplitter regex', () => {
  for (let test of teamSplitterTests) {
    let teams = test.teams
    let splitters = test.splitters
    let expectedOutput = test.patterns
    let actualOutput = getTeamSplitterCombinations(teams, splitters)[1]
    expect(JSON.stringify(expectedOutput)).toBe(JSON.stringify(actualOutput))
  }
})