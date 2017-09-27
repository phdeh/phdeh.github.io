const replacementsForP = {
    "/\\": "λ",
    "\\|/": "ε",
    "_|_": "⊥",
    "->": "→"
};

var justReplaced = false;

var stateKey = 0;

var possibleReplacement;

function inputP(evt) {
    justReplaced = false;
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
            justReplaced = true;
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

function filledSet(fillFrom, addition, check) {
    var set = addition;
    var elem = document.getElementById(fillFrom + "_set");
    var from = elem.value;
    var comma = false;
    for (i in from) {
        const c = from[i];
        if (c == ' ' || c == '\n' || c == '\r' || c == '\t')
            continue;
        else if (comma) {
            if (c != ',') {
                setCaretToChar(elem, i);
                var error = document.getElementById(fillFrom + "_error");
                error.innerHTML = "Символы должны быть разделены запятыми.";
                error.hidden = false;
                throw "Symbols should be separated";
            } else {
                comma = false;
            }
        } else {
            comma = true;
            set.push(c);
        }
    }
    for (i in check) {
        const c = check[i];
        if (set.indexOf(c) != -1) {
            var error = document.getElementById(fillFrom + "_error");
            error.innerHTML = "Символ «" + c + "» уже используется в грамматике.";
            error.hidden = false;
            throw "Symbol \"" + c + "\" already used";
        }
    }
    return set;
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

const PRODUCTION_STEPS = 50;

const ANALYZER_STATE = {
    S: "S",
    N: "N",
    W: "W",
    V: "V",
    H: "H"
};

var NON_TERMINAL = [
    'A', 'B', 'C', 'D', 'E',
    'F', 'G', /**/ 'I', 'J',
    'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y',
    'Z'
];

var TERMINAL = [
    'a', 'b', 'c', 'd', 'e',
    'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y',
    'z', 'λ', '⊥'
];

var axiom = 'S';

const PRODUCTION_SIGN = '→';

const PRODUCTION_SEPARATOR = '|';

const PRODUCTION_COMMA = ',';

const LAST_SYMBOL = '\0';

var productionRules;

function analyze() {
    document.getElementById("terminal_error").hidden = true;
    document.getElementById("non_terminal_error").hidden = true;
    document.getElementById("production_error").hidden = true;
    document.getElementById("axiom_error").hidden = true;
    document.getElementById("make_word_worse").hidden = true;
    TERMINAL = filledSet("terminal", ['ε'], []);
    NON_TERMINAL = filledSet("non_terminal", [], TERMINAL);
    axiom = document.getElementById("axiom").value;
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
                analyzeError(-1, "Недопустимое состояние автомата.");
        }
    }
    productionRules = pr;
    {
        var a = document.getElementById("axiom_error");
        if (axiom.length > 1) {
            a.innerHTML = "Аксиома должна быть только <u>одним</u> нетерминалом.";
            a.hidden = false;
            return;
        }
        else if (axiom.length == 0) {
            a.innerHTML = "Поле для аксиомы не может быть пустым.";
            a.hidden = false;
            return;
        } else if (NON_TERMINAL.indexOf(axiom) == -1) {

            a.innerHTML = "Аксиома должна быть <u>нетерминалом</u>.";
            a.hidden = false;
            return;
        }
    }
    if (!(axiom in productionRules)) {
        analyzeError(-1, "В правилах продукции не задано правил для " + axiom + ".");
        return;
    }
    for (prod in productionRules) {
        if (!isProductable(prod, PRODUCTION_STEPS)) {
            analyzeError(-1, "Вывод цепочки терминалов из " + prod + " невозможен, либо превышает " + PRODUCTION_STEPS + " шагов.");
            return;
        }
    }
    const type = detectStateMachine();
    CURRENT_STATE_MACHINE_TYPE = type;
    document.getElementById("production_rules").disabled = true;
    var b = document.getElementById("submit_production");
    b.className = "disabled_button";
    b.innerHTML = "Принято";
    document.getElementById("product_word").hidden = false;
    b.onclick = null;
    makeWord = axiom;
    document.getElementById("change_production").hidden = false;
    findWordProductions();
    var element = document.getElementById("production_cases");
    element.scrollIntoView(true);
}

