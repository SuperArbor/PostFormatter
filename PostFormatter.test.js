const { collectComparisons } = require('./PostFormatter')
const tests = [{
  text: `.org/details.php?id=148204&source=details-related[/quote][quote=Source, EbP, NTb (different source)][url=https://pixhost.to/show/320/411481872_999906.png][img]https://t91.pixhost.to/thumbs/320/411481872_999906.png[/img][/url] [url=https://pixhost.to/show/320/411481874_46oz77.png][img]https://t91.pixhost.to/thumbs/320/411481874_46oz77.png[/img][/url] [url=https://pixhost.to/show/320/411481876_u4061m.png][img]https://t91.pixhost.to/thumbs/320/411481876_u4061m.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481878_oea9as.png][img]https://t91.pixhost.to/thumbs/320/411481878_oea9as.png[/img][/url] [url=https://pixhost.to/show/320/411481883_297v98.png][img]https://t91.pixhost.to/thumbs/320/411481883_297v98.png[/img][/url] [url=https://pixhost.to/show/320/411481888_d12398.png][img]https://t91.pixhost.to/thumbs/320/411481888_d12398.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481893_m50sc6.png][img]https://t91.pixhost.to/thumbs/320/411481893_m50sc6.png[/img][/url] [url=https://pixhost.to/show/320/411481896_t02dhl.png][img]https://t91.pixhost.to/thumbs/320/411481896_t02dhl.png[/img][/url] [url=https://pixhost.to/show/320/411481899_tq032o.png][img]https://t91.pixhost.to/thumbs/320/411481899_tq032o.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481900_5o7131.png][img]https://t91.pixhost.to/thumbs/320/411481900_5o7131.png[/img][/url] [url=https://pixhost.to/show/320/411481901_xxwxmk.png][img]https://t91.pixhost.to/thumbs/320/411481901_xxwxmk.png[/img][/url] [url=https://pixhost.to/show/320/411481904_yx1s17.png][img]https://t91.pixhost.to/thumbs/320/411481904_yx1s17.png[/img][/url] 
  [url=https://pixhost.to/show/320/411481908_b714hm.png][img]https://t91.pixhost.to/thumbs/320/411481908_b714hm.png[/img][/url] [url=https://pixhost.to/show/320/411481912_8p67ox.png][img]https://t91.pixhost.to/thumbs/320/411481912_8p67ox.png[/img][/url] [url=https://pixhost.to/show/320/411481918_r78rs0.png][img]https://t91.pixhost.to/thumbs/320/411481918_r78rs0.png[/img][/url][/quote]`,
  teams: ['Source', 'EbP', 'NTb (different source)'],
  numUrls: 15,
  thumbs: true,
  type: 'boxed'
}, {
  text: `Source | Filtered | c0kE | PTER | HANDJOB
  [url=https://pixhost.to/show/395/440442913_rzj9id36_o.png][img]https://t93.pixhost.to/thumbs/395/440442913_rzj9id36_o.png[/img][/url] [url=https://pixhost.to/show/395/440442915_lpstfsy0_o.png][img]https://t93.pixhost.to/thumbs/395/440442915_lpstfsy0_o.png[/img][/url] [url=https://pixhost.to/show/395/440442916_xgqopgwe_o.png][img]https://t93.pixhost.to/thumbs/395/440442916_xgqopgwe_o.png[/img][/url] [url=https://pixhost.to/show/395/440442918_icxis9cn_o.png][img]https://t93.pixhost.to/thumbs/395/440442918_icxis9cn_o.png[/img][/url] [url=https://pixhost.to/show/395/440442919_h4am7bdz_o.png][img]https://t93.pixhost.to/thumbs/395/440442919_h4am7bdz_o.png[/img][/url]
  [url=https://pixhost.to/show/395/440442920_k6riyd50_o.png][img]https://t93.pixhost.to/thumbs/395/440442920_k6riyd50_o.png[/img][/url] [url=https://pixhost.to/show/395/440442921_jvlnrjkq_o.png][img]https://t93.pixhost.to/thumbs/395/440442921_jvlnrjkq_o.png[/img][/url] [url=https://pixhost.to/show/395/440442922_vvdorzur_o.png][img]https://t93.pixhost.to/thumbs/395/440442922_vvdorzur_o.png[/img][/url] [url=https://pixhost.to/show/395/440442923_ubx0rwf4_o.png][img]https://t93.pixhost.to/thumbs/395/440442923_ubx0rwf4_o.png[/img][/url] [url=https://pixhost.to/show/395/440442924_kqdeml4s_o.png][img]https://t93.pixhost.to/thumbs/395/440442924_kqdeml4s_o.png[/img][/url]
  [url=https://pixhost.to/show/395/440442932_s72jum90_o.png][img]https://t93.pixhost.to/thumbs/395/440442932_s72jum90_o.png[/img][/url] [url=https://pixhost.to/show/395/440442933_5ezkdlvf_o.png][img]https://t93.pixhost.to/thumbs/395/440442933_5ezkdlvf_o.png[/img][/url] [url=https://pixhost.to/show/395/440442935_kioo1nwq_o.png][img]https://t93.pixhost.to/thumbs/395/440442935_kioo1nwq_o.png[/img][/url] [url=https://pixhost.to/show/395/440442936_pviauquf_o.png][img]https://t93.pixhost.to/thumbs/395/440442936_pviauquf_o.png[/img][/url] [url=https://pixhost.to/show/395/440442937_z0nemsnc_o.png][img]https://t93.pixhost.to/thumbs/395/440442937_z0nemsnc_o.png[/img][/url]
  [url=https://pixhost.to/show/395/440442939_nyssxueg_o.png][img]https://t93.pixhost.to/thumbs/395/440442939_nyssxueg_o.png[/img][/url] [url=https://pixhost.to/show/395/440442941_ooomolpd_o.png][img]https://t93.pixhost.to/thumbs/395/440442941_ooomolpd_o.png[/img][/url] [url=https://pixhost.to/show/395/440442943_qdrnnkum_o.png][img]https://t93.pixhost.to/thumbs/395/440442943_qdrnnkum_o.png[/img][/url] [url=https://pixhost.to/show/395/440442945_aaf44qw4_o.png][img]https://t93.pixhost.to/thumbs/395/440442945_aaf44qw4_o.png[/img][/url] [url=https://pixhost.to/show/395/440442946_5px4gz8x_o.png][img]https://t93.pixhost.to/thumbs/395/440442946_5px4gz8x_o.png[/img][/url][/center]`,
  teams: ['Source', 'Filtered', 'c0kE', 'PTER', 'HANDJOB'],
  numUrls: 20,
  thumbs: true,
  type: 'titled'
}]
test('test screenshots boxed', () => {
  tests.forEach(test => {
    const parseResult = collectComparisons(test.text).next().value
    expect(JSON.stringify(parseResult.teams)).toBe(JSON.stringify(test.teams))
    expect(parseResult.urls.length).toBe(test.numUrls)
    expect(parseResult.regexType).toBe(test.type)
    expect(parseResult.thumbs).toBe(test.thumbs)
  })
})
