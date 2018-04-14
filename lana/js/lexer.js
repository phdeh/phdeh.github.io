const tokenType = {
    PREPARED: 0,
    NUMBER: 1,
    NAME: 2,
    LEXEM: 3
};

function tokenize(str) {
    var curState = 0;
    const state = {
        ANY: curState++,
        NUMBER: curState++,
        NAME: curState++,
        LITERAL_LEXEM: curState++,
        LEXEM: curState++
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
        var logline = ("[" + i + "], '" + c + "', state = " + statename);
        log.push(logline);

        switch (curState) {
            case state.ANY: {
                if (/\s/.test(c))
                    doNothing();
                else if (/(\d|\.)/.test(c))
                    switchTo(state.NUMBER);
                else if (/\w/.test(c))
                    switchTo(state.LITERAL_LEXEM);
                else
                    switchTo(state.LEXEM);
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

    return tokens;
}