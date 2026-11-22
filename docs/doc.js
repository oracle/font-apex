(function (catalog) {
    'use strict';

    const icons = new Map(Object.entries(catalog.iconIndex));
    const lookup = new Map();
    const flagSearchNames = new Map();
    const countryAliases = {
        gb: ['UK', 'United Kingdom of Great Britain and Northern Ireland', 'Great Britain', 'Britain'],
        us: ['USA', 'United States of America', 'America']
    };
    const sizePreference = 'large.fontapex';
    let large = false;

    for (const [code, country] of Object.entries(catalog.flags || {})) {
        const className = 'fa-flag-' + code;
        const alternateNames = countryAliases[code] || [];
        icons.set(className, { categories: ['FLAGS'], country, alternateNames });
        for (const term of [code, country, ...alternateNames]) {
            const key = normalize(term);
            if (!flagSearchNames.has(key)) flagSearchNames.set(key, className);
        }
    }
    for (const [name, icon] of icons) {
        lookup.set(name, name);
        for (const alias of [...(icon.aliases || []), ...(icon.formerNames || [])]) {
            lookup.set(alias, name);
        }
    }

    function syncSizeOnNavigation(updateView) {
        function syncSize() {
            try {
                large = localStorage.getItem(sizePreference) === 'true';
            } catch {
                // Use the in-memory selection if storage is unavailable.
            }
            document.getElementById(large ? 'icon_size_large' : 'icon_size_small').checked = true;
            updateView();
        }
        syncSize();
        window.addEventListener('pageshow', event => {
            if (event.persisted) syncSize();
        });
    }

    function saveSize(isLarge) {
        large = isLarge;
        try {
            localStorage.setItem(sizePreference, String(isLarge));
        } catch {
            // The selection still applies to the current page.
        }
    }

    function isModifier(name) {
        return name.startsWith('fam-');
    }

    function bareName(name) {
        return name.replace(/^fam?-/, '');
    }

    function normalize(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, '-');
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function renderTiles(names) {
        const tiles = document.createDocumentFragment();
        for (const name of names) {
            const item = document.createElement('li');
            const link = element('a', 'dm-Search-result');
            link.href = 'docs/icon.html#' + name;
            const image = element('span', 'dm-Search-icon');
            const glyph = element('span', 'fa ' + (isModifier(name) ? 'fa-user ' : '') + name);
            glyph.setAttribute('aria-hidden', 'true');
            image.append(glyph);
            const info = element('span', 'dm-Search-info');
            const country = icons.get(name).country;
            if (country) info.append(country, document.createElement('br'));
            info.append(element('span', 'dm-Search-class', name));
            link.append(image, info);
            item.append(link);
            tiles.append(item);
        }
        return tiles;
    }

    function renderGroup(title, names) {
        const group = element('div', 'dm-Search-category');
        group.append(element('h2', 'dm-Search-title', title));
        if (!names.length) return group;
        const list = element('ul', 'dm-Search-list');
        list.append(renderTiles(names));
        group.append(list);
        return group;
    }

    function initBrowser() {
        const categories = new Map();
        const entries = [];
        for (const [className, icon] of icons) {
            const labels = isModifier(className) ? ['MODIFIERS'] : icon.categories;
            const name = normalize(bareName(className));
            const tags = [icon.country || '', ...(icon.alternateNames || []), ...(icon.filters || '').split(','),
                ...(icon.aliases || []).map(bareName), ...(icon.formerNames || []).map(bareName)];
            entries.push({ className, name, words: name.split('-'), tags: tags.filter(Boolean).map(normalize) });
            for (const label of labels || []) {
                const category = label.toUpperCase();
                if (!categories.has(category)) categories.set(category, new Set());
                categories.get(category).add(className);
            }
        }
        const groups = Array.from(categories.keys()).sort().map(category => {
            const sources = new Set();
            const names = Array.from(categories.get(category)).sort().filter(name => {
                if (lookup.has(name) && lookup.get(name) !== name) return false;
                const icon = icons.get(name);
                const source = icon.sourceName || bareName(name);
                if (sources.has(source)) return false;
                sources.add(source);
                return true;
            });
            return {
                title: category === 'FLAGS' || category === 'MODIFIERS'
                    ? category.toLowerCase() : category.replace(/_/g, ' ').toLowerCase() + ' icons',
                names
            };
        });
        const results = document.getElementById('icons');
        const status = document.getElementById('search_status');
        const search = document.getElementById('search');
        let timer;

        function render() {
            clearTimeout(timer);
            const query = normalize(search.value);
            const key = bareName(query);
            const exact = lookup.get(query) || lookup.get('fa-' + key) || flagSearchNames.get(query);
            if (!key) {
                results.replaceChildren(...groups.map(group => renderGroup(group.title, group.names)));
                if (status.textContent) status.textContent = 'Showing all icon categories';
                return;
            }
            if (key.length === 1 && !exact) {
                const prompt = 'Enter at least two characters to search';
                results.replaceChildren(renderGroup(prompt, []));
                status.textContent = prompt;
                return;
            }
            timer = setTimeout(() => {
                const matches = [];
                for (const entry of entries) {
                    let rank = 0;
                    if (entry.className === exact) {
                        rank = 10000;
                    } else if (entry.name.includes(key)) {
                        rank = 1 + 100 * entry.words.filter(word => word.includes(key)).length;
                        if (entry.words.length === 1) rank += 1000;
                        if (entry.name === key) rank += 1000;
                        if (entry.words[0].startsWith(key)) rank += 1000;
                    } else if (entry.tags.some(tag => tag.includes(key))) {
                        rank = 1;
                    }
                    if (rank) matches.push({ name: entry.className, rank });
                }
                matches.sort((a, b) => b.rank - a.rank);
                const title = matches.length ? matches.length + (matches.length === 1 ? ' result' : ' results') : 'No results';
                results.replaceChildren(renderGroup(title, matches.map(match => match.name)));
                status.textContent = title;
            }, 250);
        }
        search.closest('.dm-SearchBox').hidden = false;
        search.addEventListener('input', render);
        syncSizeOnNavigation(() => results.classList.toggle('force-fa-lg', large));
        for (const radio of document.querySelectorAll('[name="icon_size"]')) {
            radio.addEventListener('change', () => {
                saveSize(radio.value === 'LARGE');
                results.classList.toggle('force-fa-lg', large);
            });
        }
        render();
    }

    function initDetail() {
        const controls = document.querySelector('.dm-IconBuilder');
        const modifier = document.getElementById('icon_modifier');
        const status = document.getElementById('icon_modifier_status');
        const rotation = document.getElementById('icon_rotate');
        const download = document.getElementById('icon_download');
        const unicode = document.getElementById('icon_char');
        const code = document.getElementById('icon_code');
        const copyButtons = document.querySelectorAll('.dm-CopyButton');
        const preview = document.querySelector('#icon_preview [data-icon]');
        let current;
        const modifiers = Array.from(icons.keys()).filter(isModifier);
        const order = new Intl.Collator('en', { numeric: true });
        for (const name of modifiers.sort(order.compare)) {
            const label = bareName(name).replace(/-/g, ' ').replace(/\b[a-z]/g, letter => letter.toUpperCase());
            modifier.add(new Option(label, name));
        }

        function renderPreview() {
            if (!current) return;
            const icon = icons.get(current);
            const overlay = isModifier(current);
            const selectedModifier = overlay ? current : modifier.value;
            modifier.closest('.dm-Field').hidden = overlay;
            status.closest('.dm-Field').hidden = !selectedModifier;
            rotation.closest('.dm-Field').hidden = Boolean(icon.country);
            const base = overlay ? 'fa-user' : current;
            const options = [
                controls.querySelector('[name="icon_scale"]:checked').value,
                document.getElementById('icon_animation').value,
                icon.country ? '' : rotation.value,
                selectedModifier,
                selectedModifier ? status.value : ''
            ].filter(Boolean);
            const classes = ['fa', base, large ? 'fa-lg' : '', ...options].filter(Boolean).join(' ');
            preview.className = classes;
            for (const example of document.querySelectorAll('.dm-Previews [data-icon]')) {
                example.className = ['fa', base, ...options].join(' ');
            }
            const snippet = preview.cloneNode(false);
            snippet.removeAttribute('data-icon');
            if (icon.country) {
                snippet.removeAttribute('aria-hidden');
                snippet.setAttribute('role', 'img');
                snippet.setAttribute('aria-label', icon.country);
            }
            document.getElementById('flag_markup_note').hidden = !icon.country;
            code.textContent = snippet.outerHTML;
            document.querySelectorAll('.dm-CopyStatus').forEach(status => status.textContent = '');
            document.getElementById('icon_classes').textContent = classes;

            const content = icon.country ? '' : getComputedStyle(preview, overlay ? '::after' : '::before').content;
            const glyph = /^"(.)"$/u.exec(content);
            unicode.parentElement.hidden = !glyph;
            unicode.textContent = glyph ? '\\' + glyph[1].codePointAt(0).toString(16) : '';
            const filename = (icon.sourceName || bareName(current)) + '.svg';
            download.href = icon.country ? '../images/flags/' + filename
                : '../svgs/' + (large ? 'large/' : 'small/') + filename;
        }

        function showIcon() {
            current = lookup.get(location.hash.slice(1) || 'fa-apex');
            document.getElementById('icon_details').hidden = !current;
            document.getElementById('icon_not_found').hidden = Boolean(current);
            document.title = (current || 'Icon not found') + ' | Oracle Font APEX';
            if (!current) {
                download.removeAttribute('href');
                return;
            }
            const country = icons.get(current).country;
            document.querySelector('.dm-Icon-name').textContent = country ? country + ' (' + current + ')' : current;
            renderPreview();
        }

        copyButtons.forEach(button => button.addEventListener('click', async () => {
            const output = document.getElementById(button.dataset.copy);
            const status = document.getElementById('copy_status_' + button.dataset.copy.replace('icon_', ''));
            const value = output.textContent;
            if (navigator.clipboard?.writeText) {
                try {
                    await navigator.clipboard.writeText(value);
                    if (current && output.textContent === value) status.textContent = 'Copied.';
                    return;
                } catch {
                    // Offer manual copying when the browser denies clipboard access.
                }
            }
            if (!current || output.textContent !== value) return;
            output.focus();
            const range = document.createRange();
            range.selectNodeContents(output);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            status.textContent = 'Value selected. Use your device’s Copy command.';
        }));

        controls.addEventListener('change', event => {
            if (event.target.name === 'icon_size') saveSize(event.target.value === 'fa-lg');
            renderPreview();
        });
        window.addEventListener('hashchange', showIcon);
        syncSizeOnNavigation(showIcon);
    }

    if (document.getElementById('icon_preview')) {
        initDetail();
    } else {
        initBrowser();
    }
})(fontapex);
