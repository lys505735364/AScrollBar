(function (window, document, Math) {
    function AScroll(dom, option) {
        this.barWidth = 5; // 滚动条宽度
        this.direction = 'x,y'; // 滚动方向
        this.wheelDis = 15; // 滚动距离
        this.hotTimer = null; // 用于监听窗口变动的定时器
        this.horizontalBar = null;
        this.verticalBar = null;
        this.hotRefresh = false;
        this.style = null;
        this.oRadius = null;
        this.iRadius = null;
        this.zIndex = 500;
        this.initXBar = function () {
            this.horizontalBar = '<div class="Ax-scrollBar"><div class="Ax-scrollBar-item scrollBar-item"></div></div>';
            return this.horizontalBar
        }
        this.initYBar = function () {
            this.verticalBar = '<div class="Ay-scrollBar"><div class="Ay-scrollBar-item scrollBar-item" style=""></div></div>';
            return this.verticalBar;
        }
        this.initStyle = function () {
            this.style = '<style>' +
                '.Ay-scrollBar {position: absolute;height: 100%;width:' + this.barWidth + 'px;right: 0px;border-radius:' + this.oRadius + 'px;background:rgba(255,255,255,.5);z-index: 500;}' +
                '.Ax-scrollBar {position: absolute;width: 100%;height:' + this.barWidth + 'px;bottom: 0px;border-radius: ' + this.oRadius + 'px;background:rgba(255,255,255,.5);z-index: 500;}' +
                '.Ax-scrollBar-item {position:absolute;height:100%;width:100%;left:0px;border-radius:' + this.iRadius + 'px;background:#333;}' +
                '.Ay-scrollBar-item {position:absolute;height:100%;width:100%;top:0px;border-radius:' + this.iRadius + 'px;background:#333;}' +
                '</style>';
            return this.style;
        }
        this.clearHotTimer = function () {
            clearInterval(this.hotTimer)
        }
        this.startHotTimer = function () {
            if (this.hotRefresh) {
                this.hotTimer = setInterval(function () {
                    this.refresh();
                }.bind(this), 60)
            }
        }
        // 用于绑定鼠标事件
        this.eventBainding = function () {
            var _self = this;
            this.startHotTimer();
            $(dom).on('mousedown', '.scrollBar-item', function (event) {
                _self.clearHotTimer()
                var e = event || window.event;
                var direction = null;
                var scrollBoxDiv = $(dom).find('.A-scrollBox'); // 内容元素块

                var xBarBoxWidth = $(dom).width(); // 可视区宽度 && 横向滑块容器宽度
                var yBarBoxWidth = $(dom).height(); // 可视区高度 && 横向滑块容器高度

                var contentWidth = scrollBoxDiv[0].scrollWidth; // 被包裹的内容区域真实宽度
                var contentHeight = scrollBoxDiv[0].scrollHeight; // 被包裹的内容区域真实高度

                var xScrollDis = parseInt(contentWidth - xBarBoxWidth - _self.barWidth); //内部横向可滑动距离
                var yScrollDis = parseInt(contentHeight - yBarBoxWidth - _self.barWidth); // 内部纵向可滑动距离

                var xBarWidth = parseInt(xBarBoxWidth * parseFloat((xBarBoxWidth + _self.barWidth) / contentWidth)); // 小滑动块的宽度
                var yBarHeight = parseInt(yBarBoxWidth * parseFloat((yBarBoxWidth + _self.barWidth) / contentHeight)); // 小滑动块的高度

                var xBarScrollDis = xBarBoxWidth - xBarWidth; // 小滑块横向可活动范围
                var yBarScrollDis = yBarBoxWidth - yBarHeight; // 纵向小滑块可活动范围

                if ($(this).hasClass("Ay-scrollBar-item")) {
                    direction = "0";
                } else if ($(this).hasClass("Ax-scrollBar-item")) {
                    direction = "1";
                }
                var barItemDiv = $(this);
                var contentDIv = $(dom).find('.A-scrollBox')
                var oPointX = e.clientX - this.offsetLeft;
                var oPonetY = e.clientY - this.offsetTop;

                function moveScrollBar(e) { // 鼠标按下后移动事件
                    var e = e || window.event;
                    var nPointX = e.clientX;
                    var nPointY = e.clientY;
                    var disX = nPointX - oPointX; // 小滑块被拖动后横向位置(相对于父元素左边)
                    var disY = nPointY - oPonetY; // 小滑块被拖动后纵向位置(相对于父元素顶部)
                    // 错误位置纠正
                    disX = disX < 0 ? 0 : disX > xBarScrollDis ? xBarScrollDis : disX;
                    disY = disY < 0 ? 0 : disY > yBarScrollDis ? yBarScrollDis : disY;

                    switch (direction) {
                        case '0':
                            barItemDiv.css({
                                top: disY + 'px'
                            });
                            contentDIv.css({
                                top: -(yScrollDis * parseFloat((disY / yBarScrollDis))) + 'px'
                            })
                            break;
                        case '1':
                            barItemDiv.css({
                                left: disX + 'px'
                            });
                            contentDIv.css({
                                left: -(xScrollDis * parseFloat((disX / xBarScrollDis))) + 'px'
                            })
                            break;
                    }

                }

                function distoryMouseEvent() {
                    document.removeEventListener('mousemove', moveScrollBar, false);
                    document.removeEventListener('mouseup', distoryMouseEvent, false);
                    _self.startHotTimer()
                }
                if (window.addEventListener) {
                    document.addEventListener('mousemove', moveScrollBar, false);
                    document.addEventListener('mouseup', distoryMouseEvent, false);
                }
                // $(dom)[0].onmouseout = function () {
                //     $(dom)[0].onmousemove = null;
                //     $(dom)[0].onmouseup = null;
                // }
                // $(dom).find('.scrollBar-item')[0].onmouseout = function (e) {
                //     var e = e || window.event;
                //     e.stopPropagation();
                // }
                return false;
            });

            function scrollFunc(event) {
                var e = event || window.event;
                var direction = _self.wheelDis;
                var dis = 0;
                var scrollBoxDiv = $(dom).find('.A-scrollBox'); // 内容元素块

                var yBarBoxWidth = $(dom).height(); // 可视区高度 && 小滑块容器宽度

                var positionY = parseFloat(scrollBoxDiv.css('top')); // 现在的纵向偏移量

                var contentHeight = scrollBoxDiv[0].scrollHeight;; // 内容区域高度

                var yScrollDis = parseInt(contentHeight - yBarBoxWidth - _self.barWidth); // 内部纵向可滑动距离

                var yBarHeight = parseInt(yBarBoxWidth * parseFloat((yBarBoxWidth + _self.barWidth) / contentHeight)); // 小滑动块的高度

                var yBarScrollDis = yBarBoxWidth - yBarHeight; // 纵向小滑块可活动范围

                if (e.wheelDelta) { //判断浏览器IE，谷歌滑轮事件              
                    if (e.wheelDelta > 0) { //当滑轮向上滚动时
                        direction = _self.wheelDis;
                    }
                    if (e.wheelDelta < 0) {
                        direction = -1 * _self.wheelDis;
                    }
                } else if (e.detail) {
                    if (e.detail > 0) {
                        direction = -1 * _self.wheelDis;
                    }
                    if (e.detail < 0) {
                        direction = _self.wheelDis;
                    }
                }
                dis = $(dom).find('.A-scrollBox')[0].offsetTop + direction;
                if (-dis < yScrollDis && -dis > 0) {
                    dis = -dis;
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    } else if (window.event) {
                        window.event.cancelBubble = true;
                    }
                } else if (-dis >= yScrollDis) {
                    dis = yScrollDis;
                } else if (-dis <= 0) {
                    dis = 0
                }
                console.log(dis, yScrollDis)
                $(dom).find('.A-scrollBox').css({
                    top: -dis + 'px'
                });
                $(dom).find('.Ay-scrollBar-item').css({
                    top: yBarScrollDis * parseFloat(dis / (yScrollDis == 0 ? 1 : yScrollDis)) + 'px'
                });
            }
            /*IE、Opera注册事件*/
            if (document.attachEvent) {
                $(dom)[0].attachEvent('onmousewheel', scrollFunc);
            }
            //Firefox使用addEventListener添加滚轮事件  
            if (document.addEventListener) { //firefox  
                $(dom)[0].addEventListener('DOMMouseScroll', scrollFunc, false);
            }
            //Safari与Chrome属于同一类型
            $(dom)[0].onmousewheel = scrollFunc;
        }
        // 用于处理窗口大小变动 调整DOM位置
        this.refresh = function () {
            var scrollBoxDiv = $(dom).find('.A-scrollBox'); // 内容元素块

            var xBarBoxWidth = $(dom).width(); // 可视区宽度 && 横向滑块容器宽度
            var yBarBoxWidth = $(dom).height(); // 可视区高度 && 纵向滑块容器高度

            var positionX = parseFloat(scrollBoxDiv.css('left')); // 现在的横向偏移量
            var positionY = parseFloat(scrollBoxDiv.css('top')); // 现在的纵向偏移量

            var contentWidth = scrollBoxDiv[0].scrollWidth; // 被包裹的内容区域真实宽度
            var contentHeight = scrollBoxDiv[0].scrollHeight; // 被包裹的内容区域真实高度

            var xScrollDis = parseInt(contentWidth - xBarBoxWidth - this.barWidth); //内部横向可滑动距离
            var yScrollDis = parseInt(contentHeight - yBarBoxWidth - this.barWidth); // 内部纵向可滑动距离

            var xBarWidth = parseInt(xBarBoxWidth * parseFloat((xBarBoxWidth + this.barWidth) / contentWidth)); // 小滑动块的宽度
            var yBarHeight = parseInt(yBarBoxWidth * parseFloat((yBarBoxWidth + this.barWidth) / contentHeight)); // 小滑动块的高度

            var xBarScrollDis = xBarBoxWidth - xBarWidth; // 小滑块横向可活动范围
            var yBarScrollDis = yBarBoxWidth - yBarHeight; // 纵向小滑块可活动范围

            positionX = -positionX > xScrollDis ? -xScrollDis : positionX; // 纠正超出的距离
            positionY = -positionY > yScrollDis ? -yScrollDis : positionY; // 纠正超出的距离

            var barPositionX = positionX == 0 ? 0 : xBarScrollDis * parseFloat(-positionX / xScrollDis); //横向小滑块位置纠正
            var barPositionY = positionY == 0 ? 0 : yBarScrollDis * parseFloat(-positionY / yScrollDis); //纵向小滑块位置纠正

            // 调整内容容器位置及小滑块容器的位置
            switch (this.direction) {
                case 'x':
                    $(dom).find('.Ax-scrollBar-item').css({
                        width: xBarWidth + 'px',
                        left: barPositionX + 'px'
                    }).parent().css({
                        'width': xBarBoxWidth + 'px',
                        'display': xScrollDis ? 'block' : 'none'
                    });
                    scrollBoxDiv.css({
                        left: positionX + 'px'
                    });
                    break;
                case 'y':
                    $(dom).find('.Ay-scrollBar-item').css({
                        height: yBarHeight + 'px',
                        top: barPositionY + 'px'
                    }).parent().css({
                        'height': yBarBoxWidth + 'px',
                        'display': yScrollDis ? 'block' : 'none'
                    });
                    scrollBoxDiv.css({
                        top: positionY + 'px'
                    });
                    break;
                case 'x,y':
                    $(dom).find('.Ax-scrollBar-item').css({
                        width: xBarWidth + 'px',
                        left: barPositionX + 'px'
                    }).parent().css({
                        width: xBarBoxWidth + 'px',
                        'display': xScrollDis ? 'block' : 'none'
                    });
                    $(dom).find('.Ay-scrollBar-item').css({
                        height: yBarHeight + 'px',
                        top: barPositionY + 'px'
                    }).parent().css({
                        height: yBarBoxWidth + 'px',
                        'display': yScrollDis ? 'block' : 'none'
                    });
                    scrollBoxDiv.css({
                        left: positionX + 'px'
                    });
                    scrollBoxDiv.css({
                        top: positionY + 'px'
                    });
                    break;
            }
        }
        this.destory = function () { }
        // 初始化配置参数
        if (dom && $(dom).length == 1) {
            if (option) {
                this.barWidth = option.barWidth ? option.barWidth : 5;
                this.direction = option.position ? option.position : 'x,y';
                this.wheelDis = option.wheelDis ? option.wheelDis : 15;
                this.hotRefresh = option.hotRefresh ? option.hotRefresh : false;
                var radius = this.barWidth % 2 == 1 ? parseInt(this.barWidth / 2, 10) : parseInt(this.barWidth / 2, 10);
                this.oRadius = option.oRadius ? option.oRadius : radius;
                this.iRadius = option.iRadius ? option.iRadius : radius;
            }
            // 注入样式
            $('head').append(this.initStyle());
            // 将外框设置为 position: ralative
            $(dom).css({
                "position": $(dom).css("position") == "static" ? "relative" : $(dom).css("position"),
                'padding-right': this.barWidth + 'px',
                'padding-bottom': this.barWidth + 'px',
                'overflow': 'hidden'
            });
            // 改变DOM结构
            if (!($(dom).children().hasClass("A-scrollBox"))) {
                $(dom).wrapInner('<div class="A-scrollBox" style="position:absolute;width:100%;height:100%;z-index: 500;"></div>');
                switch (this.direction) {
                    case 'x':
                        $(dom).append(this.initXBar());
                        break;
                    case 'y':
                        $(dom).append(this.initYBar());
                        break;
                    case 'x,y':
                        $(dom).append(this.initXBar() + this.initYBar());
                        break;
                }
            }
            this.refresh();
            this.eventBainding();
        } else {
            console.error('初始化失败:未找到$(:' + dom + '") 元素,或该元素不唯一.')
        }
    }
    if (typeof module != 'undefined' && module.exports) {
        module.exports = AScroll;
    } else if (typeof define == 'function' && define.amd) {
        define(function () {
            return AScroll;
        });
    } else {
        window.AScroll = AScroll;
    }
})(window, document, Math);