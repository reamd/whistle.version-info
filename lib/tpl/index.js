const options = parseUrl(url);

// 第2步 html
rules.push(`${options.host} html://{plugin-html}`);
values['plugin-html'] = `
<!-- 以下为whistle插件自动生成 -->
<div id="version">
    <ul id="version-desc">
        <li>
            版本：未知
        </li>
        <li>
            环境：未知
        </li>
        <li>
            分支：未知
        </li>
        <li>
            服务器IP：未知
        </li>
    </ul>
    <span class="version-close">x</span>
</div>
<style>
#version {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 240px;
    height: 108px;
    color: #ffffff;
    background-color: rgba(0,9,26,.8);
    display: none;
}
#version-desc {
    padding: 10px;

    --duration: 11;
    --delay: 6;
    --hue-1: 100;
    --hue-2: 147;
    --hue-3: 219;
    --alpha-1: 0.13109462719449483;
    --alpha-2: 0.4809489268013014;
    --alpha-3: 0.5875160443609215;

    -webkit-box-flex: 1;
    flex: 1;
    --color-one: hsla(var(--hue-1), 100%, 50%, var(--alpha-1));
    --color-two: hsla(var(--hue-2), 100%, 50%, var(--alpha-2));
    --color-three: hsla(var(--hue-3), 100%, 50%, var(--alpha-3));
    background-image: -webkit-gradient(linear, left bottom, left top, from(transparent), color-stop(10%, var(--color-one)), color-stop(transparent), color-stop(40%, var(--color-two)), color-stop(transparent), color-stop(60%, var(--color-three)));
    background-image: linear-gradient(0deg, transparent, var(--color-one) 10%, transparent, var(--color-two) 40%, transparent, var(--color-three) 60%);
    background-size: 100% 40vmax;
    background-position: center bottom;
    background-repeat: no-repeat;
    -webkit-animation: shift calc(var(--duration, 2) * 1s) calc(var(--delay, 0) * -1s) infinite ease;
    animation: shift calc(var(--duration, 2) * 1s) calc(var(--delay, 0) * -1s) infinite ease;
}
#version .version-close {
    position: absolute;
    cursor: pointer;
    top: 0;
    right: 0;
    padding: 3px 10px;
    color: #5ade6a;
}
</style>
<script>
(function(){
    var versionDom =  document.querySelector('#version');
    var sKey= 'HIDE_VERSION_';
    function showVersionControl() {
        var sVal = localStorage.getItem(sKey);
        if (sVal === 'true') {
            versionDom.style="display: none;";
        } else {
            versionDom.style="display: block;";
        }
    }
    function updateVersionInfo(obj) {
        if (obj) {
            document.querySelector('#version-desc').innerHTML="<li>版本：" + obj.version + "<span style='color: #d2aa18;'>(" + (obj.lastVersion === obj.version? '最新版': (obj.lastVersion + '<span style="color: #d86060;text-shadow:1px 0 1px #8B4513, 0 1px 1px #8B4513, 0 -1px 1px #8B4513, -1px 0 1px #8B4513;">new</span>')) + ")</span></li><li>环境：" + obj.env + "&nbsp;&nbsp;<a href='http://127.0.0.1:" + obj.port + "' target='_blank'>" + "切换</a></li><li>分支：" + obj.branch + "</li><li>服务器IP：" + obj.serverIp + "</li>";    
            return;
        }
    }
    function bindEvt() {
        document.querySelector('#version').querySelector('.version-close').addEventListener('click', function() {
            localStorage.setItem(sKey, 'true');
            setTimeout(function(){
                showVersionControl();
            });
        });
    }
    function ajax(param) {
       var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
       var type = (param.type || 'get').toUpperCase();
       var url = param.url;
       if (!url) {
         return
       }
       var data = param.data,
         dataArr = [];
       for (var k in data) {
         dataArr.push(k + '=' + data[k]);
       }
       dataArr.push('_=' + Math.random());
       var setHeader = function(headerMap) {
           for (var vKey in headerMap) {
                 xhr.setRequestHeader(vKey, headerMap[vKey]);
           }
       };
       if (type == 'GET') {
         url = url + '?' + dataArr.join('&');
         xhr.open(type, url);
         if (param.header)  {
            setHeader(param.header);
         }
         xhr.send();
       } else {
        xhr.open(type, url);
        if (param.header)  {
            setHeader(param.header);
        }
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(dataArr.join('&'));
       }
       xhr.onload = function() {
       if (xhr.status == 200 || xhr.status == 304) {
         var res;
         if (param.success && param.success instanceof Function) {
          res = xhr.responseText;
          if (typeof res === 'string') {
            res = JSON.parse(res);
            param.success.call(xhr, res);
          }
        }
       }
      };
    };
    function getLocalVersion() {
        ajax({
            type: 'get',
            url: '/p/version.json',
            success: function(res) {
                getRemoteVersion(res);
            }
        })
    }
    function getRemoteVersion(obj) {
        ajax({
            type: 'get',
            header:{
                'replace-host': obj.cos || 'remote'
            },
            url: ('/' + obj.branch + '/version.json'),
            success: function(res) {
                var serverIp = res.serverIp || '${serverIp}';
                updateVersionInfo(Object.assign(obj, { env: res.envMap[serverIp] || '未知', lastVersion: res.version, serverIp, port: res.whistlePort }));
                sKey += (obj.branch+ '_' + serverIp);
                showVersionControl();
            }
        })
    }

    if(versionDom) {
        bindEvt();
        getLocalVersion();
    }
})();
</script>
`;
