// ==UserScript==
// @name         Post Formatter
// @description  Format upload info and smilies
// @version      1.2.1
// @author       Anonymous inspired by Secant(TYT@NexusHD)
// @match        http://*.nexushd.org/*
// @match        https://pterclub.com/*
// @match        https://pt.sjtu.edu.cn/*
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
    var domain_match_array = window.location.href.match(/(.*)\/(upload|edit|subtitles)\.php/);
    if (!domain_match_array){
        return;
    }
    var site = domain_match_array[1].match(/nexushd/i)
        ? 'nhd'
        : domain_match_array[1].match(/pterclub/i)
        ? 'pter'
        : domain_match_array[1].match(/pt\.sjtu/i)
        ? 'putao'
        : '';
    var page = domain_match_array[2];
    if (!site || !page){
        return;
    }
    console.log(`running in site ${site} and page ${page}`);
    // initialization 
    var btn_bingo = $("<input>");
    var btn_bingo_sub = $("<input>");
    
    // common
    // controls
    var name_box = null, small_desc_box = null, imdb_link_box = null, douban_link_box = null,
        descr_box = null, category_sel = null, source_sel = null;
    // anonymously publishing
    var anonymous_check = null;
    const anonymous = true;   
    // this is normally useful even when area_sel == null. 
    var area_cn_ml = false, area_hk = false, area_tw = false, area_eu_ame = false, area_kor = false, area_jap = false,
        area_ind = false, area_asia = false, area_other = false;
    var area_num_default = 0, area_num_cn_ml = 1, area_num_hk = 2, area_num_tw = 3, 
        area_num_eu_ame = 4, area_num_kor = 5, arae_num_jap = 6, area_num_ind = 7, area_num_other = 8;
    // categories
    var cate_num_default = 0, cate_num_movie = 1, cate_num_documentary = 2, cate_num_animation = 3, 
        cate_num_tv_series = 4, cate_num_tv_show = 5;
    var source_num_default = 0, source_num_uhd = 0, source_num_bluray = 0, 
        source_num_remux = 0, source_num_hddvd = 0, source_num_dvd = 0, 
        source_num_encode = 0, source_num_web_dl = 0, source_num_web_rip = 0, 
        source_num_hdtv = 0, source_num_tv = 0, source_num_other = 0;
    var tag_box = 'box';
    // site-specific 
    //controls
    // pter
    var area_sel = null;
    var zhongzi_check = null, ensub_check = null, guoyu_check = null, yueyu_check = null;
     // nhd
    var standard_sel = null, processing_sel = null, codec_sel = null;
    var standard_num_default =0, standard_num_1080p = 0, standard_num_1080i = 0, 
        standard_num_720p = 0, standard_num_2160p = 0, standard_num_sd = 0, standard_num_other = 0;
    var process_num_default = 0, process_num_raw = 0, process_num_encode = 0;
    var codec_num_default = 0, codec_num_h_264 = 0, codec_num_h_265 = 0, codec_num_vc_1 = 0, codec_num_xvid = 0,
        codec_num_mpeg_2 = 0, codec_num_flac = 0, codec_num_other = 15;
    //putao
    var oday_check = null;
    var cate_num_movie_cn =0, cate_num_movie_eu_ame = 0, cate_num_movie_asia = 0, cate_num_tv_series_hk_tw = 0,
        cate_num_tv_series_asia = 0, cate_num_tv_series_cn_ml = 0, cate_num_tv_series_eu_ame = 0,
        cate_num_tv_show_cn_ml = 0, cate_num_tv_show_eu_ame = 0, cate_num_tv_show_hk_tw = 0, cate_num_tv_show_jp_kor = 0;
    if (site == 'nhd'){
        tag_box = 'box';
        if (page == 'upload') {
            name_box = $("#name");
        } else{
            name_box = $("input[type='text'][name='name']");
        }
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
        tag_box = 'hide';
        if (page == 'upload') {
            name_box = $("#name");
        } else{
            name_box = $("input[type='text'][name='name']");
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
        area_num_cn_ml = 1;
        area_num_hk = 2;
        area_num_tw = 3;
        area_num_eu_ame = 4;
        area_num_kor = 5;
        arae_num_jap = 6;
        area_num_ind = 7;
        area_num_other = 8;
    } else if (site = 'putao'){
        tag_box = 'box';
        if (page == 'upload') {
            name_box = $("#name");
        } else{
            name_box = $("input[type='text'][name='name']");
        }
        small_desc_box = $("input[name='small_descr']");
        imdb_link_box = $("input[name='url'][type='text']");
        douban_link_box = $("input[name='douban_url']");
        descr_box = $("#descr");
        category_sel = $("#browsecat");

        standard_sel = $("select[name='standard_sel']");
        codec_sel = $("select[name='codec_sel']");
        anonymous_check = $("input[name='uplver'][type='checkbox']")[0];
        oday_check = $("input[name='isoday'][type='checkbox']")[0];

        cate_num_default = 0;
        cate_num_documentary = 406;
        cate_num_animation = 431;
        cate_num_movie_cn = 401;
        cate_num_movie_eu_ame = 402;
        cate_num_movie_asia = 403;
        cate_num_tv_series_hk_tw = 407;
        cate_num_tv_series_asia = 408;
        cate_num_tv_series_cn_ml = 409;
        cate_num_tv_series_eu_ame = 410;
        cate_num_tv_show_cn_ml = 411;
        cate_num_tv_show_hk_tw = 412;
        cate_num_tv_show_eu_ame = 413;
        cate_num_tv_show_jp_kor = 414;

        standard_num_default = 0;
        standard_num_1080p = 1;
        standard_num_1080i = 2;
        standard_num_720p = 3;
        standard_num_2160p = 6;
        standard_num_sd = 4;
        standard_num_other = 5;

        codec_num_default = 0;
        codec_num_h_264 = 1;
        codec_num_vc_1 = 2;
        codec_num_xvid = 3;
        codec_num_mpeg_2 = 4;
        codec_num_flac = 5;
        codec_num_h_265 = 10;
        codec_num_other = 9;
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
            if (area.match(/中国大陆/)){
                area_cn_ml = true;
            } else if (area.match(/香港/)){
                area_hk = true;
            } else if (area.match(/台湾/)){
                area_tw = true;
            } else if (area.match(/美国|加拿大|英国|法国|德国|希腊|匈牙利|爱尔兰|意大利|阿尔巴尼亚|安道尔|奥地利|白俄罗斯|比利时|波斯尼亚|黑塞哥维那|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛|冰岛|芬兰|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|梵蒂冈/)){
                area_eu_ame = true;
            } else if (area.match(/印度|韩国|日本|新加坡|泰国|印度尼西亚|菲律宾|越南|土耳其|老挝|柬埔寨|缅甸|马来西亚|文莱|东帝汶|尼泊尔|不丹|孟加拉国|巴基斯坦|斯里兰卡|马尔代夫|阿富汗|伊拉克|伊朗|叙利亚|约旦|黎巴嫩|以色列|巴勒斯坦|沙特阿拉伯|阿曼|也门|格鲁吉亚|亚美尼亚|塞浦路斯|哈萨克斯坦|吉尔吉斯斯坦|塔吉克斯坦|乌兹别克斯坦|土库曼斯坦|蒙古|朝鲜/)){
                area_asia = true;
                if (area.match(area.match(/韩国/))){
                    area_kor = true;
                } else if (area.match(/日本/)){
                    area_jap = true;
                } else if (area.match(/印度/)){
                    area_ind = true;
                }
            } else{
                area_other = true;
            }
            if(translated_title_array && original_title_array){
                var translated_title = translated_title_array[1];
                var original_title = original_title_array[1];
                if (site == 'nhd' || site == 'pter'){
                    if (area_cn_ml){
                        small_descr_array.push(torrent_title.match(original_title) ? translated_title : original_title);
                    } else{
                        small_descr_array.push(translated_title);
                    }
                } else if (site == 'putao'){
                    if (area_cn_ml){
                        torrent_title = torrent_title.match(original_title) ? torrent_title : `[${original_title}] ${torrent_title}`;
                        name_box.val(torrent_title)
                    } else{
                        torrent_title = torrent_title.match(translated_title) ? torrent_title : `[${translated_title}] ${torrent_title}`;
                        name_box.val(torrent_title)
                    }
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
            var cate_num = category.match('纪录')
                ? cate_num_documentary
                : category.match('动画')
                ? cate_num_animation
                : new_text.match(/集\s*数\s+/g)
                ? cate_num_tv_series
                : category.match('秀')
                ? cate_num_tv_show
                : cate_num_movie;
            // douban and imdb score in small_desc
            if (site == 'nhd' || site == 'putao'){
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
            var doub_link_array = new_text.match(/豆瓣\s*链\s*接.+(https:\/\/.*)\s*/);
            douban_link_box.val(doub_link_array ? doub_link_array[1].replace(/\[url=(.*?)\].*?\[\/url\]/, "$1") : "");
            // imdb link
            var imdb_link_array = new_text.match(/IMDb\s*链\s*接.+(https:\/\/.*)\s*/i);
            imdb_link_box.val(imdb_link_array ? imdb_link_array[1].replace(/\[url=(.*?)\].*?\[\/url\]/, "$1") : "");
            // area selection
            if (area_sel){
                var area_num = area_num_default;
                if (site == 'pter'){
                    area_num = area_cn_ml
                        ? area_num_cn_ml
                        : area_hk
                        ? area_num_hk
                        : area_tw
                        ? area_num_tw
                        : area_eu_ame
                        ? area_num_eu_ame
                        : area_kor
                        ? area_num_kor
                        : area_jap
                        ? arae_num_jap
                        : area_ind
                        ? area_num_ind
                        : area_num_other;
                } 
                area_sel.val(area_num);
            }
            // category selection
            if (category_sel){
                if(site == 'putao'){
                    if (cate_num == cate_num_movie){
                        cate_num = area_cn_ml
                            ? cate_num_movie_cn
                            : area_eu_ame
                            ? cate_num_movie_eu_ame
                            : area_asia
                            ? cate_num_movie_asia
                            : cate_num_movie_eu_ame;
                    } else if (cate_num == cate_num_documentary){
                        // for clarification
                        cate_num = cate_num_documentary;
                    } else if (cate_num == cate_num_animation){
                        // for clarification
                        cate_num = cate_num_animation;
                    } else if (cate_num == cate_num_tv_series){
                        cate_num = area_hk || area_tw 
                            ? cate_num_tv_series_hk_tw
                            : area_asia
                            ? cate_num_tv_series_asia
                            : area_cn_ml
                            ? cate_num_tv_series_cn_ml
                            : area_eu_ame
                            ? cate_num_tv_series_eu_ame
                            : cate_num_tv_series_eu_ame;
                    } else if (cate_num == cate_num_tv_show){
                        cate_num = area_cn_ml
                            ? cate_num_tv_show_cn_ml
                            : area_hk || area_tw
                            ? cate_num_tv_show_hk_tw
                            : area_eu_ame
                            ? cate_num_tv_show_eu_ame
                            : area_jap || area_kor
                            ? cate_num_tv_show_jp_kor
                            : cate_num_default;
                    }
                }
                category_sel.val(cate_num);
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
                    : source_num_default;// other
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
        // resolution
        if(standard_sel){
            var stantdard_num = standard_num_default;
            if (site == 'nhd' || site == 'putao'){
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
                    : standard_num_default;
            }
            standard_sel.val(stantdard_num);
        }
        // processing
        if (processing_sel){
            var process_num = process_num_default;
            if(site == 'nhd'){
                process_num = torrent_title.match(/\W(?:remux|web\-?dl)\W/i)
                    ? process_num_raw
                    : process_num_encode;
            }
            processing_sel.val(process_num);
        }
        // codec
        if (codec_sel){
            var codec_num = codec_num_default;
            if (site == 'nhd' || site == 'putao'){
                codec_num = torrent_title.match(/\W(?:h|x)\.?264\W/i)
                    ? codec_num_h_264
                    : torrent_title.match(/\W(?:h|x)\.?265\W/i)
                    ? codec_num_h_265
                    : torrent_title.match(/\Wmpeg-2/i)
                    ? codec_num_mpeg_2
                    : torrent_title.match(/\Wxvid/i)
                    ? codec_num_xvid
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
    // subtitle uploading
    btn_bingo_sub.click(function(){
        var input_file = $('input[type="file"][name="file"]');
        var title_box = $('input[type="text"][name="title"]');
        var language_sel = $('select[name="sel_lang"]');
        if (anonymous_check){
            anonymous_check.checked = anonymous;
        }
        var lang_num_default = 0, lang_num_eng = 6, lang_num_chs = 25, lang_num_cht = 28,
            lang_num_jap = 15, lang_num_fre = 9, lang_num_ger = 10, lang_num_ita = 14,
            lang_num_kor = 16, lang_num_spa = 26, lang_num_other = 18;
        var lang_num = lang_num_default;
        var path_sub = input_file.val();
        var file_name = /([^\\]+)$/.exec(path_sub)[1];
        if (file_name){
            title_box.val(file_name);
            var lang = path_sub.replace(/.*\.(.*)\..*/i, "$1");
            if (lang){
                lang_num = lang.match(/(chs|cht|cn|zh)\s*( |&)?.+/) || lang.match(/.+( |&)?(chs|cht|cn|zh)/)
                    ? lang_num_other
                    : lang.match(/chs/)
                    ? lang_num_chs
                    : lang.match(/cht/)
                    ? lang_num_cht
                    : lang.match(/eng/)
                    ? lang_num_eng
                    : lang.match(/jap|jp/)
                    ? lang_num_jap
                    : lang.match(/fre|fra/)
                    ? lang_num_fre
                    : lang.match(/ger/)
                    ? lang_num_ger
                    : lang.match(/ita/)
                    ? lang_num_ita
                    : lang.match(/kor/)
                    ? lang_num_kor
                    : lang.match(/spa/)
                    ? lang_num_spa
                    : lang_num_other;
            }
            console.log(`language: ${lang}`);
            language_sel.val(lang_num);
        } else{
            console.log(`not able to get file name from path ${path_sub}`);
        }
    });
    if (page == 'upload' || page == 'edit'){
        btn_bingo.attr({
            "type":"button",
            "name":"bingo_converter",
            "value":"BINGO",
            "style":"font-size: 11px; color: blue; margin-right: 3px",
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
    } else if (page == 'subtitles'){
        var btn_upload_sub = $('input[type="submit"][value="上传文件"]');
        var wrapper = btn_upload_sub[0].parentNode;
        const styles = window.getComputedStyle(btn_upload_sub[0]);
        btn_bingo_sub.attr({
            "type":"button",
            "name":"bingo_converter_sub",
            "value":"BINGO",
        });
        if (styles.cssText){
            btn_bingo_sub[0].style.cssText = styles.cssText;
        } else{
            const cssText = Object.values(styles).reduce(
                (css, propertyName) =>
                    `${css}${propertyName}:${styles.getPropertyValue(
                        propertyName
                    )};`
            );
            btn_bingo_sub[0].style.cssText = cssText
        }
        wrapper.append(btn_bingo_sub[0]);
    }
})();