const small_digits = [
    '₀',
    '₁',
    '₂',
    '₃',
    '₄',
    '₅',
    '₆',
    '₇',
    '₈',
    '₉'
];

var combtype;
var nametype;
var elementsArea;
var numberOfElements;
var lengthOfComb;

var initialized = false;

const max = 27 * 27 * 27;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function min(a, b) {
    if (isNaN(a) || isNaN(b))
        return 0;
    if (a < b)
        return a;
    else
        return b;
}

function lazyInit() {
    if (initialized)
        return;
    initialized = true;
    combtype = document.getElementsByName("combtype");
    nametype = document.getElementsByName("nametype");
    elementsArea = document.getElementsByName("elementsArea")[0];
    numberOfElements = document.getElementsByName("numberOfElements")[0];
    lengthOfComb = document.getElementsByName("lengthOfComb")[0];
}

function valueOfRadio(radios) {
    var f = null;
    radios.forEach(
        function (t) {
            if (t.checked)
                f = t.id;
        }
    )
    return f;
}

function fillNumbers() {
    lazyInit();
    try {
        var c = min(parseInt(numberOfElements.value), max);
        var e = [];

        var a1a2 = valueOfRadio(nametype) === 'a1a2';
        var shift = 0;
        for (i = 1; i <= c + shift; i++) {
            if (a1a2) {
                e.push('a');
                var t = i.toString();
                for (j in small_digits)
                    t = t.replaceAll(j, small_digits[j]);
                e.push(t);
            } else {
                var v = i;
                do {
                    var cr = String.fromCharCode((v % 27) + 'a'.charCodeAt(0) - 1);
                    if (cr === '`') {
                        shift++;
                    } else
                        e.push(cr);
                    v = Math.floor(v / 27);
                } while (v > 0);
            }
            if (i !== c + shift)
                e.push(', ');
        }
        elementsArea.textContent = e.join('');
    } catch (e) {
        elementsArea.textContent = '';
    }
}