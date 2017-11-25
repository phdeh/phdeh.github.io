function init() {
    makeButtonIfMobile();
    enableMathQueue();
    $(function () {
        $('p').hyphenate();
        $('').hyphenate();
    })
}

$.fn.hyphenate = function () {
    var all = "[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]",
        glas = "[аеёиоуыэю\я]",
        sogl = "[бвгджзклмнпрстфхцчшщ]",
        zn = "[йъь]",
        shy = "\xAD",
        re = [];

    re[1] = new RegExp("(" + zn + ")(" + all + all + ")", "ig");
    re[2] = new RegExp("(" + glas + ")(" + glas + all + ")", "ig");
    re[3] = new RegExp("(" + glas + sogl + ")(" + sogl + glas + ")", "ig");
    re[4] = new RegExp("(" + sogl + glas + ")(" + sogl + glas + ")", "ig");
    re[5] = new RegExp("(" + glas + sogl + ")(" + sogl + sogl + glas + ")", "ig");
    re[6] = new RegExp("(" + glas + sogl + sogl + ")(" + sogl + sogl + glas + ")", "ig");
    return this.each(function () {
        var text = $(this).html();
        for (var i = 1; i < 7; ++i) {
            text = text.replace(re[i], "$1" + shy + "$2");
        }
        $(this).html(text);
    });
};

function detectmob() {
    return !!(navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i));
}

function makeButtonIfMobile() {
    if (detectmob()) {
        document.getElementById("submitter").hidden = false;
        window.onscroll = function (ev) {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                if (schollDown)
                    focusOnScroll();
            }
        };
    }
}

function enableMathQueue() {
    var QUEUE = MathJax.Hub.queue;  // shorthand for the queue
    var math = null;                // the element jax for the math output.

    //
    //  Get the element jax when MathJax has produced it.
    //
    QUEUE.Push(function () {
        math = MathJax.Hub.getAllJax("MathOutput")[0];
    });

    //
    //  The onchange event handler that typesets the
    //  math entered by the user
    //
    window.UpdateMath = function (TeX) {
        QUEUE.Push(["Text", math, "\\displaystyle{" + TeX + "}"]);
    }
}

function validate(forced, evt, target, func) {
    schollDown = false;
    var theEvent = evt || window.event;
    if (theEvent !== null) {
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }
    if (forced || theEvent.keyCode === 13 || theEvent.keyCode === 32 || theEvent.keyCode === 9) {
        if (!target.value)
            target.value = target.placeholder;

        func();
    }
}

function handleSpoiler(evt) {
    var theEvent = evt || window.event;
    var s = theEvent.target.innerHTML;
    var n = theEvent.target.name;
    if (s == 'показать') {
        document.getElementsByName(n).forEach(function (t) {
                if (t != theEvent.target)
                    t.hidden = false;
                else
                    t.innerHTML = 'скрыть';
            }
        )
    }
    else if (s == 'скрыть') {
        document.getElementsByName(n).forEach(function (t) {
                if (t != theEvent.target)
                    t.hidden = true;
                else
                    t.innerHTML = 'показать';
            }
        )
    }
}

