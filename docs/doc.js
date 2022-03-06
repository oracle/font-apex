/* global fa */

var fontapex = fontapex || {};

//foreach for nodeList in IE
NodeList.prototype.forEach = Array.prototype.forEach;

fontapex.$ = function( selector ){
    var Sel = function ( selector ) {
        var selected = [];

        if ( typeof selector === 'string' ) {
            selected = document.querySelectorAll( selector );
        } else {
            selected.push( selector );
        }

        this.elements = selected;
        this.length = this.elements.length;

        return this;
    };

    Sel.prototype = {

        addClass: function ( cl ) {
                    // remove multiple spaces
                    var str = cl.replace(/ +(?= )/g,''),
                        classArray = str.split( ' ' );

                    this.elements.forEach( function ( elem ) {
                        classArray.forEach( function ( c ) {
                            if ( c ) {
                                elem.classList.add( c );
                            }
                        })

                    });
                    return this;
        },

        removeClass: function ( cl ) {

                        var removeAllClasses = function ( el ) {
                            el.className = '';
                        };

                        var removeOneClass = function ( el ) {
                            el.classList.remove( cl );
                        };

                        var action = cl ? removeOneClass : removeAllClasses;

                        this.elements.forEach( function ( elem ) {
                            action( elem );
                        });

                        return this;
        },

        getClass: function () {
                    return this.elements[0].classList.value;
        },

        on: function ( eventName, func ) {
                this.elements.forEach( function( elem ){
                    elem.addEventListener( eventName, func );
                });

                return this;
        },

        val: function () {
                var val = '';
                this.elements.forEach( function ( elem ) {
                    switch ( elem.nodeName ) {
                        case 'INPUT':
                            if ( elem.checked ) {
                                val = elem.value;
                            }
                            break;

                        case 'SELECT':
                            val = elem.options[ elem.selectedIndex ].value;
                            break;
                    }
                });

                return val;
        },

        text: function ( t ) {
                if ( t ) {
                    this.elements.forEach( function ( elem ) {
                        elem.textContent = t;
                    });
                }

                return this;
        },

        html: function ( h ) {
                var html;

                if ( typeof h === 'string') {
                    this.elements.forEach( function ( elem ) {
                        elem.innerHTML = h;
                    });
                    return this;
                } else {
                    this.elements.forEach( function ( elem ) {
                        html = elem.innerHTML;
                    });
                    return html;
                }
        },

        parent: function () {
                    var p;
                    this.elements.forEach( function ( elem ) {
                        p = new Sel( elem.parentNode );
                    });

                    return p;
        },

        hide: function () {
                this.elements.forEach( function ( elem ) {
                    elem.style.display = 'none';
                });

                return this;
        },

        show: function ( t ) {
                this.elements.forEach( function ( elem ) {
                    elem.style.display = null;
                });

                return this;
        }

    };

    return new Sel( selector );
};

