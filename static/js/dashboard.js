// Water Management System - Dashboard JavaScript

class WaterDashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.initializeEventListeners();
        this.setupRealTimeUpdates();
    }

    async loadDashboardData() {
        try {
            const data = await fetchData('/api/dashboard');
            if (data) {
                this.updateStatistics(data.statistics);
                this.renderCharts(data.charts);
                this.updateRecentActivity(data.recentActivity);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateStatistics(stats) {
        // Update today's usage
        const todayUsage = document.getElementById('today-usage');
        if (todayUsage && stats.todayUsage !== undefined) {
            todayUsage.textContent = `${formatNumber(stats.todayUsage)} L`;
        }

        // Update total locations
        const totalLocations = document.getElementById('total-locations');
        if (totalLocations && stats.totalLocations !== undefined) {
            totalLocations.textContent = formatNumber(stats.totalLocations);
        }

        // Update active alerts
        const activeAlerts = document.getElementById('active-alerts');
        if (activeAlerts && stats.activeAlerts !== undefined) {
            activeAlerts.textContent = formatNumber(stats.activeAlerts);
        }

        // Update total users
        const totalUsers = document.getElementById('total-users');
        if (totalUsers && stats.totalUsers !== undefined) {
            totalUsers.textContent = formatNumber(stats.totalUsers);
        }
    }

    renderCharts(chartData) {
        // Usage trend chart
        this.renderUsageTrendChart(chartData.usageTrend);
        
        // Quality distribution chart
        this.renderQualityChart(chartData.qualityDistribution);
        
        // Usage by source chart
        this.renderSourceChart(chartData.usageBySource);
        
        // Monthly comparison chart
        this.renderMonthlyChart(chartData.monthlyComparison);
    }

    renderUsageTrendChart(data) {
        const ctx = document.getElementById('usage-trend-chart');
        if (!ctx) return;

        this.charts.usageTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Water Usage (Liters)',
                    data: data.values,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '30-Day Usage Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Usage (Liters)'
                        }
                    }
                }
            }
        });
    }

    renderQualityChart(data) {
        const ctx = document.getElementById('quality-chart');
        if (!ctx) return;

        this.charts.quality = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent', 'Good', 'Fair', 'Poor'],
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Water Quality Distribution'
                    }
                }
            }
        });
    }

    renderSourceChart(data) {
        const ctx = document.getElementById('source-chart');
        if (!ctx) return;

        this.charts.source = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Usage by Source',
                    data: data.values,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Usage by Water Source'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Usage (Liters)'
                        }
                    }
                }
            }
        });
    }

    renderMonthlyChart(data) {
        const ctx = document.getElementById('monthly-chart');
        if (!ctx) return;

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Current Month',
                    data: data.currentMonth,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)'
                }, {
                    label: 'Previous Month',
                    data: data.previousMonth,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Usage (Liters)'
                        }
                    }
                }
            }
        });
    }

    updateRecentActivity(activities) {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        activityContainer.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item mb-2 p-2 border-bottom';
            activityItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${activity.type}</strong>
                        <div class="text-muted small">${activity.description}</div>
                    </div>
                    <div class="text-muted small">
                        ${formatDateTime(activity.timestamp)}
                    </div>
                </div>
            `;
            activityContainer.appendChild(activityItem);
        });
    }

    initializeEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                showLoadingSpinner(refreshBtn);
                this.loadDashboardData().finally(() => {
                    hideLoadingSpinner(refreshBtn, 'Refresh');
                });
            });
        }

        // Date range filter
        const dateRangeFilter = document.getElementById('date-range-filter');
        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', (e) => {
                this.filterDataByDateRange(e.target.value);
            });
        }
    }

    setupRealTimeUpdates() {
        // Update dashboard every 5 minutes
        setInterval(() => {
            this.loadDashboardData();
        }, 300000);
    }

    filterDataByDateRange(range) {
        // Implement date range filtering logic
        console.log('Filtering data by range:', range);
        this.loadDashboardData();
    }

    // Export dashboard data
    exportData(format = 'json') {
        const exportBtn = document.getElementById('export-btn');
        showLoadingSpinner(exportBtn);

        fetchData(`/api/export?format=${format}`)
            .then(data => {
                if (data) {
                    this.downloadFile(data, `dashboard-data.${format}`);
                }
            })
            .finally(() => {
                hideLoadingSpinner(exportBtn, 'Export');
            });
    }

    downloadFile(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.dashboard-page')) {
        window.waterDashboard = new WaterDashboard();
    }
});
