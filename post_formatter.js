// ==UserScript==
// @name         Post Formatter
// @description  Format upload info and smilies
// @version      1.1
// @author       Anonymous inspired by Secant(TYT@NexusHD)
// @match        http://*.nexushd.org/*
// @match        https://pterclub.com/*
// @require      https://cdn.staticfile.org/jquery/2.1.4/jquery.js
// @require      https://code.jquery.com/jquery-migrate-1.0.0.js
// @grant        none
// @icon         http://www.nexushd.org/favicon.ico
// @namespace    d8e7078b-abee-407d-bcb6-096b59eeac17
// @license      MIT
// ==/UserScript==
(function() {
    'use strict';
    function insert_tyt(myValue,switcher){
        var obj_target;
        if(switcher===1){
            obj_target=$("#compose textarea",window.opener.document)[0];
        }
        else if(switcher===0){
            if($("#compose textarea").length){
                obj_target=$("#compose textarea")[0];
            }
            else if($("#shbox_text").length){
                obj_target=$("#shbox_text")[0];
            }
        }
        else{
            return false;
        }
        var match_obj = /(\n\[\/|\](\[\/|$))/.exec(myValue);
        var startPos = obj_target.selectionStart;
        var endPos = obj_target.selectionEnd;
        obj_target.value = obj_target.value.substring(0, startPos) + myValue + obj_target.value.substring(endPos, obj_target.value.length);
        obj_target.selectionEnd = startPos + myValue.length;
        obj_target.focus();
        if(match_obj){
            obj_target.setSelectionRange(startPos+match_obj.index+1, startPos+match_obj.index+1);
        }
        return true;
    }
    function nestExplode(input_text){
        var output_text,c;
        do{
            output_text = input_text.replace(/\[hide((?:=[^\]]+)?\](?:(?!\[\/hide\])[\s\S])*\[hide(?:=[^\]]+)?\])/g,"[quote$1");
            output_text = output_text.replace(/(\[\/hide\](?:(?!\[hide(?:=[^\]]+)?\])[\s\S])*)\[\/hide\]/g,"$1[/quote]");
            c=(input_text!=output_text);
            input_text=output_text;
        }while(c);
        return output_text;
    }
    function switchBoxQuote(input_text){
        var output_text,c;
        do{
            output_text = input_text.replace(/(\[)(?:hide|_x~bTYt_)((?:=[^\]]+)?\](?:(?!\[\/(?:hide|_x~bTYt_)\])[\s\S])*\[)quote((?:=[^\]]+)?\](?:(?!\[\/quote\])[\s\S])*\[\/)quote((?:=[^\]]+)?\](?:(?!\[(?:hide|_x~bTYt_)(?:=[^\]]+)?\])[\s\S])*\[\/)(?:hide|_x~bTYt_)(\])/g,"$1_x~bTYt_$2_e~qTYt_$3_e~qTYt_$4_x~bTYt_$5");
            c=(input_text!=output_text);
            input_text=output_text;
        }while(c);
        output_text = output_text.replace(/_x~bTYt_/g,"quote");
        output_text = output_text.replace(/_e~qTYt_/g,"hide");
        return output_text;
    }
    function compact_content(input_text){
        var output_text,c;
        do{
            output_text = input_text.replace(/(\[\/?(?:quote|hide|code)(?:=[^\]]+)?\])\s+(\S)/g,"$1$2");
            output_text = output_text.replace(/(\S)\s+(\[\/?(?:quote|hide|code)(?:=[^\]]+)?\])/g,"$1$2");
            output_text = output_text.replace(/(\[quote|hide|code(?:=[^\]]+)?\](?:(?!\[\/)[\s\S])*\[(?:font|b|i|u|color|size)(?:=[^\]]+)?\])\n+([^\n])/g,"$1$2");
            c=(input_text!=output_text);
            input_text=output_text;
        }while(c);
        return output_text;
    }
    //============================================================
    var domain_match_array = window.location.href.match(/(.*)\/(upload|edit)\.php/);
    if (!domain_match_array){
        return;
    }
    var site = '';
    if (domain_match_array[1].match(/nexushd/i)){
        site = 'nhd';
    } else if (domain_match_array[1].match(/pterclub/i)){
        site = 'pter';
    }
    
    var page = domain_match_array[2];
    if (!site || !page){
        return;
    }
    console.log(`running in site ${site} and page ${page}`);
    // initialization 
    var btn_bingo = $("<input>");
    btn_bingo.attr({
        "type":"button",
        "name":"bingo_converter",
        "value":"BINGO",
        "style":"font-size: 11px; color: blue; margin-right: 3px",
    });
    // common
    // controls
    var name_box = null, small_desc_box = null, imdb_link_box = null, douban_link_box = null,
        descr_box = null, category_sel = null, source_sel = null;
    // anonymously publishing
    var anonymous_check = null;
    const anonymous = false;    
    // values
    var cate_num_default = 0, cate_num_movie = 0, cate_num_documentary = 0, cate_num_animation = 0, 
        cate_num_tv_series = 0, cate_num_tv_show = 0;
    var source_num_default = 0, source_num_uhd = 0, source_num_bluray = 0, 
        source_num_remux = 0, source_num_hddvd = 0, source_num_dvd = 0, 
        source_num_encode = 0, source_num_web_dl = 0, source_num_web_rip = 0, 
        source_num_hdtv = 0, source_num_tv = 0, source_num_other = 0;

    // site-specific 
    //controls
    // pter
    var area_sel = null;
    var zhongzi_check = null, ensub_check = null, guoyu_check = null, yueyu_check = null;
    var area_num_default = 0, area_num_china_mainland = 0, area_num_hongkong = 0, area_num_taiwan = 0, 
        area_num_eu_and_america = 0, area_num_koria = 0, arae_num_japan = 0, area_num_india = 0, area_num_other = 0;
    // nhd
    var standard_sel = null, processing_sel = null, codec_sel = null;
    var standard_num_default =0, standard_num_1080p = 0, standard_num_1080i = 0, 
        standard_num_720p = 0, standard_num_2160p = 0, standard_num_sd = 0;
    var process_num_default = 0, process_num_raw = 0, process_num_encode = 0;
    var codec_num_default = 0, codec_num_h_264 = 0, codec_num_h_265 = 0, codec_num_vc_1 = 0, codec_num_xvid = 0,
        codec_num_mpeg_2 = 0, codec_num_flac = 0, codec_num_other = 15;

    if (site == 'nhd'){
        name_box = $("#name");
        small_desc_box = $("input[name='small_descr']");
        imdb_link_box = $("input[name='url'][type='text']");
        douban_link_box = $("input[name='douban_url']");
        descr_box = $("#descr");
        category_sel = $("#browsecat");
        source_sel = $("select[name='source_sel']");

        standard_sel = $("select[name='standard_sel']");
        processing_sel = $("select[name='processing_sel']");
        codec_sel = $("select[name='codec_sel']");
        anonymous_check = $("input[name='uplver'][type='checkbox']")[0];

        cate_num_default = 0;
        cate_num_movie = 101;
        cate_num_tv_series = 102;
        cate_num_tv_show = 103;
        cate_num_documentary = 104;
        cate_num_animation = 105;

        source_num_default = 0;
        source_num_bluray = 1;
        source_num_hddvd = 2;
        source_num_dvd = 3;
        source_num_hdtv = 4;
        source_num_tv = 5;
        source_num_web_dl = 7;    
        source_num_web_rip = 9;
        source_num_other = 6;
        
        standard_num_default = 0;
        standard_num_1080p = 1;
        standard_num_1080i = 2;
        standard_num_720p = 3;
        standard_num_2160p = 6;
        standard_num_sd = 4;

        process_num_default = 0;
        process_num_raw = 1;
        process_num_encode = 2;

        codec_num_default = 0;
        codec_num_h_264 = 1;
        codec_num_h_265 = 2;
        codec_num_vc_1 = 3;
        codec_num_xvid = 4;
        codec_num_mpeg_2 = 5;
        codec_num_flac = 10;
        codec_num_other = 15;
    } else if (site == 'pter'){
        if (page == 'upload') {
            name_box = $("#name");
        } else{
            name_box = $("input[name='name']");
        }
        small_desc_box = $("input[name='small_descr']");
        imdb_link_box = $("input[name='url'][type='text']");
        douban_link_box = $("input[name='douban']");
        descr_box = $("#descr");
        category_sel = $("#browsecat");
        source_sel = $("select[name='source_sel']");
        anonymous_check = $("input[name='uplver'][type='checkbox']")[0];

        area_sel = $("select[name='team_sel']");
        zhongzi_check = document.getElementById('zhongzi');
        ensub_check = document.getElementById('ensub');
        guoyu_check = document.getElementById('guoyu');
        yueyu_check = document.getElementById('yueyu');

        cate_num_default = 0;
        cate_num_movie = 401;
        cate_num_tv_series = 404;
        cate_num_tv_show = 405;
        cate_num_documentary = 402;
        cate_num_animation = 403;
        
        source_num_default = 0;
        source_num_uhd = 1;
        source_num_bluray = 2;
        source_num_remux = 3;
        source_num_encode = 6;
        source_num_hdtv = 4;
        source_num_web_dl = 5;
        source_num_dvd = 7;
        source_num_other = 15;

        area_num_default = 0;
        area_num_china_mainland = 1;
        area_num_hongkong = 2;
        area_num_taiwan = 3;
        area_num_eu_and_america = 4;
        area_num_koria = 5;
        arae_num_japan = 6;
        area_num_india = 7;
        area_num_other = 8;
    }
    // function definition
    btn_bingo.click(function(){
        if (anonymous_check){
            anonymous_check.checked = anonymous;
        }
        var old_text = descr_box.val();
        var new_text = old_text.replace(/(\[\/?)([A-Z]+)((?:=(?:[^\r\n\t\f\v \[\]])+)?\])/g, function(match, p1, p2, p3) {
            p2 = p2.toLowerCase();
            return p1+p2+p3;
        });
        new_text = new_text.replace(/\[(\/)?(?:spoiler|box)((?:=[^\]]+)?)\]/g,"[$1hide$2]");
        new_text = new_text.replace(/\[mediainfo\]([^\0]*?)\[\/mediainfo\]/gi,"[hide=mediainfo]$1[/hide]");    //NHD mediainfo style
        new_text = new_text.replace(/\[pre\]/g,"[font=courier new]");
        new_text = new_text.replace(/\[\/pre\]/g,"[/font]");
        new_text = nestExplode(new_text);
        new_text = switchBoxQuote(new_text);
        new_text = new_text.replace(/(?:(?:\[\/(url|flash|flv))|^)(?:(?!\[(url|flash|flv))[\s\S])*(?:(?:\[(url|flash|flv))|$)/g,function(matches){
            return(matches.replace(/\[align(=\w*)?\]/g,"\n"));
        });
        new_text = new_text.replace(/\[(\/)?align(=\w*)?\]/g,"");
        new_text = new_text.replace(/^\s*([\s\S]*\S)\s*$/g,"$1");//是否要加上第一行？/^(\s*\n)?([\s\S]*\S)\s*$/g
        new_text = new_text.replace(/\[size=(\d+)\]/g, function(match, p1){
            if(parseInt(p1)>7){
                return('[size=7]');
            }
            return(match);
        });
        new_text = compact_content(new_text);
        descr_box.val(new_text);
        //=========================================================================================================
        // name 
        var torrent_title = name_box.val();
        torrent_title = torrent_title.replace(/\s+(?:mkv|mp4|iso|ts)\s*$/gi,"")
            .replace(/^\[.*\]\s(\S)/gi,"$1");
        name_box.val(torrent_title);
        // checking movie info
        if (new_text.match("◎")){
            // container for small_desc (副标题)
            var small_descr_array = [];
            // name
            var translated_title_array = new_text.match(/译\s*名\s*([^\/\n]+)(?:\/|\n)/);
            var original_title_array = new_text.match(/片\s*名\s*([^\/\n]+)(?:\/|\n)/);
            // area
            var area_array = new_text.match(/产\s*地\s*(.*)\s*/);
            var area = area_array ? area_array[1] : "";
            if(translated_title_array && original_title_array){
                var translated_title = translated_title_array[1];
                var original_title = original_title_array[1];
                if (area.match(/中国大陆/)){
                    small_descr_array.push(torrent_title.match(original_title) ? translated_title : original_title);
                } else{
                    small_descr_array.push(translated_title);
                }
            }
            // festival
            var festival_array = new_text.match(/(\d{4})-\d{2}-\d{2}\((\S+电影节)\)/);
            if(festival_array){
                small_descr_array.push(festival_array[1]+festival_array[2]);
            }
            // category
            var category_array = new_text.match(/类\s*别\s+([^\n]*)\s*\n/);
            var category = "";
            if(category_array){
                category = category_array[1].replace(/\//g," / ");
                small_descr_array.push(category);
            }
            // douban and imdb score in small_desc
            if (site == 'nhd'){
                var doub_score_array = new_text.match(/豆\s*瓣\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/);
                if(doub_score_array){
                    small_descr_array.push("豆瓣 "+doub_score_array[1]+"（"+doub_score_array[2]+"）");
                }
                var imdb_score_array = new_text.match(/IMDb\s*评\s*分\s+(\d\.\d)\/10\sfrom\s((?:\d+,)*\d+)\susers/i);
                if(imdb_score_array){
                    small_descr_array.push("IMDb "+imdb_score_array[1]+"（"+imdb_score_array[2]+"）");
                }
            }
            // director
            var director_array = new_text.match(/导\s*演\s+([^\w\n\s]*)\s*/);
            if(director_array){
                small_descr_array.push(director_array[1]);
            }
            // complete small_descr
            var small_descr = small_descr_array.join(' | ');
            small_desc_box.val(small_descr);
            // douban link
            var doub_link_array = new_text.match(/豆瓣\s*链\s*接\s+([^\s\n]+)\s*\n/);
            douban_link_box.val(doub_link_array ? doub_link_array[1].replace(/\[url=(.*?)\].*?\[\/url\]/, "$1") : "");
            // imdb link
            var imdb_link_array = new_text.match(/IMDb\s*链\s*接\s+([^\s\n]+)\s*\n/i);
            imdb_link_box.val(imdb_link_array ? imdb_link_array[1].replace(/\[url=(.*?)\].*?\[\/url\]/, "$1") : "");
            
            // category selection
            if (category_sel){
                var cate_num = 0;
                cate_num = category.match('纪录')
                    ? cate_num_documentary
                    : category.match('动画')
                    ? cate_num_animation
                    : new_text.match(/集\s*数\s+/g)
                    ? cate_num_tv_series
                    : category.match('秀')
                    ? cate_num_tv_show
                    : cate_num_movie;
               category_sel.val(cate_num);
            }
            // area selection
            if (area_sel){
                var area_num = area_num_default;
                if (site == 'pter'){
                    area_num = area.match(/中国大陆/)
                    ? area_num_china_mainland
                    : area.match(/香港/)
                    ? area_num_hongkong
                    : area.match(/台湾/)
                    ? area_num_taiwan
                    : area.match(/美国|加拿大|英国|法国|德国|希腊|匈牙利|爱尔兰|意大利|阿尔巴尼亚|安道尔|奥地利|白俄罗斯|比利时|波斯尼亚|黑塞哥维那|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛|冰岛|芬兰|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|梵蒂冈/)
                    ? area_num_eu_and_america
                    : area.match(/韩国/)
                    ? area_num_koria
                    : area.match(/日本/)
                    ? arae_num_japan
                    : area.match(/印度/)
                    ? area_num_india
                    : area_num_other;
                }
                area_sel.val(area_num);
            }
        }
        //=========================================================================================================
        // checking torrent name
        // source
        if (source_sel){
            var source_num = source_num_default;
            if (site == 'pter'){
                source_num = torrent_title.match(/\W(?:remux)\W/i)
                    ? source_num_remux// remux
                    : torrent_title.match(/\W(?:blu(?:e|\-)?ray|bdrip|dvdrip|webrip)\W/i)
                    ? source_num_encode// encode
                    : torrent_title.match(/\Whdtv\W/i)
                    ? source_num_hdtv// hdtv
                    : torrent_title.match(/\Wweb\-?dl\W/i)
                    ? source_num_web_dl// web-dl
                    : source_num_default// other
            } else if (site == 'nhd'){
                source_num = torrent_title.match(/\W(?:blu(?:e|\-)?ray|bdrip)\W/i)
                    ? source_num_bluray
                    : torrent_title.match(/\Whdtv\W/i)
                    ? source_num_hddvd
                    : torrent_title.match(/\Wdvd/i)
                    ? source_num_dvd
                    : torrent_title.match(/\Wweb\-?dl\W/i)
                    ? source_num_web_dl
                    : torrent_title.match(/\Wwebrip\W/i)
                    ? source_num_web_rip
                    : source_num_default;
            }
            source_sel.val(source_num);
        }
        if(standard_sel){
            var stantdard_num = standard_num_default;
            if (site == 'nhd'){
                stantdard_num = torrent_title.match(/\W1080p\W/i)
                    ? standard_num_1080p
                    : torrent_title.match(/\W1080i\W/i)
                    ? standard_num_1080i
                    : torrent_title.match(/\W720p\W/i)
                    ? standard_num_720p
                    : torrent_title.match(/\W(?:2160p|4k)\W/i)
                    ? standard_num_2160p
                    : torrent_title.match(/\Wdvd/i)
                    ? standard_num_sd
                    : standard_num_default
            }
            standard_sel.val(stantdard_num);
        }
        if (processing_sel){
            var process_num = process_num_default;
            if(site == 'nhd'){
                process_num = torrent_title.match(/\W(?:remux|web\-?dl)\W/i)
                    ? process_num_raw
                    : process_num_encode;
            }
            processing_sel.val(process_num);
        }
        if (codec_sel){
            var codec_num = codec_num_default;
            if (site == 'nhd'){
                codec_num = torrent_title.match(/\W(?:h|x)\.?264\W/i)
                    ? codec_num_h_264
                    : torrent_title.match(/\W(?:h|x)\.?265\W/i)
                    ? codec_num_h_265
                    : torrent_title.match(/\Wmpeg-2/i)
                    ? codec_num_mpeg_2
                    : torrent_title.match(/\Wflac/i)
                    ? codec_num_flac
                    : codec_num_default;
            }
            codec_sel.val(codec_num);
        }
        // checking mediainfo
        if (zhongzi_check && ensub_check && guoyu_check && yueyu_check){
            var mediainfo_array = new_text.match(/\[hide\s*=\s*mediainfo\].*?(General\s*?Unique\s*?ID[^\0]*?)\[\/hide\]/im);
            if (mediainfo_array){
                var chinese_sub = false;
                var english_sub = false;
                var chinese_dub = false;
                var cantonese_dub = false;
                var mediainfo = mediainfo_array[1];
                var subtitles = mediainfo.match(/Text.*?\nID[^\0]*?Forced.*/gm);
                if (subtitles){
                    console.log(`${subtitles.length} subtitles`);
                    subtitles.forEach((subtitle) => {
                        var language_array = subtitle.match(/language\s*:(.*)/i);
                        if (!language_array){
                            language_array = subtitle.match(/title\s*:(.*)/i);
                        }
                        if (language_array){
                            var language = language_array[1];
                            if (language.match(/chinese|chs|cht/i)){
                                console.log('zhongzi');
                                chinese_sub = true;
                                return;
                            } else if (language.match(/english/i)) {
                                english_sub = true;
                                console.log('ensub');
                                return;
                            } else{
                                console.log('other sub');
                            }
                        }
                        else{
                            console.log('no language specified for the subs');
                        }
                    });
                }
                var dubs = mediainfo.match(/Audio.*\nID[^\0]*?Forced.*/gm);
                if (dubs){
                    console.log(`${dubs.length} dubs`);
                    dubs.forEach((dub) => {
                        if (dub.match(/cantonese/i)) {
                            cantonese_dub = true;
                            console.log('yueyu');
                            return;
                        } else if (dub.match(/chinese/i)){
                            chinese_dub = true;
                            console.log('guoyu');
                            return;
                        } else{
                            console.log('other dub');
                        }
                    })
                } else {
                    console.log('no dub');
                }
                zhongzi_check.checked = chinese_sub;
                ensub_check.checked = english_sub;
                guoyu_check.checked = chinese_dub;
                yueyu_check.checked = cantonese_dub;
            }
        }
        descr_box.focus();
    });
    var td_1 = $("<td>");
    td_1.attr({
        "class":"embedded"
    });
    var tr_1 = $("<tr>");
    tr_1.attr({
        "id":"multi_function"
    });
    var tbody_1 = $("<tbody>");
    var table_1 = $("<table>");
    table_1.attr({
        "cellspaceing":"1",
        "cellpadding":"2",
        "border":"0",
        "style":"margin-top:3px"
    });
    td_1.append(btn_bingo);
    tr_1.append(td_1);
    tbody_1.append(tr_1);
    table_1.append(tbody_1);
    $('#compose input[name="quote"]').closest('table').after(table_1);

    var switcher = 0;
    if(window.location.href.match(/moresmilies\.php/)){
        switcher = 1;
    }
    $("a[href*='SmileIT']").click(function(){
        insert_tyt(this.getAttribute("href").match(/\[em\d+\]/)[0],switcher);
        return false;
    });
})();