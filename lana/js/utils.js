function render(expression) {
    return render(expression, 100, null);
}

function render(expression, precedence, properties) {
    $("#log").html($("#log").html() + "<hr/>" + JSON.stringify(expression, null, '\t'));
    if (expression.type == tokenType.PREPARED) {
        if (expression.hasOwnProperty('operator')) {
            if (
                expression.hasOwnProperty('operand1') &&
                expression.hasOwnProperty('operand2')
            ) {

                var props = null;
                if (expression.operator.value[2].hasOwnProperty("allowedTypes")) {
                    var at = expression.operator.value[2].allowedTypes;
                    for (p in at) {
                        if (
                            at[p][0] == expression.operand1.vType &
                            at[p][1] == expression.operand2.vType
                        ) {
                            props = at[p][3];
                        }
                    }
                }

                var greater = expression.operator.value[2].precedence > precedence ||
                    (
                        expression.operator.value[2].precedence == precedence &&
                        (
                            (properties != null && !(properties.associative))
                        )
                    );

                return "<span class='expression'>" +
                    (greater ? "(" : "") +
                    render(expression.operand1, expression.operator.value[2].precedence,
                        expression.operator.value[2].associated == right ? props : null) +
                    " " +
                    expression.operator.lexem +
                    " " +
                    render(expression.operand2, expression.operator.value[2].precedence,
                        expression.operator.value[2].associated == left ? props : null) +
                    (greater ? ")" : "") +
                    "</span>"
            } else {
                return "";
            }
        } else if (expression.hasOwnProperty('value')) {
            if (expression.vType == 'string')
                return "<span class='expression'>«" +
                    expression.value +
                    "»</span>";
            else
                return "<span class='expression'>" +
                    expression.value +
                    "</span>";
        } else if (expression.hasOwnProperty('name')) {
            return "<span class='expression'><it>" +
                expression.name +
                "</it></span>";
        }
    } else if (expression.hasOwnProperty('value')) {
        if (expression.vType == 'string')
            return "<span class='expression'>«" +
                expression.value +
                "»</span>";
        else
            return "<span class='expression'>" +
                expression.value +
                "</span>";
    } else if (expression.hasOwnProperty('name')) {
        return "<span class='expression'><it>" +
            expression.name +
            "</it></span>";
    } else
        return "";
}

function calculate(expression) {
    if (expression.hasOwnProperty('operator')) {
        if (
            expression.hasOwnProperty('operand1') &&
            expression.hasOwnProperty('operand2')
        ) {
            var r1 = calculate(expression.operand1);
            var r2 = calculate(expression.operand2);
            if (r1.hasOwnProperty('value') && r2.hasOwnProperty('value'))
                return expression.operator.value[2].calculate(
                    r1, r2
                );
            else {
                var properties = null;
                if (expression.operator.value[2].hasOwnProperty('allowedTypes'))
                    var at = expression.operator.value[2].allowedTypes;
                for (a in at)
                    if (at[a][0] == expression.operand1.vType &&
                        at[a][1] == expression.operand2.vType) {
                        properties = at[a][3];
                    }
                if (r1.hasOwnProperty('name') && !r2.hasOwnProperty('name') &&
                    properties != null && properties.commutative)
                    return {
                        type: tokenType.PREPARED,
                        vType: expression.vType,
                        operand1: r2,
                        operator: expression.operator,
                        operand2: r1
                    };
                else
                    return {
                        type: tokenType.PREPARED,
                        vType: expression.vType,
                        operand1: r1,
                        operator: expression.operator,
                        operand2: r2
                    };
            }
        }
    } else {
        return expression;
    }
}

function getDepth(expression) {
    if (expression.hasOwnProperty('operator')) {
        if (
            expression.hasOwnProperty('operand1') &&
            expression.hasOwnProperty('operand2')
        ) {
            return Math.max(
                getDepth(expression.operand1) + 1,
                getDepth(expression.operand2) + 1
            );
        }
    } else if (expression.hasOwnProperty('value')) {
        return 0;
    } else throw Error();
}

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function updateURLParameter(url, param, paramVal) {
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}