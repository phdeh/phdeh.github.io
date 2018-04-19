const tokenType = {
    PREPARED: 0,
    NUMBER: 1,
    NAME: 2,
    LEXEM: 3,
    STRING: 4
};

const escapeCharacters = {
    'n': '\n',
    't': '\t',
    '\'': '\''
};

var lexerlog = "";

var lexerresult = "";

Object.prototype.getKeyByValue = function (value) {
    for (var prop in this) {
        if (this.hasOwnProperty(prop)) {
            if (this[prop] === value)
                return prop;
        }
    }
}

function tokenize(str) {
    var curState = 0;
    const state = {
        ANY: curState++,
        NUMBER: curState++,
        NAME: curState++,
        LITERAL_LEXEM: curState++,
        LEXEM: curState++,
        STRING: curState++,
        ESCAPE_STRING: curState++
    };
    curState = state.ANY;
    var log = [];
    var tokens = [];
    var temp = [];
    var s = (str + " ").split("");
    var i = 0;

    function error(a) {
        alert(a);
    }

    function doNothing() {
    }

    function switchTo(s) {
        curState = s;
        i--;
        temp = [];
    }

    function eraselessSwitchTo(s) {
        curState = s;
        i--;
    }

    while (i < s.length) {
        const c = s[i];
        const lc = s[i].toLowerCase();

        var statename = "???";
        for (st in state) {
            if (state[st] == curState)
                statename = st;
        }
        var z = c;
        if (Object.values(escapeCharacters).includes(z))
            z = '\\' + escapeCharacters.getKeyByValue(z);

            var logline = ("[" + i + "], '" + z + "', state = " + statename);
        log.push(logline);

        switch (curState) {
            case state.ANY: {
                if (/\s/.test(c))
                    doNothing();
                else if (/(\d|\.)/.test(c))
                    switchTo(state.NUMBER);
                else if (/\w/.test(c))
                    switchTo(state.LITERAL_LEXEM);
                else if (c === '\'')
                    curState = state.STRING;
                else
                    switchTo(state.LEXEM);
            }
                break;
            case state.STRING: {
                if (c === '\\')
                    curState = state.ESCAPE_STRING;
                else if (c === '\'') {
                    tokens.push({
                        type: tokenType.STRING,
                        value: temp.join('')
                    });
                    switchTo(state.ANY);
                    i++;
                }
                else
                    temp.push(c);
            }
                break;
            case state.ESCAPE_STRING: {
                if (escapeCharacters.hasOwnProperty(c))
                    temp.push(escapeCharacters[c]);
                else
                    temp.push(c);
                curState = state.STRING;
            }
                break;
            case state.NUMBER: {
                if (/\d/.test(lc)
                    || (lc === '.' && temp.indexOf('.') === -1 && temp.indexOf('e') === -1)
                    || (lc === 'e' && temp.indexOf('e') === -1))
                    temp.push(lc);
                else {
                    tokens.push({
                        type: tokenType.NUMBER,
                        value: parseFloat(temp.join(''))
                    });
                    switchTo(state.ANY);
                }
            }
                break;
            case state.LITERAL_LEXEM: {
                var found = false;
                if (/\w/.test(c)) {
                    var tm = temp.join('').toLowerCase() + lc;
                    for (lexem in lexems) {
                        if (lexem.length > temp.length && lexem.substr(0, temp.length + 1) == tm) {
                            temp.push(c);
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        eraselessSwitchTo(state.NAME);
                } else {
                    var tm = temp.join('').toLowerCase();
                    var found = false;
                    for (lexem in lexems) {
                        if (lexem == tm) {
                            tokens.push({
                                type: tokenType.LEXEM,
                                lexem: lexem,
                                value: lexems[lexem]
                            });
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        tokens.push({
                            type: tokenType.NAME,
                            value: temp.join('')
                        });
                    switchTo(state.ANY);
                }
            }
                break;
            case state.NAME: {
                if (/\w/.test(c))
                    temp.push(c);
                else {
                    tokens.push({
                        type: tokenType.NAME,
                        value: temp.join('')
                    });
                    switchTo(state.ANY);
                }
            }
                break;
            case state.LEXEM: {
                var tm = temp.join('') + c;
                var found = false;
                for (lexem in lexems) {
                    if (lexem.length > temp.length && lexem.substr(0, temp.length + 1) == tm) {
                        temp.push(c);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    tm = temp.join('');
                    for (lexem in lexems) {
                        if (lexem == tm) {
                            tokens.push({
                                type: tokenType.LEXEM,
                                lexem: lexem,
                                value: lexems[lexem]
                            });
                            found = true;
                            switchTo(state.ANY);
                            break;
                        }
                    }
                }
                if (!found) {
                    error('Unknown lexem \'' + tm + '\'');
                    return null;
                    switchTo(state.ANY);
                }
            }
                break;
        }
        i++;
    }

    lexerlog = log.join('</br>');
    lexerresult = JSON.stringify(tokens, null, ' ').replace("\n", '<br/>')
    return tokens;
}