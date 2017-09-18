const replacementsForP = {
    "/\\": "λ",
    "_|_": "⊥",
    "->": "→"
};

var stateKey = 0;

var possibleReplacement;

function inputP(evt) {
    var state = document.getElementById("state");
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    if (stateKey == 0)
        for (var i in replacementsForP) {
            if (key == i.charAt(0)) {
                stateKey++;
                possibleReplacement = i;
                break;
            }
        }
    else if (stateKey < possibleReplacement.length - 1 && (possibleReplacement.charAt(stateKey) == key)) {
        stateKey++;
    } else {
        if (stateKey < possibleReplacement.length && (possibleReplacement.charAt(stateKey) == key)) {
            const caret = getCaret(theEvent.target);
            theEvent.target.value = theEvent.target.value.substring(0, caret -
                possibleReplacement.length + 1) + replacementsForP[possibleReplacement]
                + theEvent.target.value.substring(caret, theEvent.target.value.length - possibleReplacement.length + 3);
            setCaret(theEvent.target, caret - possibleReplacement.length + 2);
            if (theEvent.preventDefault)
                theEvent.preventDefault();
            stateKey = 0;
        } else {
            stateKey = 0;
            for (var i in replacementsForP) {
                if (key == i.charAt(0)) {
                    stateKey = 1;
                    possibleReplacement = i;
                    break;
                }
            }
        }
    }
}

function getCaret(node) {
    if (node.selectionStart) {
        return node.selectionStart;
    } else if (!document.selection) {
        return 0;
    }

    var c = "\001",
        sel = document.selection.createRange(),
        dul = sel.duplicate(),
        len = 0;

    dul.moveToElementText(node);
    sel.text = c;
    len = dul.text.indexOf(c);
    sel.moveStart('character', -1);
    sel.text = "";
    return len;
}

function setCaret(node, index) {
    if (node.setSelectionRange) {
        node.focus();
        node.setSelectionRange(index, index);
    }
    else if (input.createTextRange) {
        var range = node.createTextRange();
        range.collapse(true);
        range.moveEnd('character', index);
        range.moveStart('character', index);
        range.select();
    }
}

function setCaretToChar(node, index) {
    if (node.setSelectionRange) {
        node.focus();
        node.setSelectionRange(index, index - (-1));
    }
    else if (input.createTextRange) {
        var range = node.createTextRange();
        range.collapse(true);
        range.moveEnd('character', index);
        range.moveStart('character', index);
        range.select();
    }
}

const ANALYZER_STATE = {
    S: "S",
    N: "N",
    W: "W",
    V: "V",
    H: "H"
};

const NON_TERMINAL = [
    'A', 'B', 'C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y',
    'Z'
];

const TERMINAL = [
    'a', 'b', 'c', 'd', 'e',
    'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y',
    'z', 'λ', '⊥'
];

const PRODUCTION_SIGN = '→';

const PRODUCTION_SEPARATOR = '|';

const PRODUCTION_COMMA = ',';

const LAST_SYMBOL = '\0';

var productionRules;