function analyzeError(index, message) {
    if (index != -1) setCaretToChar(document.getElementById("production_rules"), index);
    var v = document.getElementById("production_error");
    v.innerHTML = message;
    v.hidden = false;
}

function change() {
    document.getElementById("make_word_worse").hidden = true;
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
                document.getElementById("make_word_worse").hidden = false;
                document.getElementById("production_cases").innerHTML = "";
                return;
            }
            var pr = productionRules[c];
            var pc = document.getElementById("production_cases");

            pc.innerHTML = '';
            for (j in pr) {
                var a = (makeWord.substring(0, i) + pr[j] +
                    makeWord.substring(i - -1, makeWord.length)).replace(RegExp('[λε]'), '');
                pc.innerHTML += '<div class="button" onclick="replaceProduction(\'' + a + '\')"> ' + c + ' → ' + pr[j] + ' </div>';
            }
            return;
        }
    }
    document.getElementsByClassName("variant")[0].innerHTML = "<input id='input_word_box' spellcheck='false' value='" +
        makeWord + "' onkeypress='inputP(event); checkWord(event);'>";
    document.getElementById("production_cases").innerHTML = "";
    const makeWorse = document.getElementById("make_word_worse");
    makeWorse.hidden = false;
}

function replaceProduction(replacement) {
    makeWord = replacement;
    findWordProductions();
}

function isProductable(nonterminal, availableSteps) {
    if (!(nonterminal in productionRules) || availableSteps <= 0)
        return false;
    else {
        const pr = productionRules[nonterminal];
        for (i in pr) {
            const productionRule = pr[i];
            var productable = true;
            for (var j = 0; j < productionRule.length; ++j) {
                const c = productionRule.charAt(j);
                if (NON_TERMINAL.indexOf(c) != -1) {
                    productable = false;
                    break;
                }
            }
            if (productable)
                return true;
        }
        for (i in pr) {
            const productionRule = pr[i];
            for (var j = 0; j < productionRule.length; ++j) {
                const c = productionRule.charAt(j);
                if (NON_TERMINAL.indexOf(c) != -1) {
                    const prod = isProductable(c, availableSteps - 1);
                    if (prod)
                        return true;
                }
            }
        }
        return false;
    }
}

function checkWord(evt) {
    var theEvent = evt || window.event;
    var target = theEvent.target;
    const word = target.value;
    var checked = true;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    if (!justReplaced && key && TERMINAL.indexOf(key) == -1)
        checked = false;
    if (checked)
        for (var j = 0; j < word.length; ++j) {
            const c = word.charAt(j);
            if (TERMINAL.indexOf(c) == -1) {
                checked = false;
                break;
            }
        }
    if (checked) {
        target.style.borderColor = "black";
        target.style.color = "black";
        var b = document.getElementById("machine_button");
        b.className = "button";
        b.onclick = function () {
            goToStateMachine();
        };
    } else {
        target.style.borderColor = "red";
        target.style.color = "red";
        var b = document.getElementById("machine_button");
        b.className = "disabled_button";
        b.onclick = null;
    }
}

function goToStateMachine() {
    var o = document.getElementById("finite_state_machine_ex");
    o.hidden = false;
    o.scrollIntoView(true);
    o = document.getElementById("try_again");
    o.className = 'disabled_button';
    o.onclick = null;
    o = document.getElementById("machine_button");
    o.className = 'disabled_button';
    o.onclick = null;
    document.getElementById('input_word_box').disabled = true;
    buildStateMachine(CURRENT_STATE_MACHINE_TYPE);
}

const MachineTypes = {
    NOT_STATED: "Тип автомата не определён",
    FINITE_LEFT_TO_RIGHT_STATE_MACHINE: "Конечный автомат с разбором слева-направо",
    FINITE_RIGHT_TO_LEFT_STATE_MACHINE: "Конечный автомат с разбором справа-налево",
    NOT_SUPPORTED_TYPE: "Неподдерживаемый тип автомата"
};