function calcall() {
    const hw = document.getElementById("homework");
    const er = document.getElementById("error");
    hw.hidden = true;
    er.hidden = true;
    const v = parseInt(document.getElementsByName("variant")[0].value);
    if (25 - v < 4) {
        er.hidden = false;
        return;
    } else
        hw.hidden = false;
    calcEx1(v);
    calcEx2(v);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

function fillAll(name, value) {
    document.getElementsByName(name).forEach(function (t) {
        t.innerHTML = value
    });
}

function calcEx1(n) {
    var v = n + 5;

    function P(i) {
        return mulfrac(
            mulfrac(
                combination(v, i),
                powfrac([
                    1,
                    3
                ], i)),
            powfrac([2, 3], v - i));
    }

    fillAll("ex1_dice_throws", "$n' = " + v + "$");
    fillAll("ex1_p1", "$P(k = 0) = C^{0}_{" + v + "} \\cdot p^0 \\cdot q^{" + v + " - 0} = \\frac{" + v + "!}{0!(" + v +
        "-0)!} \\cdot \\bigl(\\frac 13\\bigr)^0 \\cdot \\bigl(\\frac 23\\bigr)^{" + v + " - 0} = " +
        strfrac(P(0)) + "$");
    fillAll("ex1_p2", "$P(k = 1) = " + strfrac(P(1)) + "$");
    fillAll("ex1_p3", "$P(k = 2) = " + strfrac(P(2)) + "$");
    var ans = sumfrac(P(0), sumfrac(P(1), P(2)));
    var str = strfrac(ans);
    fillAll("ex1_pans", "$P_2 = P(k = 0) + P(k = 1) + P(k = 2) = " + str + "$");
    fillAll("ex1_ans", "$P_2 = " + str + " \\approx " + approxfrac(ans) + "$");
}

function calcEx2(v) {
    var p = 0.51;
    var q = 1 - p;
    var n = 50 + 10 * v;
    var k1 = Math.floor(n / 2) + 1;
    var k2 = n;
    var sqrt = Math.sqrt(n * p * q);
    fillAll("ex2_young", "$n' = " + n + "$");
    fillAll("ex2_k1", "$k_1 = " + k1 + "$");
    fillAll("ex2_k2", "$k_2 = " + k2 + "$");
    fillAll("ex2_sqrt", "$\\sqrt{npq} = \\sqrt{" + n + " \\cdot 0{,}51 \\cdot 0{,}49} = " + approxfrac([sqrt, 1]) + " $");
    var Phi1 = stdNormal((k1 - n * p) / (sqrt));
    var Phi2 = stdNormal((k2 - n * p) / (sqrt));
    var P = approxfrac([Phi2 - Phi1, 1]);
    fillAll("ex2_phi1", "$\\Phi_1\\bigl(\\frac{" + k1 + "-" + n + "\\cdot" + p + "}{" + sqrt + "}\\bigr)=" + approxfrac([Phi1, 1]) + "$");
    fillAll("ex2_phi2", "$\\Phi_2\\bigl(\\frac{" + k2 + "-" + n + "\\cdot" + p + "}{" + sqrt + "}\\bigr)=" + approxfrac([Phi2, 1]) + "$");
    fillAll("ex2_fans", "$P(k_1 \\leqslant k \\leqslant k_2) = \\Phi_2 - \\Phi_1 = " + P + "$");
    fillAll("ex2_ans", "$P(\\text{М $>$ Ж}) = " + P + "$");
}

function stdNormal(z) {
    var j, k, kMax, m, values, total, subtotal, item, z2, z4, a, b;
    if (z < -6) {
        return 0;
    }
    if (z > 6) {
        return 1;
    }
    m = 1;
    b = z;
    z2 = z * z;
    z4 = z2 * z2;
    values = [];
    for (k = 0; k < 100; k += 2) {
        a = 2 * k + 1;
        item = b / (a * m);
        item *= (1 - (a * z2) / ((a + 1) * (a + 2)));
        values.push(item);
        m *= (4 * (k + 1) * (k + 2));
        b *= z4;
    }
    total = 0;
    for (k = 49; k >= 0; k--) {
        total += values[k];
    }
    return 0.5 + 0.3989422804014327 * total;
}

function combination(n, k) {
    //*
    var nom = 1;
    var den = 1;
    for (var i = n - k + 1; i <= n; i++)
        nom *= i;
    den = factorial(k);
    return frac(nom, den);
    // */ return frac(factorial(n), factorial(k) * factorial(n - k));
}

function factorial(i) {
    if (i < 0)
        alert("Argument of factorial less than zero!")
    if (i === 0 || i === 1)
        return 1;
    var j = 1;
    for (var k = 1; k <= i; k++) {
        j *= k;
    }
    return j;
}

function sumfrac(f1, f2) {
    var n1 = f1[0];
    var n2 = f2[0];
    var d1 = f1[1];
    var d2 = f2[1];
    var nm = n1 * d2 + n2 * d1;
    var dm = d1 * d2;
    return frac(nm, dm);
    return [nm, dm];
}

function subfrac(f1, f2) {
    return sumfrac(f1, [-f2[0], f2[1]]);
}

function mulfrac(f1, f2) {
    var n1 = f1[0];
    var n2 = f2[0];
    var d1 = f1[1];
    var d2 = f2[1];
    var nm = n1 * n2;
    var dm = d1 * d2;
    return frac(nm, dm);
}

function powfrac(f1, power) {
    if (power == 0)
        return [1, 1];
    var nm = f1[0];
    var dm = f1[1];
    for (var i = 1; i < power; i++) {
        nm *= f1[0];
        dm *= f1[1];
    }
    return frac(nm, dm);
}

function frac(nm, dm) {
    const simplifyMaximum = 50000000000;
    var prod = 1;
    var i = 2;
    while (i <= simplifyMaximum) {
        while (nm % i == 0 && dm % i == 0) {
            nm /= i;
            dm /= i;
        }
        prod *= i;
        i = prod + 1;
    }
    return [nm, dm];
}

function strfrac(f1) {
    var n = f1[0];
    var d = f1[1];
    if (d < 0) {
        n = -n;
        d = -d;
    }
    if (d == 1)
        return n.toString();
    if (n >= 0)
        return "\\frac{" + n + "}{" + d + "}";
    else
        return "-\\frac{" + -n + "}{" + d + "}";
}

function approxfrac(f1) {
    var r = (f1[0] / f1[1]).toExponential(2).replace(".", "{,}");
    if (r.indexOf("e+1") != -1)
        r = r.replace("e+1", "\\cdot10");
    if (r.indexOf("e+0") != -1)
        r = r.replace("e+0", "");
    if (r.indexOf("e") != -1)
        r = r.replace("e", "\\cdot10^{") + "}";
    return r;
}