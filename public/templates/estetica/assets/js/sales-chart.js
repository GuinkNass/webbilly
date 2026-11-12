/* =====================================================================
   PureGlow Dashboard – Sales Charts & Switchers
   ===================================================================== */
(function () {

    /* ── shared palette ─────────────────────────────────────────────── */
    var BASE = '#e5977b';   /* fallback; real base pulled from CSS var */
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DATA = [12, 19, 11, 25, 34, 28, 40, 38, 42, 39, 45, 50];
    var COLORS = ['#e5977b', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
        '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a78bfa'];

    /* try to read the CSS variable */
    try {
        var raw = getComputedStyle(document.documentElement)
            .getPropertyValue('--pureglow-base').trim();
        if (raw) BASE = raw;
    } catch (e) { }

    /* ── Chart 1 – Line ─────────────────────────────────────────────── */
    var el1 = document.getElementById('salesChart');
    if (el1 && window.Chart) {
        new Chart(el1.getContext('2d'), {
            type: 'line',
            data: {
                labels: MONTHS,
                datasets: [{
                    label: 'Spending ($k)',
                    data: DATA,
                    tension: 0.4,
                    borderColor: BASE,
                    borderWidth: 2.5,
                    pointBackgroundColor: BASE,
                    pointRadius: 4,
                    fill: true,
                    backgroundColor: function (ctx) {
                        var g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        g.addColorStop(0, hexAlpha(BASE, 0.25));
                        g.addColorStop(1, hexAlpha(BASE, 0.01));
                        return g;
                    }
                }]
            },
            options: chartOpts('Spending (Last 12 Months)')
        });
    }

    /* ── Chart 2 – Bar ──────────────────────────────────────────────── */
    var el2 = document.getElementById('salesChartBar');
    if (el2 && window.Chart) {
        new Chart(el2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: MONTHS,
                datasets: [
                    {
                        label: 'Bookings',
                        data: [48, 62, 39, 74, 95, 82, 110, 104, 118, 107, 124, 140],
                        backgroundColor: hexAlpha(BASE, 0.75),
                        borderColor: BASE,
                        borderWidth: 1.5,
                        borderRadius: 6,
                        borderSkipped: false
                    },
                    {
                        label: 'Completed',
                        data: [35, 50, 30, 60, 80, 70, 95, 90, 100, 92, 110, 125],
                        backgroundColor: hexAlpha('#10b981', 0.65),
                        borderColor: '#10b981',
                        borderWidth: 1.5,
                        borderRadius: 6,
                        borderSkipped: false
                    }
                ]
            },
            options: chartOpts('Bookings vs Completed')
        });
    }

    /* ── Chart 3 – Doughnut ─────────────────────────────────────────── */
    var el3 = document.getElementById('salesChartDoughnut');
    if (el3 && window.Chart) {
        var labels3 = ['Facial', 'Massage', 'Manicure', 'Body Scrub', 'Anti-Aging', 'Other'];
        var data3 = [32, 24, 18, 12, 9, 5];
        new Chart(el3.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels3,
                datasets: [{
                    data: data3,
                    backgroundColor: COLORS.slice(0, 6),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ' ' + ctx.label + ': ' + ctx.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
        /* build custom legend */
        var lg = document.getElementById('doughnutLegend');
        if (lg) {
            var total = data3.reduce(function (a, b) { return a + b; }, 0);
            labels3.forEach(function (lbl, i) {
                var pct = Math.round(data3[i] / total * 100);
                lg.innerHTML += '<div class="dashboard__doughnut-legend-item">'
                    + '<span class="dashboard__doughnut-legend-dot" style="background:' + COLORS[i] + '"></span>'
                    + lbl
                    + '<span class="dashboard__doughnut-legend-pct">' + data3[i] + '%</span>'
                    + '</div>';
            });
        }
    }

    /* ── Chart 4 – Radar ────────────────────────────────────────────── */
    var el4 = document.getElementById('salesChartRadar');
    if (el4 && window.Chart) {
        new Chart(el4.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'This Week',
                        data: [65, 78, 90, 55, 84, 96, 70],
                        borderColor: BASE,
                        backgroundColor: hexAlpha(BASE, 0.18),
                        borderWidth: 2,
                        pointBackgroundColor: BASE,
                        pointRadius: 4
                    },
                    {
                        label: 'Last Week',
                        data: [50, 60, 72, 48, 70, 80, 60],
                        borderColor: '#8b5cf6',
                        backgroundColor: hexAlpha('#8b5cf6', 0.12),
                        borderWidth: 2,
                        pointBackgroundColor: '#8b5cf6',
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { display: false },
                        grid: { color: 'rgba(0,0,0,.07)' }
                    }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12 } }
                }
            }
        });
    }

    /* ── Mini Bar Sparkline ─────────────────────────────────────────── */
    var mb = document.getElementById('miniBarChart');
    if (mb && window.Chart) {
        new Chart(mb.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [{
                    data: [28, 42, 38, 55, 48, 62, 40],
                    backgroundColor: COLORS.map(function (c) { return hexAlpha(c, 0.7); }),
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: miniOpts()
        });
    }

    /* ── Mini Line Sparkline ────────────────────────────────────────── */
    var ml = document.getElementById('miniLineChart');
    if (ml && window.Chart) {
        new Chart(ml.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [{
                    data: [1200, 1900, 1500, 2400, 2200, 2800, 2600],
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: hexAlpha('#3b82f6', 0.12),
                    pointRadius: 0
                }]
            },
            options: miniOpts()
        });
    }

    /* ── Mini Polar Sparkline ───────────────────────────────────────── */
    var mp = document.getElementById('miniPolarChart');
    if (mp && window.Chart) {
        new Chart(mp.getContext('2d'), {
            type: 'polarArea',
            data: {
                labels: ['Facial', 'Massage', 'Aroma', 'Manicure'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'].map(function (c) { return hexAlpha(c, 0.7); }),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { r: { display: false } }
            }
        });
    }

    /* ── Chart Tab Switcher ─────────────────────────────────────────── */
    var tabs = document.querySelectorAll('.dashboard__chart-tab');
    tabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
            tabs.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var type = btn.getAttribute('data-chart');
            document.querySelectorAll('.dashboard__chart-panel').forEach(function (p) {
                p.classList.remove('active');
            });
            var panel = document.getElementById('chartPanel-' + type);
            if (panel) panel.classList.add('active');
        });
    });

    /* ── Table Style Switcher ───────────────────────────────────────── */
    var styleBtns = document.querySelectorAll('.dashboard__table-style-btn');
    styleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            styleBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var s = btn.getAttribute('data-style');
            ['1', '2', '3'].forEach(function (n) {
                var el = document.getElementById('bookingStyle' + n);
                if (el) el.style.display = (n === s) ? 'block' : 'none';
            });
        });
    });

    /* ── helpers ────────────────────────────────────────────────────── */
    function chartOpts(title) {
        return {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.06)' }, ticks: { maxTicksLimit: 5 } },
                x: { grid: { display: false } }
            }
        };
    }

    function miniOpts() {
        return {
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { y: { display: false }, x: { display: false } }
        };
    }

    function hexAlpha(hex, alpha) {
        /* convert #rrggbb or rgb(...) to rgba */
        hex = hex.trim();
        if (hex.startsWith('rgb')) {
            return hex.replace('rgb(', 'rgba(').replace(')', ', ' + alpha + ')');
        }
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

})();