function detectStateMachine() {
    var type = MachineTypes.NOT_STATED;
    for (prod in productionRules) {
        const pr = productionRules[prod];
        for (i in pr) {
            const productionRule = pr[i];
            if (productionRule.length == 0)
                return MachineTypes.NOT_SUPPORTED_TYPE;
            else if (productionRule.length == 1) {
                if (NON_TERMINAL.indexOf(productionRule.charAt(0)) != -1)
                    return MachineTypes.NOT_SUPPORTED_TYPE;
            } else if (productionRule.length == 2) {
                if (NON_TERMINAL.indexOf(productionRule.charAt(0)) != -1 &&
                    TERMINAL.indexOf(productionRule.charAt(1)) != -1) {
                    if (type == MachineTypes.FINITE_LEFT_TO_RIGHT_STATE_MACHINE || type == MachineTypes.NOT_STATED)
                        type = MachineTypes.FINITE_LEFT_TO_RIGHT_STATE_MACHINE;
                    else
                        return MachineTypes.NOT_SUPPORTED_TYPE;
                } else if (TERMINAL.indexOf(productionRule.charAt(0)) != -1 &&
                    NON_TERMINAL.indexOf(productionRule.charAt(1)) != -1) {
                    if (type == MachineTypes.FINITE_RIGHT_TO_LEFT_STATE_MACHINE || type == MachineTypes.NOT_STATED)
                        type = MachineTypes.FINITE_RIGHT_TO_LEFT_STATE_MACHINE;
                    else
                        return MachineTypes.NOT_SUPPORTED_TYPE;
                } else
                    return MachineTypes.NOT_SUPPORTED_TYPE;
            } else
                return MachineTypes.NOT_SUPPORTED_TYPE;
        }
    }
    return type;
}

function buildStateMachine(currentStateMachineType) {
    LEXING_WORD = makeWord;
    switch (currentStateMachineType) {
        case MachineTypes.FINITE_LEFT_TO_RIGHT_STATE_MACHINE: {
            buildLeftToRightStateMachine();
            break;
        }
        case MachineTypes.FINITE_RIGHT_TO_LEFT_STATE_MACHINE: {
            buildRightToLeftStateMachine();
            break;
        }
        default: {
            alert(currentStateMachineType + " не поддерживается");
        }
    }
}

function findOutFiniteStates() {
    var stateTransitionFunction = '';
    var firstOne = true;
    var states = {};
    var stateTransitions = {};
    for (prod in productionRules) {
        const pr = productionRules[prod];
        for (i in pr) {
            var undetermined = false;
            const productionRule = pr[i];
            if ((productionRule.length == 1) && (TERMINAL.indexOf(productionRule.charAt(0)) != -1)) {
                if (firstOne)
                    firstOne = false;
                else
                    stateTransitionFunction += ", ";
                if (stateTransitions[productionRule.charAt(0)] != null)
                    undetermined = true;
                stateTransitions[productionRule.charAt(0)] = prod;
                if (undetermined)
                    stateTransitionFunction += "<b style='color: red'>";
                stateTransitionFunction = stateTransitionFunction +
                    "δ(" + productionRule.charAt(0) + ", H) = " + prod
                if (undetermined)
                    stateTransitionFunction += "</b>";
            }
        }
    }
    states['H'] = stateTransitions;
    var wasUndetermined = false;
    for (fromTo in productionRules) {
        stateTransitions = {};
        for (prod in productionRules) {
            const pr = productionRules[prod];
            for (i in pr) {
                var undetermined = false;
                const productionRule = pr[i];
                if ((productionRule.length == 2)
                    && (TERMINAL.indexOf(productionRule.charAt(0)) != -1)
                    && productionRule.charAt(1) == fromTo) {
                    if (firstOne)
                        firstOne = false;
                    else
                        stateTransitionFunction += ", ";
                    if (stateTransitions[productionRule.charAt(0)] != null)
                        undetermined = true;
                    if (undetermined)
                        stateTransitionFunction += "<b style='color: red'>";
                    stateTransitions[productionRule.charAt(0)] = prod;
                    stateTransitionFunction += "δ(" + productionRule.charAt(0) + ", " + fromTo +
                        ") = " + prod;
                    if (undetermined)
                        stateTransitionFunction += "</b>";
                } else if ((productionRule.length == 2)
                    && (TERMINAL.indexOf(productionRule.charAt(1)) != -1)
                    && productionRule.charAt(0) == fromTo) {
                    if (firstOne)
                        firstOne = false;
                    else
                        stateTransitionFunction += ", ";
                    if (stateTransitions[productionRule.charAt(1)] != null)
                        undetermined = true;
                    if (undetermined)
                        stateTransitionFunction += "<span style='color: red'>";
                    stateTransitions[productionRule.charAt(1)] = prod;
                    stateTransitionFunction += "δ(" + productionRule.charAt(1) + ", " + fromTo +
                        ") = " + prod;
                    if (undetermined)
                        stateTransitionFunction += "</span>";
                }

                wasUndetermined |= undetermined;
            }
        }
        states[fromTo] = stateTransitions;
    }
    states['?'] = [];
    STATES = states;
    CURRENT_STATE = 'H';
    document.getElementById("machine_function").innerHTML = stateTransitionFunction + ".";
    document.getElementById("fin").innerHTML = axiom;
}

