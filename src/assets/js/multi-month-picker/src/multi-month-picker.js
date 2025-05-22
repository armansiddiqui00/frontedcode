(function ($) {
    'use strict';

    $.MultiMonthPicker = {
        VERSION: '1.0',
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    $.widget("oaksio.multiMonthPicker", {
        options: {
            monthFormat: 'yyyy-mm',
            value: [],
            index: '',
            currentyear:''
        },

        _value: function () {
            if (Array.isArray(this.options.value))
                this.options.value = new Set(this.options.value);
            else
                throw new Error('Invalid "value" option. It must be an array.');
        },

        _create: function () {
            this._value();
            this._currentYear = new Date().getFullYear();
            this._createElements();
            this._bindEvents();
            this._refresh();
        },

        _createElements: function () {
            $(this.element).attr("autocomplete", "off");

            this.wrapper = $("<div>", {
                class: "multi-month-picker"
            });
            this._createTable();
            this.wrapper.appendTo('body');
        },

        _createTable: function () {
            const $table = $("<table>");
            const $prev = this._createHeaderButton("Prev", "prev-button");
            const $next = this._createHeaderButton("Next", "next-button");
            const $year = this._createHeaderButton(this._currentYear, "year");
            const $thead = $("<thead>").append($("<tr>").append($prev, $year, $next));
            const $tbody = $("<tbody>");

            for (let i = 0; i < 4; i++) {
                const $tr = $("<tr>");
                for (let j = 0; j < 3; j++) {
                    const monthIndex = 3 * i + j;
                    const $td = $("<td>").html(this._createMonthButton(monthIndex));
                    $tr.append($td);
                }
                $tbody.append($tr);
            }

            $table.append($thead, $tbody);
            this.wrapper.append($table);
            this.wrapper.append(this._createFooterButton("text", ""));
        },

        _createHeaderButton: function (text, className) {
            return $("<th>").html($("<a>", { text, class: className }));
        },

        _createMonthButton: function (monthIndex) {
            return $("<a>", {
                text: $.MultiMonthPicker.months[monthIndex],
                class: "month-button",
                data: { monthIndex, value: this._format(this._currentYear, monthIndex) }
            });
        },

        _createFooterButton: function () {
           
            const $done = $("<button>", {
                text: "Done",
                class: "done-button"
            });
            const $clear = $("<button>", {
                text: "Clear",
                class: "clear-button"
            });
            return $("<div>", {
                class: "footer"
            }).append($done,$clear);
        },

        _bindEvents: function () {
            const that = this;

            this.wrapper.on('click', '.prev-button', function (e) {
                e.stopPropagation();
                that._currentYear--;
                that._refresh();
            });

            this.wrapper.on('click', '.next-button', function (e) {
                e.stopPropagation();
                that._currentYear++;
                that._refresh();
            });

           

           
                this.wrapper.on('click', '.month-button', function (e) {
                    e.stopPropagation();
                    const data = $(this).data('value');
                    const monthIndex = $(this).data('monthIndex');
                  //  console.log("monthindex",monthIndex)
                    if (that.options.value.has(data)) {
                        that.options.value.delete(data);
                    } else if( monthIndex > that.options.index){
                       
                        if(that._currentYear==that.options.currentyear || that._currentYear>=that.options.currentyear){
                            that.options.value.delete(data);
                        }else{
                            that.options.value.add(data);
                        }
                    }else if(monthIndex <= that.options.index && that._currentYear <= that.options.currentyear ){               
                        that.options.value.add(data);
                    }else if(monthIndex <= that.options.index && that._currentYear > that.options.currentyear){
                        that.options.value.delete(data);
                    }
                    that._refresh();
                });

                this.wrapper.on('click', '.month-button.disable', function (e) {
                    // e.stopPropagation();
                    // const data = $(this).data('value');
                    // if (that.options.value.has(data)) {
                    //     that.options.value.delete(data);
                    // } else {
                    //     that.options.value.add(data);
                    // }
                    that._refresh();
                });
            
         
                this.wrapper.on('click', '.done-button', function (e) {
                    e.stopPropagation();
                    that._close();
                });
            this.wrapper.on('click', '.clear-button', function (e) {
                e.stopPropagation();
                that.options.value.clear()
                that._refresh();
            });

           

            this.element.on('click', function (e) {
                e.stopPropagation();
                that._open();
            });

            $(document).on('click', function (event) {
                const widget = $(that.wrapper);
                if (!widget.is(event.target) && widget.has(event.target).length === 0) {
                    that._close();
                }
            });
        },

        _open: function () {
            const top = this.element.offset().top + this.element.height() + 7;
            const left = this.element.offset().left;

            $(this.wrapper).css({
                left: `${left}px`,
                top: `${top}px`
            });
            this.wrapper.addClass('show');
        },

        _close: function () {
            this.wrapper.removeClass('show');
        },

        _format: function (year, month) {
            const tokens = {
                'yyyy': year.toString(),
                'yy': year.toString().slice(-2),
                'mmm': $.MultiMonthPicker.months[month],
                'mm': `${month + 1}`.padStart(2, '0'),
                'm': `${month + 1}`
            };

            return this.options.monthFormat.replace(/yyyy|yy|mmm|mm|m/g, function (match) {
                return tokens[match];
            });
        },

        _refresh: function () {
            const that = this;
            this.wrapper.find('.year').html(this._currentYear);
            
            this.wrapper.find('.month-button').each(function () {
                
                const monthIndex = $(this).data('monthIndex');
                const data = {
                    monthIndex: monthIndex,
                    value: that._format(that._currentYear, monthIndex)
                };
                
                $(this).data(data).removeClass('active');
               
                if (that.options.value.has(data.value)) {
                    $(this).addClass('active');
                }
                else if ( monthIndex > that.options.index){
                    
                    if(that._currentYear==that.options.currentyear || that._currentYear >= that.options.currentyear){
                        $(this).data(data).addClass('disable');
                       // console.log('IncurrentYear',that._currentYear)
                   // console.log('Infullyear',that.options.currentyear)
                    }
                    else{
                        $(this).data(data).removeClass('disable');
                    }
                   
                }else if(monthIndex <= that.options.index){
                    if( that._currentYear > that.options.currentyear){
                        $(this).data(data).addClass('disable');
                    }else{
                        $(this).data(data).removeClass('disable');
                    }
                }
               
                
               
            });

            this.element.val(Array.from(this.options.value).join(', '));
        },

        destroy: function () {
            this.element.removeAttr("autocomplete");
            this.wrapper.remove();
        },

        value: function () {
            return Array.from(this.options.value);
        }
    });
})(jQuery);
