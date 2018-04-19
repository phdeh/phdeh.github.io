var parserlog = "";

function parse(tokens) {
    var r = parseFrom(tokens, 0);
    parserlog = JSON.stringify(r, null, ' ').replace('\n', '<br/>');
    return r
}

function parseFrom(tokens, index) {
    var tk = [];
    var i = index;
    while (i < tokens.length) {
        var t = tokens[i];
        if (
            t.type === tokenType.LEXEM &&
            t.value.hasOwnProperty('openBracket')
        ) {
            var t = parseFrom(tokens, i + 1);
            tk.push(t);
            i = t.index;
        } else if (
            t.type === tokenType.LEXEM &&
            t.value.hasOwnProperty('closeBracket')
        ) {
            break;
        } else {
            if (t.type === tokenType.NUMBER)
                tk.push({
                    type: tokenType.PREPARED,
                    vType: "number",
                    value: t.value
                });
            else if (t.type === tokenType.STRING)
                tk.push({
                    type: tokenType.PREPARED,
                    vType: "string",
                    value: t.value
                });
            else if (t.type === tokenType.NAME)
                tk.push({
                    type: tokenType.PREPARED,
                    vType: "number",
                    name: t.value
                });
            else
                tk.push(t)
        }
        i++;
    }
    const li = i;
    const assoc = [left, right];
    for (var prec = 1; prec <= 20; prec++)
        for (var ass in assoc) {
            var j = ass == 0 ? 0 : tk.length - 1 - 2;
            while (ass == 0 ?
                (j + 2 < tk.length) :
                (j >= 0)) {
                var o1 = tk[j];
                var op = tk[j + 1];
                var o2 = tk[j + 2];
                if (op.type == tokenType.LEXEM &&
                    o1.type == tokenType.PREPARED &&
                    o2.type == tokenType.PREPARED &&
                    op.value.hasOwnProperty(2) &&
                    op.value[2].precedence == prec &&
                    (ass == 0 ?
                        op.value[2].associated === left :
                        op.value[2].associated === right)) {
                    //alert(JSON.stringify(op, null, ' '));
                    if (op.value[2].hasOwnProperty('allowedTypes')) {
                        var at = op.value[2].allowedTypes;
                        for (var it in at) {
                            var types = at[it];
                            if (o1.vType == types[0] &&
                                o2.vType == types[1]) {
                                tk.splice(j, 2);
                                tk[j] = {
                                    type: tokenType.PREPARED,
                                    vType: types[2],
                                    operand1: o1,
                                    operator: op,
                                    operand2: o2
                                };
                                j -= ass == 0 ? 1 : 0;
                                break;
                            }
                        }
                    } else {
                        tk.splice(j, 2);
                        tk[j] = {
                            type: tokenType.PREPARED,
                            vType: o1.vType == o2.vType ? o1.vType : "any",
                            operand1: o1,
                            operator: op,
                            operand2: o2
                        };
                        j -= ass == 0 ? 1 : 0;
                    }
                }
                j += ass == 0 ? 1 : -1;
            }
        }
    tk[0].index = li;
    return tk[0];
}