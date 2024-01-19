// ==UserScript==
// @name         Post Formatter For PterClub
// @description  Format upload info and smilies
// @version      1.0
// @author       Anonymous inspired by Secant(TYT@NexusHD)
// @include      http*://pterclub.com/*
// @require      https://cdn.staticfile.org/jquery/2.1.4/jquery.js
// @require      https://code.jquery.com/jquery-migrate-1.0.0.js
// @grant        none
// @icon         https://pterclub.com/favicon.ico
// @namespace    https://greasyfork.org/users/152136
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
    if(window.location.href.match(/(upload|edit)\.php/)){
        var input_bingo = $("<input>");
        input_bingo.attr({
            "type":"button",
            "name":"bingo_converter",
            "value":"BINGO",
            "style":"font-size: 11px; color: blue; margin-right: 3px",
        });
        input_bingo.click(function(){
            var old_text = $("#descr").val();
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
            $("#descr").val(new_text);
            //=========================================================================================================
            if (new_text.match("◎")){
                var T_title_array = new_text.match(/译\s*名\s*([^\/\n]+)(?:\/|\n)/);
                var O_title_array = new_text.match(/片\s*名\s*([^\/\n]+)(?:\/|\n)/);
                var ch_title="";
                var cat_area = "";
                if(T_title_array&&O_title_array){
                    if(new_text.match(/产\s*地\s*中国大陆\n/)){
                        ch_title = O_title_array[1]+" | ";
                        cat_area = 1;
                    }
                    else{
                        ch_title = T_title_array[1]+" | ";
                        if(new_text.match(/产\s*地\s*.*?香港.*?\n/)){
                           cat_area = 2;
                        }else if(new_text.match(/产\s*地\s*.*?台湾.*?\n/)){
                           cat_area = 3;
                        }else if(new_text.match(/产\s*地\s*韩国\n/)){
                           cat_area = 5;
                        }else if(new_text.match(/产\s*地\s*日本\n/)){
                           cat_area = 6;
                        }else if(new_text.match(/产\s*地\s*印度\n/)){
                           cat_area = 7;
                        }else {
                           cat_area = 4;
                        }
                    }
                }
                $("select[name='team_sel']").val(cat_area);
                var festival_array = new_text.match(/(\d{4})-\d{2}-\d{2}\((\S+电影节)\)/);
                var festival = "";
                if(festival_array){
                    festival = festival_array[1]+festival_array[2]+" | ";
                }
                var catagory_array = new_text.match(/类\s*别\s+([^\n]*)\s*\n/);
                var catagory = "";
                if(catagory_array){
                    catagory = catagory_array[1].replace(/\//g," / ")+" | ";
                }
                var doub_link_array = new_text.match(/豆瓣\s*链\s*接\s+([^\s\n]+)\s*\n/);
                if (doub_link_array){
                    $("input[name='douban']").val(doub_link_array[1]);
                }
                else{
                    $("input[name='douban']").val("");
                }
                var imdb_link_array = new_text.match(/IMDb\s*链\s*接\s+([^\s\n]+)\s*\n/i);
                if(imdb_link_array){
                    $("input[name='url'][type='text']").val(imdb_link_array[1]);
                }
                else{
                    $("input[name='url'][type='text']").val("");
                }
                var director_array = new_text.match(/导\s*演\s+([^\w\n\s]*)\s*/);
                var director="";
                if(director_array){
                    director=director_array[1];
                }
                var subtitle = ch_title+festival+catagory+director;
                $("input[name='small_descr']").val(subtitle);
                var cata_num=0;
                if(catagory.match('纪录')){
                    cata_num=402;
                }
                else if(catagory.match('动画')){
                    cata_num=403;
                }
                else if(catagory.match('秀')){
                    cata_num=405;
                }
                else if(new_text.match(/集\s*数\s+/g)){
                    cata_num=404;
                }
                else if(catagory!==""){
                    cata_num=401;
                }
               $("#browsecat").val(cata_num);
            }
            else{
                $("input[name='douban']").val("");
                $("input[name='url'][type='text']").val("");
                $("input[name='small_descr']").val("");
                $("#browsecat").val(0);
                $("select[name='team_sel']").val(0);
            }
            //=========================================================================================================
            var name_box = null;
            if(window.location.href.match(/upload\.php/)){
                name_box = $("#name");
            } else if(window.location.href.match(/edit\.php/)){
                name_box = $("input[name='name']");
            }
            name_box.val(name_box.val().replace(/\s+(?:mkv|mp4|iso|ts)\s*$/gi,""));
            name_box.val(name_box.val().replace(/^\[.*\]\s(\S)/gi,"$1"));
            var title = name_box.val();
            if(title!==""){
                if(title.match(/\W(?:remux)\W/gi)){
                    $("select[name='source_sel']").val(3);
                }
                else if(title.match(/\W(?:blu(?:e|\-)?ray|bdrip|dvdrip|webrip)\W/gi)){
                    $("select[name='source_sel']").val(6);
                }
                else if(title.match(/\Whdtv\W/gi)){
                    $("select[name='source_sel']").val(4);
                }
                else if(title.match(/\Wweb\-?dl\W/gi)){
                    $("select[name='source_sel']").val(5);
                }
                else {
                    $("select[name='source_sel']").val(15);
                }
            }
            var mediainfo_array = new_text.match(/\[hide\s*=\s*mediainfo\]\s*General[ \n]Unique ID[^\0]*?\[\/hide\]/gim);
            var chinese_sub = false;
            var english_sub = false;
            var chinese_dub = false;
            var cantonese_dub = false;
            if(mediainfo_array){
                var mediainfo = mediainfo_array[0];
                var subtitles = mediainfo.match(/Text.*?\nID[^\0]*?Forced.*?\n/gm);
                console.log(`${subtitles.length} subtitles`);
                if (subtitles){
                    subtitles.forEach((subtitle) => {
                        if (subtitle.match(/Language\s*:\s*Chinese/gi)){
                            console.log('zhongzi');
                            chinese_sub = true;
                            return;
                        } else if (subtitle.match(/Language\s*:\s*English/gi)) {
                            english_sub = true;
                            console.log('ensub');
                            return;
                        }
                    });
                }
                var dubs = mediainfo.match(/Audio.*?\nID[^\0]*?Forced.*?\n/gm);
                console.log(`${dubs.length} dubs`);
                if (dubs){
                    dubs.forEach((dub) => {
                        if (dub.match(/Cantonese/gi)) {
                            cantonese_dub = true;
                            console.log('yueyu');
                            return;
                        } else if (dub.match(/Chinese/gi)){
                            chinese_dub = true;
                            console.log('guoyu');
                            return;
                        }
                    })
                }
            }
            var zhongzi = document.getElementById('zhongzi');
            var ensub = document.getElementById('ensub');
            var guoyu = document.getElementById('guoyu');
            var yueyu = document.getElementById('yueyu');
            zhongzi.checked = chinese_sub;
            ensub.checked = english_sub;
            guoyu.checked = chinese_dub;
            yueyu.checked = cantonese_dub;
            $("#descr").focus();
            //=========================================================================================================
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
        td_1.append(input_bingo);
        tr_1.append(td_1);
        tbody_1.append(tr_1);
        table_1.append(tbody_1);
        $('#compose input[name="quote"]').closest('table').after(table_1);
    }
    var switcher = 0;
    if(window.location.href.match(/moresmilies\.php/)){
        switcher = 1;
    }
    $("a[href*='SmileIT']").click(function(){
        insert_tyt(this.getAttribute("href").match(/\[em\d+\]/)[0],switcher);
        return false;
    });
})();