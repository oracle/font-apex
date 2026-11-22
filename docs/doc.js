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
        requestedIcon = window.location.hash.slice( 1 ),
        iconIndex = fa.iconIndex || {},
        currentIcon = Object.prototype.hasOwnProperty.call( iconIndex, requestedIcon )
            ? requestedIcon
            : 'fa-apex',
        isLarge,
        timeout,
        browseCategories = new Map(),
        searchIndex = new Map(),
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

    var normalizeSearch = function ( value ) {
        return value.trim().toLowerCase().replace(/\s+/g, '-');
    };

    var buildSearchIndex = function ( catalog ) {
        var categories = new Map();

        Object.keys( catalog ).forEach(function ( className ) {
            var icon = catalog[className],
                labels = icon.categories || [];

            if ( !labels.length ) {
                return;
            }

            var name = normalizeSearch( className.slice( 3 ) );
            searchIndex.set( className, {
                className: className,
                name: name,
                words: name.split( '-' ),
                tags: ( icon.filters || '' ).split( ',' ).map( normalizeSearch ).filter( Boolean )
            });

            labels.forEach(function ( category ) {
                var label = category.toUpperCase();

                if ( !categories.has( label ) ) {
                    categories.set( label, new Set() );
                }
                categories.get( label ).add( className );
            });
        });

        Array.from( categories.keys() ).sort().forEach(function ( label ) {
            browseCategories.set( label, Array.from( categories.get( label ) ).sort() );
        });
    };

    var renderIconGroup = function ( title, names ) {
        var entries = names.map(function ( name ) {
            return '<li><a class="dm-Search-result" href="docs/icon.html#' + name + '">' +
                '<div class="dm-Search-icon"><span class="t-Icon fa ' + name + '" aria-hidden="true"></span></div>' +
                '<div class="dm-Search-info"><span class="dm-Search-class">' + name + '</span></div>' +
                '</a></li>';
        }).join( '' );

        return '<div class="dm-Search-category"><h2 class="dm-Search-title">' + title + '</h2>' +
            ( entries ? '<ul class="dm-Search-list">' + entries + '</ul>' : '' ) + '</div>';
    };

    var renderIcons = function ( query ) {
        var key = normalizeSearch( query ),
            results = document.getElementById( 'icons' );

        clearTimeout( timeout );

        if ( !key ) {
            var groups = [];
            browseCategories.forEach(function ( names, category ) {
                groups.push( renderIconGroup( category.replace(/_/g, ' ').toLowerCase() + ' Icons', names ) );
            });
            results.innerHTML = groups.join( '' );
            return;
        }

        if ( key.length === 1 ) {
            results.innerHTML = renderIconGroup( 'Enter at least two characters to search', [] );
            return;
        }

        timeout = setTimeout(function () {
            var matches = [];

            searchIndex.forEach(function ( icon ) {
                var rank = 0;

                if ( icon.name.includes( key ) ) {
                    if ( icon.words.length === 1 ) {
                        rank += 1000;
                    }
                    if ( icon.name === key ) {
                        rank += 1000;
                    }
                    if ( icon.words[0].startsWith( key ) ) {
                        rank += 1000;
                    }
                    rank += 100 * icon.words.filter(function ( word ) {
                        return word.includes( key );
                    }).length;
                } else if ( icon.tags.some(function ( tag ) {
                    return tag.startsWith( key );
                }) ) {
                    rank = 1;
                }

                if ( rank ) {
                    matches.push({ name: icon.className, rank: rank });
                }
            });

            matches.sort(function ( a, b ) {
                return b.rank - a.rank;
            });
            var names = matches.map(function ( match ) {
                return match.name;
            });
            var title = names.length ? names.length + ( names.length === 1 ? ' result' : ' results' ) : 'No results';
            results.innerHTML = renderIconGroup( title, names );
        }, 250 );
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

        var size = iconSize === 'fa-lg' ? 'large' : 'small',
            downloadLink = document.getElementById( 'icon_download' ),
            source = iconIndex[currentIcon];

        if ( source ) {
            downloadLink.href = '../svgs/' + size + '/' + ( source.sourceName || currentIcon.replace( /^(fa|fam)-/, '' ) ) + '.svg';
        }

        _isLarge( iconSize === 'fa-lg' );
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

        if ( fa.iconIndex ) {
            buildSearchIndex( iconIndex );

            var searchInput = document.getElementById( 'search' );
            renderIcons( searchInput.value );
            searchInput.addEventListener( 'input', function () {
                renderIcons( searchInput.value );
            });

            // Size Toggle
            $( '[name="icon_size"]' ).on( 'click', function ( e ) {
                var affectedElem =  icons$.length > 0 ? icons$ : $( '.dm-IconPreview' );
                toggleSize( this, affectedElem );
            } );
        }
    }

})( fontapex );
