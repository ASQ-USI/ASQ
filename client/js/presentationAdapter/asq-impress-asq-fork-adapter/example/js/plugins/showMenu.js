(function ( document, window ) {
    'use strict';

    // var names follow impress
    // similarly to impress.js we cache a patched impress API
    var roots=[];
    var impressPatched = false;  

    // `byId` returns element with given `id` - you probably have guessed that ;)
    var byId = function ( id ) {
        return document.getElementById(id);
    };

    // add class also for menu item
    var _addClass = function(dom, c) {
        dom.classList.add(c);
        var m_dom = byId("m-"+dom.id);
        if (m_dom) m_dom.classList.add(c);
    }

    // remove class also for menu item
    var _removeClass = function(dom, c) {
        dom.classList.remove(c);
        var m_dom = byId("m-"+dom.id);
        if (m_dom) m_dom.classList.remove(c);               
    }
     
    // Capitalize first letter of string
    var capitalize = function( str ) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // It defines the names of each entry by the id capitalized.
    var showMenu = function() {
        // Create the menu wrapper and the element that will be cloned
        // for each entry.
        var menu = document.createElement('div'),
            frag = document.createDocumentFragment(),
            el = document.createElement('div');

        // Apply some classes
        menu.className = 'menu';
        el.className = 'menu-item';

        // Create an element that will be the "button" and append it
        // to the menu
        var button = document.createElement('div');
        button.className = 'menu-button';
        button.textContent = '';
        menu.appendChild(button);

        // Now, for each div in the first element child of  #impress,
        // add an entry to the menu         
        [].slice.call(byId('impress').firstElementChild.children).forEach(
                function( child, index ) {
                    
            if (!child.classList.contains('step')) return;

            var newEl = el.cloneNode(),
                i = index + 1, // We don't want to start at 0
                text = i + '. ' + capitalize(child.id);

            // Set the text of the new element
            newEl.innerHTML = '<a href="#/'+child.id+'" title="'+text+'">&bull;</a>';
            newEl.id = "m-" + child.id;

            // Add an onclick event to the new element
            // We need to use a closure to make sure the index is correct
            (function( index, id ) {
                newEl.addEventListener('click', function() {
                    impress().goto(index);
                });
                newEl.addEventListener('mouseover', function() {
                    var baseURL = document.URL.substring(0, document.URL.search('#/'));
                    button.innerHTML = '<iframe src="'+baseURL+"?preview#/"+id+'">';
                });
                newEl.addEventListener('mouseout', function() {
                    button.innerHTML = "";
                });
            }( index, child.id ));

            // And append the new element to the menu
            frag.appendChild(newEl);
        });

        // Add the frag to the menu
        menu.appendChild(frag);

        // And append the menu to the body.
        // Appending it to #impress would mess things up, since
        // `position: absolute` wouldn't work anymore in it.
        document.body.appendChild(menu);
    };

    // `patchImpress` patches the impress.js api so that external scripts
    // that use goto, next and prev go through the adapter.
    var patchImpress = function(){
        if(impressPatched) return;

        if(typeof window.impress !== 'function'){
            document.addEventListener("impress:ready", patchImpress);
            return;
        }

        document.removeEventListener("impress:ready", patchImpress);

        var impressOrig = impress;

        window.impress = function(rootId){
            rootId = rootId || "impress";

            // if given root is already patched just return the API
            if (roots["impress-root-" + rootId]) {
                return roots["impress-root-" + rootId];
            }

            var api = impressOrig(rootId);
            api.showMenu = showMenu;

            return  roots["impress-root-" + rootId] = api;
        }

        impressPatched = true;
    }

    patchImpress()

})(document, window);