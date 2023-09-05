'use strict';
'require poll';
'require view';
'require rpc';

var callMwan3Status = rpc.declare({
    object: 'mwan3',
    method: 'status',
    expect: {},
});

// Simulated CPU temperature (replace with actual temperature data)
var cpuTemperature = 40; // Replace with the actual CPU temperature

// Simulated memory usage (replace with actual memory usage data)
var memoryUsage = 50; // Replace with the actual memory usage value

// Simulated CPU usage (replace with actual CPU usage data)
var cpuUsage = 30; // Replace with the actual CPU usage value

document.querySelector('head').appendChild(E('link', {
    'rel': 'stylesheet',
    'type': 'text/css',
    'href': L.resource('view/mwan3/mwan3.css')
}));

function renderMwan3Status(status, cpuTemperature, memoryUsage, cpuUsage) {
    if (!status.interfaces)
        return '<strong>%h</strong>'.format(_('No MWAN interfaces found'));

    var statusview = '';

    for (var iface in status.interfaces) {
        var state = '';
        var css = '';
        var time = '';
        var tname = '';
        switch (status.interfaces[iface].status) {
            case 'online':
                state = _('Online');
                css = 'success';
                time = '%t'.format(status.interfaces[iface].online);
                tname = _('Uptime');
                break;
            case 'offline':
                state = _('Offline');
                css = 'danger';
                time = '%t'.format(status.interfaces[iface].offline);
                tname = _('Downtime');
                break;
            case 'notracking':
                state = _('No Tracking');
                if ((status.interfaces[iface].uptime) > 0) {
                    css = 'success';
                    time = '%t'.format(status.interfaces[iface].uptime);
                    tname = _('Uptime');
                }
                else {
                    css = 'warning';
                    time = '';
                    tname = '';
                }
                break;
            default:
                state = _('Disabled');
                css = 'warning';
                time = '';
                tname = '';
                break;
        }

        // Append interface status to the statusview
        statusview += '<div class="alert-message %h">'.format(css);
        statusview += '<div><strong>%h:&#160;</strong>%h</div>'.format(_('Interface'), iface);
        statusview += '<div><strong>%h:&#160;</strong>%h</div>'.format(_('Status'), state);

        if (time)
            statusview += '<div><strong>%h:&#160;</strong>%h</div>'.format(tname, time);

        statusview += '</div>';
    }

    // Replace 'cpuStatusText' with the actual temperature value
    var cpuTemperatureValue = cpuTemperature.toFixed(1); // Use the actual temperature value

    // Replace 'memoryStatusText' with the actual memory usage value
    var memoryStatusValue = memoryUsage.toFixed(1); // Use the actual memory usage value

    // Replace 'cpuUsageText' with the actual CPU usage value
    var cpuUsageValue = cpuUsage.toFixed(1); // Use the actual CPU usage value

    // Modify the CPU temperature status section based on temperature
    var cpuTemperatureStatus = '';
    var cpuTemperatureSection = '';
    var cpuTemperatureCss = '';

    if (cpuTemperature >= 80) {
        cpuTemperatureCss = 'danger'; // Red for high temperature
    } else if (cpuTemperature >= 60) {
        cpuTemperatureCss = 'warning'; // Yellow for normal temperature
    } else {
        cpuTemperatureCss = 'success'; // Green for low temperature
    }

    cpuTemperatureStatus = '<div><strong>%h:&#160;</strong>%h &deg;C</div>'.format(_('CPU Temperature'), cpuTemperatureValue);

    // Modify the Memory usage status section based on memory usage
    var memoryStatus = '';
    var memorySection = '';
    var memoryCss = '';

    if (memoryUsage >= 80) {
        memoryCss = 'danger'; // Red for high memory usage
    } else if (memoryUsage >= 60) {
        memoryCss = 'warning'; // Yellow for normal memory usage
    } else {
        memoryCss = 'success'; // Green for low memory usage
    }

    memoryStatus = '<div><strong>%h:&#160;</strong>%h%</div>'.format(_('Memory Usage'), memoryStatusValue);

    // Modify the CPU usage status section based on CPU usage
    var cpuUsageStatus = '';
    var cpuUsageSection = '';
    var cpuUsageCss = '';

    if (cpuUsage >= 80) {
        cpuUsageCss = 'danger'; // Red for high CPU usage
    } else if (cpuUsage >= 60) {
        cpuUsageCss = 'warning'; // Yellow for normal CPU usage
    } else {
        cpuUsageCss = 'success'; // Green for low CPU usage
    }

    cpuUsageStatus = '<div><strong>%h:&#160;</strong>%h%</div>'.format(_('CPU Usage'), cpuUsageValue);

    // Create a separate section for CPU usage, Memory usage, and CPU temperature status
    cpuUsageSection += '<h2>%h</h2>'.format(_('System Status'));
    cpuUsageSection += '<div class="alert-message %h">'.format(cpuUsageCss);
    cpuUsageSection += cpuUsageStatus;
    cpuUsageSection += '</div>';

    memorySection += '<div class="alert-message %h">'.format(memoryCss);
    memorySection += memoryStatus;
    memorySection += '</div>';

    cpuTemperatureSection += '<div class="alert-message %h">'.format(cpuTemperatureCss);
    cpuTemperatureSection += cpuTemperatureStatus;
    cpuTemperatureSection += '</div>';

    // Append CPU usage, Memory usage, and CPU temperature status sections to the existing statusview
    statusview += cpuUsageSection + memorySection + cpuTemperatureSection;

    return statusview;
}

return view.extend({
    load: function() {
        return Promise.all([
            callMwan3Status(),
        ]);
    },

    render: function(data) {
        poll.add(function() {
            return callMwan3Status().then(function(result) {
                var view = document.getElementById('mwan3-service-status');
                view.innerHTML = renderMwan3Status(result, cpuTemperature, memoryUsage, cpuUsage);
            });
        });

        return E('div', { class: 'cbi-map' }, [
            E('h2', [ _('Network interface status') ]),
            E('div', { class: 'cbi-section' }, [
                E('div', { 'id': 'mwan3-service-status' }, [
                    E('em', { 'class': 'spinning' }, [ _('Collecting data ...') ])
                ])
            ])
        ]);
    },

    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});

