// module imports
const {
  collectComparisons,
  generateComparison,
  processDescription
} = require('./PostFormatter')
const fs = require('fs')
const path = require('path')
const {
  glob,
  globSync,
  globStream,
  globStreamSync,
  Glob,
} = require('glob')

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
  Source: Lawless 2012 1080p CAN Blu-ray AVC DTS-HD MA 5.1-EbP (41.87 GiB)[/quote][quote=Encoder's Notes]See the differences between the two cuts in the blu-ray upload.
  In terms of quality between this encode and Sabooo's, in light/non-action scenes there's not much difference at all.
  However, in action, and dark/grainy scenes this encode holds up better... probably due to different settings. Also,
  only about 1 Mbps difference in video bitrate.[/quote][quote=Notes on CAN Blu-ray]Most Canadian discs are simply US/UK ports, the odd time we get different colours and audio features; however, for Lawless we got a completely different cut of the film.
  
  Differences between Starz/Anchor (US) and Alliance (CAN) disc in some scenes
  
  • overcropped and stretched US Cut
  • colours are different
  • missing sequences
  
  That was simply a summary of the differences; the most important to us are the missing sequences on the US Cut, the CAN missing sequences were negligible
  
  [size=5]Missing Sequences (SPOILER ADVISORY)[/size]
  
  Rather than going through all the missing sequences I found, i'll go through a few; what I found was the US Cut took out the more grotesque and intense sequences
  
  F1:1 - Swine shooting[box][img]https://ptpimg.me/rfm647.png[/img][img]https://ptpimg.me/ryp0ku.png[/img][/box]US Cut - All we see is the muzzle flash of a gun
  CAN Cut - We see a pig receiving a headshot, twitch and die
  
  The US Cut doesn't have the CAN sequence, this could be PETA-related where animal-rights activists lobbied against it.
  
  F1:2 - Extra child[box][img]https://ptpimg.me/bg4la3.png[/img][img]https://ptpimg.me/h9t1p4.png[/img][/box]US Cut - Extra kid on the screen: the one wearing the trapper-hat
  CAN Cut - the last frame 6982 in that sequence, you see the trapper kid on the left side about to get facetime... but he doesn't
  
  One of two additional sequences that the US Cut has over CAN; this extra kid bears no significance, and is not seen later in the film; you'll also notice a colour difference here, but we'll discuss that later
  
  F1:3 - Close-up punch[box][img]https://ptpimg.me/1j5c3e.png[/img][img]https://ptpimg.me/3acfol.png[/img][img]https://ptpimg.me/94f73o.png[/img][img]https://ptpimg.me/o73724.png[/img][img]https://ptpimg.me/v7j7u6.png[/img][/box]US Cut - Frame 43437 you see LaBeouf head, the next frame pans out out to him getting punched
  CAN Cut - Frame 44034 you see the same frame with his head, however the next frame shows the beginning of a closeup sequence of him getting punched and then panned out, where the US frame is continued on 44048
  
  Here we have a missing close-up sequence of LaBeouf getting his head bashed in
  
  F1:4 - Behind you[box][img]https://ptpimg.me/8l0cy5.png[/img][img]https://ptpimg.me/n3uyt9.png[/img][img]https://ptpimg.me/r0oys8.png[/img][img]https://ptpimg.me/57bwo9.png[/img][/box]US Cut - After frame 62442, Hardy looks behind
  CAN Cut - Frame 63052 is the same as the US Cut, however CAN continues with that same sequences for a few more frames
  
  CAN is missing the sequence where Hardy turns around, this and and F1:2 were the only two sequences that I found missing in the CAN Cut.
  
  F1:5 - Worm's-eye view[box][img]https://ptpimg.me/eqzn46.png[/img][img]https://ptpimg.me/elgm13.png[/img][img]https://ptpimg.me/8e29j5.png[/img][img]https://ptpimg.me/7vp1ja.png[/img][img]https://ptpimg.me/m03r83.png[/img][/box]US Cut - Following frame 65770, we have a bird's eye view of Hardy getting his throat sliced
  CAN Cut - Identical frame 66271, is followed by a worm's eye view and later in 66308 we have the US's bird's eye view
  
  US is missing the worm's eye view of the slashing, it is a much more intense and revealing scene than the bird's eye view. This scene also includes three more sequences which are missing in the US Cut.
  
  F1:6 - Bloody body[box][img]https://ptpimg.me/u6o51c.png[/img][img]https://ptpimg.me/w02u85.png[/img][img]https://ptpimg.me/g7s837.png[/img][img]https://ptpimg.me/4qpejd.png[/img][img]https://ptpimg.me/3uaav4.png[/img][img]https://ptpimg.me/lxq5bk.png[/img][/box]US Cut - After frame 96004, the following frame jumps to a shot of man's dresspants
  CAN Cut - After that same frame 96595 we go to a bloody body body on the floor, a better look at 96611 and then 96626 back to the man's dresspants
  
  US Cut completely misses out the body, there is also another scene where this body was partially removed from the cut; they went through great lengths to make sure Americans didn't see it
  
  F1:7 - Blood Spatter[box][img]https://ptpimg.me/7zs07q.png[/img][img]https://ptpimg.me/416z7v.png[/img][img]https://ptpimg.me/435rq7.png[/img][img]https://ptpimg.me/bjj93z.png[/img][img]https://ptpimg.me/t4tr0x.png[/img][img]https://ptpimg.me/26r63y.png[/img][/box]US Cut - Following frame 143911 we go outside and look through the shattered glass
  CAN Cut - Same frame 144532, the following frame stays inside the car and a better shot of why the US has this sequence missing is found in 144541; outside sequence is found later in 144542
  
  Yet another example of the US cut having missing sequences related to bloody, gory and intense scenes. There are much more missing US sequences, but I didn't want to completely spoil the film.
  
  [size=5]Overcropped & Stretched[/size]
  
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
        expect(output.text.trim().length).toBe(input.length)
      }
    }
  })
})
test('test whole screenshots conversion', async () => {
  const inputs = await glob('./test files/input/*.bbcode')
  const targetSites = ['NHD', 'GPW']
  for (const input of inputs) {
    const [movieName, originalSite] = path.basename(input).split('.')
    try {
      let data = fs.readFileSync(input, 'utf8')
      for (const targetSite of targetSites) {
        data = processDescription(targetSite, data)
        const description = await generateComparison(targetSite, data, '', {}, 10)
        const output = `./test files/output/${movieName}.${targetSite} from ${originalSite}.bbcode`
        if (description) {
          fs.writeFileSync(output, description)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}, 30000)