(function( fa ){

    var $ = fa.$,
        L = 'LARGE',
        S = 'SMALL',
        CL_LARGE = 'force-fa-lg',
        wLocation = window.location,
        currentIcon = wLocation.hash.replace( '#', '' ) || 'fa-apex',
        //isLarge = wLocation.search.indexOf( L ) > -1,
        isLarge,
        timeout,
        apexIcons,
        apexIconKeys,
        flattened = [],
        icons$ = $( '#icons' );

    var _isLarge = function(value){
        if(value){
            try{
                localStorage.setItem("large.fontapex",value);
            }catch(e){
                isLarge = value;
            }
        }else{
            try{
                return localStorage.getItem("large.fontapex") || "false";
            }catch(e){
                if (isLarge){
                    return isLarge;
                }else{
                    isLarge = "false";
                    return isLarge;
                }
            }
        }
    }

    var isPreviewPage = function () {
      return $( '#icon_preview' ).length > 0 ;
    };

    var highlight = function (txt, str) {
        return txt.replace(new RegExp("(" + str + ")","gi"), '<span class="highlight">$1</span>');
    };

    var renderIcons = function( opts ){
        var output;

        clearTimeout(timeout);
        var debounce = opts.debounce || 50,
            key = opts.filterString || '',
            keyLength = key.length;

        key = key.toUpperCase().trim();

        var assembleHTML = function (resultSet, iconCategory) {
            var size = _isLarge() === 'true' ? L : S,
                getEntry = function ( cl ) {
                    return '<li>' +
                        '<a class="dm-Search-result" href="docs/icon.html'/*  + '?' + size */ + '#' + cl + '">' +
                        '<div class="dm-Search-icon">' +
                        '<span class="t-Icon fa '+ cl +'" aria-hidden="true"></span>' +
                        '</div>' +
                        '<div class="dm-Search-info">' +
                        '<span class="dm-Search-class">'+ cl +'</span>' +
                        '</div>' +
                        '</a>' +
                        '</li>';
                };

            if (iconCategory) { // keywords is not provided, show everything
                output = output + '<div class="dm-Search-category">';
                output = output + '<h2 class="dm-Search-title">' + iconCategory.replace(/_/g,' ').toLowerCase()+ ' Icons</h2>';
                output = output + '<ul class="dm-Search-list">';
                resultSet.forEach(function(iconClass){
                    output = output + getEntry( iconClass.name );
                });
                output = output + '</ul>';
                output = output + '</div>';
            } else {
                if (resultSet.length > 0) {
                    resultSet.forEach(function (iconClass) {
                        output = output + getEntry( iconClass.name );
                    });
                }
            }
        };

        var search = function () {
            if (key.length === 1) {
                return;
            }

            var resultSet = [],
                resultsTitle = '';

            output = '';

            if (key === '') { // no keywords provided, display all icons.
                apexIconKeys.forEach(function(iconCategory){
                    resultSet = apexIcons[iconCategory].sort(function (a, b) {
                        if (a.name < b.name) {
                            return -1;
                        } else if (a.name > b.name) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }); // no keywords, no search. Just sort.
                    assembleHTML(resultSet, iconCategory);
                });
            } else {
                resultSet = flattened.filter(function(curVal){
                    var name     = curVal.name.toUpperCase().slice(3), // remove the prefix 'fa-'
                        nameArr,
                        filters  = curVal.filters ? curVal.filters.toUpperCase() : '',
                        filtersArr,
                        firstXletters,
                        rank = 0,
                        i, filterArrLen, j, nameArrLen;

                    if (key.indexOf(' ') > 0) {
                        key = key.replace(' ', '-');
                    }

                    if (name.indexOf(key) >= 0) {
                        // convert names to array for ranking
                        nameArr = name.split('-');
                        nameArrLen = nameArr.length;
                        // rank: doesn't have "-"
                        if (name.indexOf('-') < 0) {
                            rank += 1000;
                        }
                        // rank: matches the whole name
                        if (name.length === keyLength) {
                            rank += 1000;
                        }
                        // rank: matches partial beginning
                        firstXletters = nameArr[0].slice(0, keyLength);
                        if (firstXletters.indexOf(key) >= 0) {
                            rank += 1000;
                        }
                        for (j = 0; j < nameArrLen; j++) {
                            if (nameArr[j]) {
                                if (nameArr[j].indexOf(key) >= 0) {
                                    rank += 100;
                                }
                            }
                        }
                        curVal.rank = rank;
                        return true;
                    }

                    // convert words in filters to array
                    filtersArr = filters.split(',');
                    filterArrLen = filtersArr.length;
                    // keywords matches in filters field.
                    for (i = 0; i < filterArrLen; i ++) {
                        firstXletters = filtersArr[i].slice(0, keyLength);
                        if (firstXletters.indexOf(key) >= 0) {
                            curVal.rank = 1;
                            return true;
                        }
                    }
                });

                resultSet.sort(function (a, b) {
                    var ar = a.rank,
                        br = b.rank;
                    if (ar > br) {
                        return -1;
                    } else if (ar < br) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                assembleHTML(resultSet);

                // search results UI doesn't require category title
                resultsTitle = resultSet.length === 0 ? 'No results' : resultSet.length + ' Results';
                output = '<div class="dm-Search-category">' +
                    '<h2 class="dm-Search-title">' + resultsTitle + '</h2>' +
                    '<ul class="dm-Search-list">' +
                    output +
                    '</ul>';
                output = output + '</div>';
            }

            // finally add output
            document.getElementById( 'icons' ).innerHTML = output;
        };

        timeout = setTimeout(function() {
            search();
        }, debounce);
    };

    var toggleSize = function ( that, affected ) {
        that.checked = true;
        if ( that.value === L ) {
            affected.addClass( CL_LARGE );
            //isLarge = true;
            _isLarge('true');
        } else {
            affected.removeClass( CL_LARGE );
            _isLarge('false');
        }
    };

    var downlodSVGBtn = function () {
        $( 'button.pv-Button' ).on( 'click', function () {
            var size = _isLarge() === 'true' ? L.toLowerCase() : S.toLowerCase();
            window.open( '../svgs/' + size + '/' + currentIcon.replace( 'fa-', '' ) + '.svg' );
        });
    };
    var downlodPNGBtn = function () {
        $( 'button.pv-Buttontwo' ).on( 'click', function () {
            var size = _isLarge() === 'true' ? L.toLowerCase() : S.toLowerCase();
            window.open( '../pngs/' + size + '/' + currentIcon.replace( 'fa-', '' ) + '.png' );
        });
    };
    var downlodEPSBtn = function () {
        $( 'button.pv-Buttonthree' ).on( 'click', function () {
            var size = _isLarge() === 'true' ? L.toLowerCase() : S.toLowerCase();
            window.open( '../epss/' + size + '/' + currentIcon.replace( 'fa-', '' ) + '.eps' );
        });
    };
    var downlodGIFBtn = function () {
        $( 'button.pv-Buttonfour' ).on( 'click', function () {
            var size = _isLarge() === 'true' ? L.toLowerCase() : S.toLowerCase();
            window.open( '../gifs/' + size + '/' + currentIcon.replace( 'fa-', '' ) + '.gif' );
        });
    };

    var renderIconPreview = function() {
        var iconPreview$        = $( '#icon_preview' ),
            iconHTML,
            iconSize            = $( '[name="icon_size"]' ).val(),
            iconScale           = $( '[name="icon_scale"]' ).val(),
            iconAnimation       = $( '[name="icon_animation"]' ).val(),
            iconRotate          = $( '[name="icon_rotate"]' ).val(),
            iconModifier        = $( '[name="icon_modifier"]' ).val(),
            iconsModiferStatus$ = $( '[name="icon_modifier_status"]' ),
            iconsMSParent$      = iconsModiferStatus$.parent(), // for hide/show depending on modifer status
            iconModifierStatus  = iconsModiferStatus$.val();

        if ( !iconModifier ) {
            iconsMSParent$.hide();
            iconModifierStatus = '';
        } else {
            iconsMSParent$.show();
        }

        var iconClasses         = 'fa' + ' ' + currentIcon + ' ' + iconSize + ' ' + iconScale + ' ' + iconAnimation + ' ' + iconRotate + ' ' + iconModifier + ' ' + iconModifierStatus,
            iconClassesPreview  = 'fa' + ' ' + currentIcon + ' ' + iconScale + ' ' + iconAnimation + ' ' + iconRotate + ' ' + iconModifier + ' ' + iconModifierStatus;

        $( '#icon_preview [data-icon]' )
            .removeClass()
            .addClass( iconClasses );

        // Remove the icon size modifier as the previews already show
        $( '.dm-Previews [data-icon]' )
            .removeClass()
            .addClass( iconClassesPreview );

        iconHTML = iconPreview$.html().replace( ' data-icon=""', '' );

        // todo output classes to the page UI display
        $( '#icon_code' ).text( iconHTML );
        $( '#icon_classes' ).text( iconClasses );

        // output character code
        var iconString = window.getComputedStyle(document.querySelector('#icon_preview [data-icon]'), ':before').getPropertyValue('content');
        var iconChar = '\\' + iconString.charCodeAt(1).toString(16);
        $( '#icon_char').text( iconChar );

        _isLarge( iconSize === 'fa-lg');
    };


    // Init Page
    /*if (localStorage.getItem("large.fontapex") === 'true'){
        $( '#icon_size_large' ).checked = true;
    } else {
        $( '#icon_size_small' ).checked = true;
    }*/


    $( 'a.dm-Header-logoLink' ).on( 'click', function ( e ) {
        var url = this.href,
            size = _isLarge() === 'true' ?  L : S;
        this.href = url;// + '?' + size;
    });

    if ( isPreviewPage() ) {
        if ( _isLarge() === 'true' ){
            document.getElementById( 'icon_size_large' ).checked = true;
            icons$.addClass( CL_LARGE );
        } else {
            document.getElementById( 'icon_size_small' ).checked = true;
            icons$.removeClass( CL_LARGE );
        }

        if ( currentIcon ) {
            $( '.dm-Icon-name' )
                .text( currentIcon );

            $( '[data-icon]' )
                .removeClass( 'fa-apex' )
                .addClass( currentIcon );

            renderIconPreview();
            downlodSVGBtn();
            downlodPNGBtn();
            downlodEPSBtn();
            downlodGIFBtn();
        }

        // icon preview modifiers
        $( 'input, select' )
            .on( 'change', function () {
                renderIconPreview();
            });

    } else {
        // Index Page
        if ( _isLarge() === 'true' ){
            document.getElementById( 'icon_size_large' ).checked = true;
            icons$.addClass( CL_LARGE );
        } else {
            document.getElementById( 'icon_size_small' ).checked = true;
            icons$.removeClass( CL_LARGE );
        }

        if ( fa.icons ) {
            renderIcons({});

            flattened = function () {
                var set = [];

                apexIcons    = fa.icons;
                apexIconKeys = Object.keys( apexIcons );

                apexIconKeys.forEach(function(iconCategory) {
                    set = set.concat( apexIcons[iconCategory] );
                });

                return set;
            }();

            $( '#search' ).on( 'keyup', function ( e ) {
                renderIcons({
                    debounce: 250,
                    filterString: e.target.value
                });
            } );

            // Size Toggle
            $( '[name="icon_size"]' ).on( 'click', function ( e ) {
                var affectedElem =  icons$.length > 0 ? icons$ : $( '.dm-IconPreview' );
                toggleSize( this, affectedElem );
            } );
        }
    }

})( fontapex );