function analyze() {
    document.getElementById("production_error").hidden = true;
    document.getElementById("word_error").hidden = true;
    var pr = {};
    var state = ANALYZER_STATE.S;
    var currNonterminal = '';
    var currRules = [];
    var currLine = '';
    const codeToParse = document.getElementById("production_rules").value + '\0';
    for (var i in codeToParse) {
        const c = codeToParse[i];
        var cs;
        if (c == '\0')
            cs = '⊥';
        else
            cs = c;
        if (c == ' ' || c == '\n' || c == '\r' || c == '\t')
            continue;
        switch (state) {
            case ANALYZER_STATE.S: {
                if (NON_TERMINAL.indexOf(c) != -1) {
                    if (c in pr)
                        currRules = pr[c];
                    else
                        currRules = [];
                    currNonterminal = c;
                    state = ANALYZER_STATE.N;
                } else {
                    analyzeError(i, "Правило продукции должно начинаться с нетерминала, но был встречен «" + cs + "».");
                    return;
                }
                break;
            }
            case ANALYZER_STATE.N: {
                if (c == PRODUCTION_SIGN) {
                    state = ANALYZER_STATE.W;
                } else {
                    analyzeError(i, "За нетерминалом «" + currNonterminal + "» ожидался знак «→», но был встречен «" + cs + "».");
                    return;
                }
                break;
            }
            case ANALYZER_STATE.W: {
                if (TERMINAL.indexOf(c) != -1 || NON_TERMINAL.indexOf(c) != -1) {
                    currLine += c;
                    state = ANALYZER_STATE.V;
                } else {
                    analyzeError(i, "Ожидался нетерминал или терминал, но был встречен «" + cs + "».");
                    return;
                }
                break;
            }
            case ANALYZER_STATE.V: {
                if (TERMINAL.indexOf(c) != -1 || NON_TERMINAL.indexOf(c) != -1) {
                    currLine += c;
                    state = ANALYZER_STATE.V;
                } else if (c == PRODUCTION_SEPARATOR) {
                    currRules.push(currLine);
                    currLine = '';
                    state = ANALYZER_STATE.W;
                } else if (c == PRODUCTION_COMMA) {
                    currRules.push(currLine);
                    currLine = '';
                    pr[currNonterminal] = currRules;
                    state = ANALYZER_STATE.S;
                } else if (c == LAST_SYMBOL) {
                    currRules.push(currLine);
                    currLine = '';
                    pr[currNonterminal] = currRules;
                    state = ANALYZER_STATE.H;
                } else {
                    analyzeError(i, "Ожидался нетерминал, терминал, разделитель или запятая, но был встречен «" + cs + "».");
                    return;
                }
                break;
            }
            case ANALYZER_STATE.H: {
                return;
            }
            default:
                alert("Недопустимое состояние.")
        }
    }
    productionRules = pr;
    document.getElementById("production_rules").disabled = true;
    var b = document.getElementById("submit_production");
    b.className = "disabled_button";
    b.innerHTML = "Принято";
    document.getElementById("product_word").hidden = false;
    b.onclick = null;
    makeWord = 'S';
    document.getElementById("change_production").hidden = false;
    findWordProductions();
    var element = document.getElementById("production_cases");
    element.scrollIntoView(true);
}

function analyzeError(index, message) {
    setCaretToChar(document.getElementById("production_rules"), index);
    var v = document.getElementsByClassName("error")[0];
    v.innerHTML = message;
    v.hidden = false;
}

function change() {
    document.getElementById("word_error").hidden = true;
    document.getElementById("production_rules").disabled = false;
    var b = document.getElementById("submit_production");
    b.className = "button";
    b.innerHTML = "Принять";
    document.getElementById("product_word").hidden = true;
    b.onclick = function () {
        analyze();
    }
    document.getElementById("change_production").hidden = true;
    var element = document.getElementById("production_rules");
    element.scrollIntoView(true);
}

var makeWord = 'S';

function findWordProductions() {
    for (i in makeWord) {
        const c = makeWord[i];
        if (NON_TERMINAL.indexOf(c) != -1) {
            var w = makeWord.substring(0, i) + "<div class='ul'>" +
                makeWord.substring(i, i - -1) + "</div>" +
                makeWord.substring(i - -1, makeWord.length);
            document.getElementsByClassName("variant")[0].innerHTML = w;
            if (!(c in productionRules)) {
                document.getElementById("word_error").hidden = false;
                document.getElementById("production_cases").innerHTML = "";
                return;
            }
            var pr = productionRules[c];
            var pc = document.getElementById("production_cases");

            pc.innerHTML = '';
            for (j in pr) {
                var a = (makeWord.substring(0, i) + pr[j] +
                    makeWord.substring(i - -1, makeWord.length)).replace('λ', '');
                pc.innerHTML += '<div class="button" onclick="replaceProduction(\'' + a + '\')"> ' + c + ' → ' + pr[j] + ' </div>';
            }
            return;
        }
    }
    document.getElementsByClassName("variant")[0].innerHTML = makeWord;
    document.getElementById("production_cases").innerHTML = "";
}

function replaceProduction(replacement) {
    makeWord = replacement;
    findWordProductions();
}
