/**
 * ------------------------------------------------------------
 * Draggable  拖拽
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../base/component.js');
var template = require('text!./draggable.html');
var _ = require('../base/util.js');

var dragDrop = require('./dragDrop.js');

/**
 * @class Draggable
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {string|HTMLElement|function='auto'}  options.data.image               => 拖拽时的图像
 * @param {string}                  options.data.effect              => 效果
 * @param {object}                  options.data.data                => 拖拽时需要传递的数据
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 */
var Draggable = Component.extend({
    name: 'draggable',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            image: 'auto',
            effect: undefined,
            data: null
        });
        this.supr();
    },
    _getImage: function() {
        if(typeof this.data.image === 'function')
            return this.data.image();
        else if(this.data.image instanceof HTMLElement)
            return this.data.image;
        else if(this.data.image === 'auto')
            return null;
        else if(this.data.image === 'self')
            return this.$refs.self;
        else if(this.data.image === 'empty') {
            var empty = document.createElement('span');
            empty.innerHTML = '&nbsp;';
            empty.style.position = 'fixed';
            empty.style.left = '-5000px;'
            document.body.appendChild(empty);
            return empty;
        }
    },
    _onDragStart: function($event) {
        var e = $event.event;

        // 处理DataTransfer
        var image = this._getImage();
        if(image)
            e.dataTransfer.setDragImage(image, 0, 0);
        if(this.data.effect)
            e.dataTransfer.effectAllowed = this.data.effect;

        dragDrop.data = this.data.data;
        dragDrop.screenX = e.clientX;
        dragDrop.screenY = e.clientY;

        // emit事件
        var eventData = _.extend(_.extend({
            data: dragDrop.data
        }, $event), e);
        this.$emit('dragstart', eventData);
    },
    _onDrag: function($event) {
        var e = $event.event;

        // 拖拽结束时会监听到一个都为0的事件
        if(e.clientX === 0 && e.clientY === 0 && e.screenX === 0 && e.screenY === 0)
            return;

        dragDrop.movementX = e.clientX - dragDrop.screenX;
        dragDrop.movementY = e.clientY - dragDrop.screenY;
        dragDrop.screenX = e.clientX;
        dragDrop.screenY = e.clientY;

        // emit事件
        var eventData = _.extend(_.extend({
            data: dragDrop.data,
            movementX: dragDrop.movementX,
            movementY: dragDrop.movementY
        }, $event), e);
        this.$emit('drag', eventData);
    },
    _onDragEnd: function($event) {
        var e = $event.event;

        dragDrop.data = null;

        var eventData = _.extend(_.extend({}, $event), e);
        this.$emit('dragend', eventData);
    }
});

Draggable.Image = Component.extend({
    name: 'draggable.image',
    template: '<div ref="self">{#inc this.$body}</div>',
    node: _.noop,
    init: function() {
        if(this.$outer instanceof Draggable) {
            var self = this.$refs.self;
            self.style.position = 'fixed';
            self.style.left = '-5000px;'
            document.body.appendChild(self);
            this.$outer.data.image = self;
        }
    }
})

module.exports = Draggable;