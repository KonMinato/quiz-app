document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const htmlTagSelect = document.getElementById('html-tag-select');
    const htmlContentInput = document.getElementById('html-content-input');
    const addHtmlElementBtn = document.getElementById('add-html-element-btn');
    const contentRow = document.getElementById('content-row');
    const imgSrcRow = document.getElementById('img-src-row');
    const imgAltRow = document.getElementById('img-alt-row');
    const htmlImgSrcInput = document.getElementById('html-img-src-input');
    const htmlImgAltInput = document.getElementById('html-img-alt-input');
    
    const cssSelectorSelect = document.getElementById('css-selector-select');
    const cssPropertySelect = document.getElementById('css-property-select');
    const cssValueSelect = document.getElementById('css-value-select');
    const applyCssRuleBtn = document.getElementById('apply-css-rule-btn');
    
    const codeDisplay = document.getElementById('code-display');
    const previewFrame = document.getElementById('preview-frame');

    let htmlElements = [];
    let cssRules = {};

    const cssPropertyOptions = {
        'color': ['black', 'red', 'blue', 'green'],
        'background-color': ['white', 'lightblue', 'lightyellow', 'lightgray'],
        'padding': ['5px', '10px', '15px', '20px'],
        'margin': ['0px', '10px', '20px'],
        'font-size': ['16px', '20px', '24px', '32px'],
        'font-weight': ['normal', 'bold'],
        'text-align': ['left', 'center', 'right'],
        'border': ['none', '1px solid black', '3px dotted blue', '5px solid #e0e0e0'],
        'border-left': ['5px solid #3498db', '3px solid #e74c3c', '10px solid #f1c40f'],
        'border-bottom': ['1px solid #ccc', '3px double #34495e', '2px solid #2ecc71'],
        'border-collapse': ['collapse', 'separate']
    };

    function render() {
        const htmlString = htmlElements.map(el => {
            if (el.tag === 'img') {
                return `<img src="${el.attrs.src}" alt="${el.attrs.alt}">`;
            }
            if (el.tag === 'a') {
                return `<a href="#" target="_blank">${el.content}</a>`;
            }
            if (el.tag === 'br') {
                return '<br>';
            }
            if (el.tag === 'table') {
                return `<table>
    <tr>
        <th>見出し1</th>
        <th>見出し2</th>
    </tr>
    <tr>
        <td>データ1</td>
        <td>データ2</td>
    </tr>
</table>`;
            }
            return `<${el.tag}>${el.content}</${el.tag}>`;
        }).join('\n');

        let cssString = '';
        for (const selector in cssRules) {
            cssString += `${selector} {\n`;
            for (const prop in cssRules[selector]) {
                cssString += `  ${prop}: ${cssRules[selector][prop]};\n`;
            }
            cssString += `}\n`;
        }

        const previewContent = `
            <!DOCTYPE html><html><head><style>${cssString} table,th,td { border: 1px solid black; padding: 5px; } </style></head>
            <body>${htmlString}</body></html>
        `;
        previewFrame.srcdoc = previewContent;
        codeDisplay.textContent = `\n${htmlString}\n\n/* CSS */\n${cssString}`;
    }

    function updateCssValueOptions() {
        const selectedProperty = cssPropertySelect.value;
        const options = cssPropertyOptions[selectedProperty] || [];
        cssValueSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    }

    function toggleHtmlInputs() {
        const selectedTag = htmlTagSelect.value;
        
        contentRow.classList.add('hidden');
        imgSrcRow.classList.add('hidden');
        imgAltRow.classList.add('hidden');

        if (selectedTag === 'img') {
            imgSrcRow.classList.remove('hidden');
            imgAltRow.classList.remove('hidden');
        } else if (selectedTag === 'a') {
            contentRow.classList.remove('hidden');
        } else if (selectedTag !== 'br' && selectedTag !== 'table') {
            contentRow.classList.remove('hidden');
        }
    }

    addHtmlElementBtn.addEventListener('click', () => {
        const tag = htmlTagSelect.value;
        let newElement = { tag };

        if (tag === 'img') {
            newElement.attrs = {
                src: htmlImgSrcInput.value || 'https://via.placeholder.com/150',
                alt: htmlImgAltInput.value || 'サンプル画像'
            };
        } else if (tag === 'a') {
            newElement.content = htmlContentInput.value || 'リンクテキスト';
            newElement.attrs = { href: '#' };
        } else if (tag !== 'br' && tag !== 'table') {
            newElement.content = htmlContentInput.value || `(${tag}のサンプル)`;
        }
        
        htmlElements.push(newElement);
        htmlContentInput.value = '';
        htmlImgSrcInput.value = '';
        htmlImgAltInput.value = '';
        render();
    });

    applyCssRuleBtn.addEventListener('click', () => {
        const selector = cssSelectorSelect.value;
        const property = cssPropertySelect.value;
        const value = cssValueSelect.value;
        if (!cssRules[selector]) { cssRules[selector] = {}; }
        cssRules[selector][property] = value;
        render();
    });

    htmlTagSelect.addEventListener('change', toggleHtmlInputs);
    cssPropertySelect.addEventListener('change', updateCssValueOptions);

    function initialize() {
        const selectors = ['body', 'h1', 'p', 'div', 'span', 'img', 'a', 'table', 'th', 'td'];
        cssSelectorSelect.innerHTML = selectors.map(s => `<option value="${s}">${s}</option>`).join('');
        
        cssPropertySelect.innerHTML = Object.keys(cssPropertyOptions).map(p => `<option value="${p}">${p}</option>`).join('');

        toggleHtmlInputs();
        updateCssValueOptions();
        render();
    }

    initialize();
});