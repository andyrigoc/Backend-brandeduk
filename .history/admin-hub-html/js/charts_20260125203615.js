/**
 * BrandedUK Admin Hub - Charts Script
 */

document.addEventListener('DOMContentLoaded', function() {
    initCharts();
});

function initCharts() {
    initOrdersChart();
    initVisitorsChart();
}

/**
 * Orders Trend Chart
 */
function initOrdersChart() {
    const ctx = document.getElementById('ordersChart');
    if (!ctx) return;

    const chartData = {
        labels: ['23 Sep', '25 Sep', '27 Sep', '29 Sep', '1 Oct', '3 Oct', '5 Oct', '7 Oct', '9 Oct', '11 Oct', '13 Oct', '15 Oct', '17 Oct', '19 Oct', '21 Oct'],
        datasets: [{
            label: 'Orders',
            data: [0, 1, 0, 1, 2, 0, 1, 0, 0, 1, 0, 0, 1, 0, 2],
            borderColor: '#00838f',
            backgroundColor: 'rgba(0, 131, 143, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#00838f',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a202c',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        },
                        stepSize: 1
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Visitors Trend Chart
 */
function initVisitorsChart() {
    const ctx = document.getElementById('visitorsChart');
    if (!ctx) return;

    const chartData = {
        labels: ['23 Sep', '25 Sep', '27 Sep', '29 Sep', '1 Oct', '3 Oct', '5 Oct', '7 Oct', '9 Oct', '11 Oct', '13 Oct', '15 Oct', '17 Oct', '19 Oct', '21 Oct'],
        datasets: [{
            label: 'Visitors',
            data: [5, 12, 10, 22, 28, 15, 35, 14, 16, 38, 15, 25, 42, 22, 55],
            borderColor: '#1a365d',
            backgroundColor: 'rgba(26, 54, 93, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#1a365d',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a202c',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}