var CURRENT_STATE_MACHINE_TYPE;

var STATES;

var CURRENT_STATE;

var LEXING_WORD;

var LEXING_CARET;

function buildLeftToRightStateMachine() {
    findOutFiniteStates();
    LEXING_CARET = 0;
    showState();
}

function buildRightToLeftStateMachine() {
    findOutFiniteStates();
    LEXING_CARET = LEXING_WORD.length - 1;
    showState();
}

function printStateTable(curstate, cursymbol) {
    var str = ["<table width='100%' border='3'><tr><td class='lined'><div class='sigma'>Σ</div><div class='q'><i>Q</i></div></td>"];
    for (i in TERMINAL) {
        str.push("<td class='", (TERMINAL[i] != cursymbol ? "header_vector" : "selected_vector"), "'>", TERMINAL[i], "</td>");
    }
    str.push("</tr>");
    for (s in STATES) {
        str.push("<tr><td  class='", (s != curstate ? "main_vector" : "selected_vector"), "'>", s, "</td>");
        var state = STATES[s];
        for (i in TERMINAL) {
            if (state[TERMINAL[i]] != null)
                str.push("<td", (s == curstate && TERMINAL[i] == cursymbol ? " class='choosen_vector'" : (s == curstate ||
                TERMINAL[i] == cursymbol ? " class='highlighted_vector'" : "")), ">", state[TERMINAL[i]], "</td>");
            else
                str.push("<td", (s == curstate && TERMINAL[i] == cursymbol ? " class='choosen_vector'" : (s == curstate ||
                TERMINAL[i] == cursymbol ? " class='highlighted_vector'" : "")), ">?</td>");
        }
        str.push("</tr>");
    }
    str.push("</tr></table>");
    return str.join("");
}

/*
X → Y0 | Z1 | ε,       Y → Z0 | W~ | #,
Z → Y1 | W1 | V0,    W → W0 | W1 | #,
V → Z&
 */

function showState() {
    var cursymbol;
    if (LEXING_CARET >= 0 && LEXING_CARET < LEXING_WORD.length) {
        cursymbol = LEXING_WORD.charAt(LEXING_CARET);
        var i = LEXING_CARET;
        var w = LEXING_WORD.substring(0, i) + "<div class='ul'>" +
            LEXING_WORD.substring(i, i - -1) + "</div>" +
            LEXING_WORD.substring(i - -1, LEXING_WORD.length);
        document.getElementById("lexing_word").innerHTML = w;
    } else {
        cursymbol = 'ε';
        document.getElementById("lexing_word").innerHTML = LEXING_WORD;
    }
    document.getElementById("machine_state").textContent = CURRENT_STATE;
    document.getElementById("machine_table").innerHTML = printStateTable(CURRENT_STATE, cursymbol);
}

function spinMachine() {
    var cursymbol;
    if (LEXING_CARET >= 0 && LEXING_CARET < LEXING_WORD.length) {
        cursymbol = LEXING_WORD.charAt(LEXING_CARET);
    } else {
        cursymbol = 'ε';
    }
    CURRENT_STATE = STATES[CURRENT_STATE][cursymbol];
    if (CURRENT_STATE == null)
        CURRENT_STATE = '?';
    switch (CURRENT_STATE_MACHINE_TYPE) {
        case MachineTypes.FINITE_LEFT_TO_RIGHT_STATE_MACHINE: {
            LEXING_CARET++;
            break;
        }
        case MachineTypes.FINITE_RIGHT_TO_LEFT_STATE_MACHINE: {
            LEXING_CARET--;
            break;
        }
        default: {
            alert(currentStateMachineType + " не поддерживается");
        }
    }
    showState();
}