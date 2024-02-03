// module imports
const {
  collectComparisons, generateComparison, processDescription,
  NHD, GPW} = require('./PostFormatter')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const testsSimple = [{
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
test('test simple screenshots conversion', () => {
  testsSimple.forEach(test => {
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
