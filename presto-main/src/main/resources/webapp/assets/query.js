/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Table = Reactable.Table,
    Thead = Reactable.Thead,
    Th = Reactable.Th,
    Tr = Reactable.Tr,
    Td = Reactable.Td;

var TaskList = React.createClass({
    compareTaskId: function(taskA, taskB) {
        var taskIdArrA = removeQueryId(taskA).split(".");
        var taskIdArrB = removeQueryId(taskB).split(".");

        if (taskIdArrA.length > taskIdArrB.length) {
            return 1;
        }
        for (var i = 0; i < taskIdArrA.length; i++) {
            var anum = Number.parseInt(taskIdArrA[i]);
            var bnum = Number.parseInt(taskIdArrB[i]);
            if(anum != bnum) return anum > bnum ? 1 : -1;
        }

        return 0;
    },
    showPortNumbers: function(tasks) {
        // check if any host has multiple port numbers
        var hostToPortNumber = {};
        for (var i = 0; i < tasks.length; i++) {
            var taskUri = tasks[i].taskStatus.self;
            var hostname = getHostname(taskUri);
            var port = getPort(taskUri);
            if ((hostname in hostToPortNumber) && (hostToPortNumber[hostname] != port)) {
                return true;
            }
            hostToPortNumber[hostname] = port;
        }

        return false;
    },
    render: function() {
        var tasks = this.props.tasks;

        if (tasks === undefined || tasks.length == 0) {
            return (
                <div className="row">
                    <div className="col-xs-12">
                        No tasks.
                    </div>
                </div>
            );
        }

        var showPortNumbers = this.showPortNumbers(tasks);

        var renderedTasks = tasks.map(function (task) {
            var elapsedTime = parseDuration(task.stats.elapsedTime);
            if (elapsedTime == 0) {
                elapsedTime = Date.now() - Date.parse(task.stats.createTime);
            }

            return (
                    <Tr key={ task.taskStatus.taskId }>
                        <Td column="id" value={ task.taskStatus.taskId }>
                            <a href={ task.taskStatus.self + "?pretty" }>
                                { getTaskIdSuffix(task.taskStatus.taskId) }
                            </a>
                        </Td>
                        <Td column="host" value={ getHostname(task.taskStatus.self) }>
                            { showPortNumbers ? getHostAndPort(task.taskStatus.self) : getHostname(task.taskStatus.self) }
                        </Td>
                        <Td column="state" value={ formatState(task.taskStatus.state, task.stats.fullyBlocked) }>
                            { formatState(task.taskStatus.state, task.stats.fullyBlocked) }
                        </Td>
                        <Td column="rows" value={ task.stats.rawInputPositions }>
                            { formatCount(task.stats.rawInputPositions) }
                        </Td>
                        <Td column="rowsSec" value={ computeRate(task.stats.rawInputPositions, elapsedTime) }>
                            { formatCount(computeRate(task.stats.rawInputPositions, elapsedTime)) }
                        </Td>
                        <Td column="bytes" value={ parseDataSize(task.stats.rawInputDataSize) }>
                            { formatDataSizeBytes(parseDataSize(task.stats.rawInputDataSize)) }
                        </Td>
                        <Td column="bytesSec" value={ computeRate(parseDataSize(task.stats.rawInputDataSize), elapsedTime) }>
                            { formatDataSizeBytes(computeRate(parseDataSize(task.stats.rawInputDataSize), elapsedTime)) }
                        </Td>
                        <Td column="splitsPending" value={ task.stats.queuedDrivers }>
                            { task.stats.queuedDrivers }
                        </Td>
                        <Td column="splitsRunning" value={ task.stats.runningDrivers }>
                            { task.stats.runningDrivers }
                        </Td>
                        <Td column="splitsDone" value={ task.stats.completedDrivers }>
                            { task.stats.completedDrivers }
                        </Td>
                        <Td column="elapsedTime" value={ parseDuration(task.stats.elapsedTime) }>
                            { task.stats.elapsedTime }
                        </Td>
                        <Td column="cpuTime" value={ parseDuration(task.stats.totalCpuTime) }>
                            { task.stats.totalCpuTime }
                        </Td>
                        <Td column="bufferedBytes" value={ task.outputBuffers.totalBufferedBytes }>
                            { formatDataSizeBytes(task.outputBuffers.totalBufferedBytes) }
                        </Td>
                    </Tr>
            );
        }.bind(this));

        return (
            <Table id="tasks" className="table table-striped sortable" sortable=
                {[
                    {
                        column: 'id',
                        sortFunction: this.compareTaskId
                    },
                    'host',
                    'state',
                    'splitsPending',
                    'splitsRunning',
                    'splitsDone',
                    'rows',
                    'rowsSec',
                    'bytes',
                    'bytesSec',
                    'elapsedTime',
                    'cpuTime',
                    'bufferedBytes',
                ]}
                defaultSort={ {column: 'id', direction: 'asc'} }>
                <Thead>
                        <Th column="id">ID</Th>
                        <Th column="host">Host</Th>
                        <Th column="state">State</Th>
                        <Th column="splitsPending"><span className="glyphicon glyphicon-pause" style={ GLYPHICON_HIGHLIGHT } data-toggle="tooltip" data-placement="top" title="Pending splits"></span></Th>
                        <Th column="splitsRunning"><span className="glyphicon glyphicon-play" style={ GLYPHICON_HIGHLIGHT } data-toggle="tooltip" data-placement="top" title="Running splits"></span></Th>
                        <Th column="splitsDone"><span className="glyphicon glyphicon-ok" style={ GLYPHICON_HIGHLIGHT } data-toggle="tooltip" data-placement="top" title="Completed splits"></span></Th>
                        <Th column="rows">Rows</Th>
                        <Th column="rowsSec">Rows/s</Th>
                        <Th column="bytes">Bytes</Th>
                        <Th column="bytesSec">Bytes/s</Th>
                        <Th column="elapsedTime">Elapsed</Th>
                        <Th column="cpuTime">CPU Time</Th>
                        <Th column="bufferedBytes">Buffered</Th>
                </Thead>
                { renderedTasks }
            </Table>
        );
    }
});

var BAR_CHART_WIDTH = 800;

var BAR_CHART_PROPERTIES = {
    type: 'bar',
    barSpacing: '0',
    height: '80px',
    barColor: '#747F96',
    zeroColor: '#8997B3',
    tooltipClassname: 'sparkline-tooltip',
    tooltipFormat: 'Task {{offset:offset}} - {{value}}',
    disableHiddenCheck: true,
}

var HISTOGRAM_WIDTH = 175;

var HISTOGRAM_PROPERTIES = {
    type: 'bar',
    barSpacing: '0',
    height: '80px',
    barColor: '#747F96',
    zeroColor: '#747F96',
    zeroAxis: true,
    tooltipClassname: 'sparkline-tooltip',
    tooltipFormat: '{{offset:offset}} -- {{value}} tasks',
    disableHiddenCheck: true,
}

var StageDetail = React.createClass({
    getInitialState: function() {
        return {
            expanded: false,
            lastRender: null
        }
    },
    getExpandedIcon: function() {
        return this.state.expanded ? "glyphicon-chevron-up" : "glyphicon-chevron-down";
    },
    getExpandedStyle: function() {
        return this.state.expanded ? {} : {display: "none"};
    },
    toggleExpanded: function() {
        this.setState({
            expanded: !this.state.expanded,
        })
    },
    renderHistogram: function(histogramId, inputData, numberFormatter) {
        var numBuckets = Math.min(HISTOGRAM_WIDTH, Math.sqrt(inputData.length));
        var dataMin = Math.min.apply(null, inputData);
        var dataMax = Math.max.apply(null, inputData);
        var bucketSize = (dataMax - dataMin) / numBuckets;

        var histogramData = [];

        if (bucketSize == 0) {
            histogramData = [inputData.length];
        }
        else {
            for (var i = 0; i < numBuckets + 1; i++) {
                histogramData.push(0);
            }

            for (var i in inputData) {
                var dataPoint = inputData[i];
                var bucket = Math.floor((dataPoint - dataMin) / bucketSize);
                histogramData[bucket] = histogramData[bucket] + 1;
            }
        }

        var tooltipValueLookups = {'offset' : {}};
        for (var i = 0; i < histogramData.length; i++) {
            tooltipValueLookups['offset'][i] = numberFormatter(dataMin + (i * bucketSize)) + "-" + numberFormatter(dataMin + ((i + 1) * bucketSize));
        }

        var stageHistogramProperties = $.extend({}, HISTOGRAM_PROPERTIES,  {barWidth: (HISTOGRAM_WIDTH / histogramData.length), tooltipValueLookups: tooltipValueLookups});
        $(histogramId).sparkline(histogramData, stageHistogramProperties);
    },
    componentDidUpdate: function() {
        var stage = this.props.stage;
        var numTasks = stage.tasks.length;

        // sort the x-axis
        stage.tasks.sort(function (taskA, taskB) {
            return getTaskIdInStage(taskA.taskStatus.taskId) - getTaskIdInStage(taskB.taskStatus.taskId);
        })

        var scheduledTimes = stage.tasks.map(function(task) {
            return parseDuration(task.stats.totalScheduledTime);
        });

        var cpuTimes = stage.tasks.map(function(task) {
            return parseDuration(task.stats.totalCpuTime);
        });

        // prevent multiple calls to componentDidUpdate (resulting from calls to setState or otherwise) within the refresh interval from re-rendering sparklines/charts
        if (this.state.lastRender == null || (Date.now() - this.state.lastRender) >= 1000) {
            var renderTimestamp = Date.now();
            var stageHistogramProperties = $.extend({}, HISTOGRAM_PROPERTIES,  {barWidth: (HISTOGRAM_WIDTH / (Math.min(numTasks, HISTOGRAM_WIDTH) + 1))});
            var stageId = getStageId(stage.stageId);

            this.renderHistogram('#scheduled-time-histogram-' + stageId, scheduledTimes, formatDuration);
            this.renderHistogram('#cpu-time-histogram-' + stageId, cpuTimes, formatDuration);

            if (this.state.expanded) {
                // this needs to be a string otherwise it will also be passed to numberFormatter
                var tooltipValueLookups = {'offset' : {}};
                for (var i = 0; i < numTasks; i++) {
                    tooltipValueLookups['offset'][i] = getStageId(stage.stageId) + "." + i;
                }

                var stageBarChartProperties = $.extend({}, BAR_CHART_PROPERTIES, {barWidth: BAR_CHART_WIDTH / numTasks, tooltipValueLookups: tooltipValueLookups});

                $('#scheduled-time-bar-chart-' + stageId).sparkline(scheduledTimes, $.extend({}, stageBarChartProperties, {numberFormatter: formatDuration}));
                $('#cpu-time-bar-chart-' + stageId).sparkline(cpuTimes, $.extend({}, stageBarChartProperties, {numberFormatter: formatDuration}));
            }

            this.setState({
                lastRender: renderTimestamp
            });
        }
    },
    render: function() {
        var stage = this.props.stage;

        if (stage === undefined || !stage.hasOwnProperty('plan')) {
            return (
                <tr>
                    <td>Information about this stage is unavailable.</td>
                </tr>);
        }

        var totalBufferedBytes = stage.tasks.map(function(task) {
            return task.outputBuffers.totalBufferedBytes;
        }).reduce(function(previousValue, currentValue) {
            return previousValue + currentValue;
        }, 0);

        var stageId = getStageId(stage.stageId);

        return (
            <tr>
                <td className="stage-id">
                    <div className="stage-state-color"  style={ { borderLeftColor: getStageStateColor(stage.state) } }>{ stageId }</div>
                </td>
                <td>
                    <table className="table single-stage-table">
                        <tbody>
                            <tr>
                                <td>
                                    <table className="stage-table stage-table-time">
                                        <thead>
                                            <tr>
                                                <th className="stage-table-stat-title stage-table-stat-header">
                                                    Time
                                                </th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Scheduled
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.stageStats.totalScheduledTime }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Blocked
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.stageStats.totalBlockedTime }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Wall
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.stageStats.totalUserTime }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    CPU
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.stageStats.totalCpuTime }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <table className="stage-table stage-table-memory">
                                        <thead>
                                            <tr>
                                                <th className="stage-table-stat-title stage-table-stat-header">
                                                    Memory
                                                </th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Cumulative
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { formatDataSizeBytes(stage.stageStats.cumulativeMemory / 1000) }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Current
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.stageStats.totalMemoryReservation }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Buffers
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { formatDataSize(totalBufferedBytes) }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Peak
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.stageStats.peakMemoryReservation }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <table className="stage-table stage-table-tasks">
                                        <thead>
                                            <tr>
                                                <th className="stage-table-stat-title stage-table-stat-header">
                                                    Tasks
                                                </th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Pending
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.tasks.filter(function(task) { return task.taskStatus.state == "PLANNED" }).length }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Running
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.tasks.filter(function(task) { return task.taskStatus.state == "RUNNING" }).length }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Finished
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.tasks.filter(function(task) {
                                                        return task.taskStatus.state == "FINISHED" ||
                                                            task.taskStatus.state == "CANCELED" ||
                                                            task.taskStatus.state == "ABORTED" ||
                                                            task.taskStatus.state == "FAILED" }).length }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="stage-table-stat-title">
                                                    Total
                                                </td>
                                                <td className="stage-table-stat-text">
                                                    { stage.tasks.length }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <table className="stage-table histogram-table">
                                        <thead>
                                            <tr>
                                                <th className="stage-table-stat-title stage-table-chart-header">
                                                    Scheduled Time Skew
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="histogram-container">
                                                    <span className="histogram" id={ "scheduled-time-histogram-" + stageId }><div className="loader"></div></span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <table className="stage-table histogram-table">
                                        <thead>
                                            <tr>
                                                <th className="stage-table-stat-title stage-table-chart-header">
                                                    CPU Time Skew
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="histogram-container">
                                                    <span className="histogram" id={ "cpu-time-histogram-" + stageId }><div className="loader"></div></span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td className="expand-charts-container">
                                    <a onClick={this.toggleExpanded} className="expand-charts-button">
                                        <span className={ "glyphicon " + this.getExpandedIcon() } style={ GLYPHICON_HIGHLIGHT } data-toggle="tooltip" data-placement="top" title="More"></span>
                                    </a>
                                </td>
                            </tr>
                            <tr style={ this.getExpandedStyle() }>
                                <td colSpan="6">
                                    <table className="expanded-chart">
                                        <tbody>
                                            <tr>
                                                <td className="stage-table-stat-title expanded-chart-title">
                                                    Task Scheduled Time
                                                </td>
                                                <td className="bar-chart-container">
                                                    <span className="bar-chart" id={ "scheduled-time-bar-chart-" + stageId }><div className="loader"></div></span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr style={ this.getExpandedStyle() }>
                                <td colSpan="6">
                                    <table className="expanded-chart">
                                        <tbody>
                                            <tr>
                                                <td className="stage-table-stat-title expanded-chart-title">
                                                    Task CPU Time
                                                </td>
                                                <td className="bar-chart-container">
                                                    <span className="bar-chart" id={ "cpu-time-bar-chart-" + stageId }><div className="loader"></div></span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>);
    }
});

var StageList = React.createClass({
    getStages: function (stage) {
        if (stage === undefined || !stage.hasOwnProperty('subStages')) {
            return []
        }

        return [].concat.apply(stage, stage.subStages.map(this.getStages));
    },
    render: function() {
        var stages = this.getStages(this.props.outputStage);

        if (stages === undefined || stages.length == 0) {
            return (
                <div className="row">
                    <div className="col-xs-12">
                        No stage information available.
                    </div>
                </div>
            );
        }

        var renderedStages = stages.map(function (stage) {
            return (
                    <StageDetail key={ stage.stageId } stage={ stage } />
            );
        }.bind(this));

        return (
            <div className="row">
                <div className="col-xs-12">
                    <table className="table" id="stage-list">
                        <tbody>
                            { renderedStages }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

var SMALL_SPARKLINE_PROPERTIES = {
    width:'100%',
    height: '57px',
    fillColor:'#3F4552',
    lineColor: '#747F96',
    spotColor: '#1EDCFF',
    tooltipClassname: 'sparkline-tooltip',
    disableHiddenCheck: true,
}

var TASK_FILTER = {
    ALL: function(state) { return true },
    PLANNED: function(state) { return state === 'PLANNED' },
    RUNNING: function(state) { return state === 'RUNNING' },
    FINISHED: function(state) { return state === 'FINISHED' },
    FAILED: function(state) { return state === 'FAILED' || state === 'ABORTED' || state === 'CANCELED' },
};

var QueryDetail = React.createClass({
    getInitialState: function() {
        return {
            query: null,
            lastSnapshotStages: null,
            lastSnapshotTasks: null,

            lastCpuTime: 0,
            lastRowInput: 0,
            lastByteInput: 0,

            cpuTimeRate: [],
            rowInputRate: [],
            byteInputRate: [],

            reservedMemory: [],

            initialized: false,
            ended: false,

            lastRefresh: null,
            lastRender: null,

            stageRefresh: true,
            taskRefresh: true,

            taskFilter: TASK_FILTER.ALL,
        };
    },
    resetTimer: function() {
        clearTimeout(this.timeoutId);
        // stop refreshing when query finishes or fails
        if (this.state.query == null || !this.state.ended) {
            this.timeoutId = setTimeout(this.refreshLoop, 1000);
        }
    },
    refreshLoop: function() {
        clearTimeout(this.timeoutId); // to stop multiple series of refreshLoop from going on simultaneously
        var queryId = window.location.search.substring(1);
        $.get('/v1/query/' + queryId, function (query) {
            var lastSnapshotStages = this.state.lastSnapshotStage;
            if (this.state.stageRefresh) {
                lastSnapshotStages = query.outputStage;
            }
            var lastSnapshotTasks = this.state.lastSnapshotTasks;
            if (this.state.taskRefresh) {
                lastSnapshotTasks = query.outputStage;
            }

            var lastRefresh = this.state.lastRefresh;
            var lastCpuTime = this.state.lastCpuTime;
            var lastRowInput = this.state.lastRowInput;
            var lastByteInput = this.state.lastByteInput;
            var alreadyEnded = this.state.ended;
            var nowMillis = Date.now();

            this.setState({
                query: query,
                lastSnapshotStage: lastSnapshotStages,
                lastSnapshotTasks: lastSnapshotTasks,

                lastCpuTime: parseDuration(query.queryStats.totalCpuTime),
                lastRowInput: query.queryStats.processedInputPositions,
                lastByteInput: parseDataSize(query.queryStats.processedInputDataSize),

                initialized: true,
                ended: query.finalQueryInfo,

                lastRefresh: nowMillis,
            });

            // i.e. don't show sparklines if we've already decided not to update or if we don't have one previous measurement
            if (alreadyEnded || (lastRefresh == null && query.state == "RUNNING")) {
                this.resetTimer();
                return;
            }

            if (lastRefresh == null) {
                lastRefresh = nowMillis - parseDuration(query.queryStats.elapsedTime);
            }

            var elapsedSecsSinceLastRefresh = (nowMillis - lastRefresh) / 1000;
            if (elapsedSecsSinceLastRefresh != 0) {
                var currentCpuTimeRate = (parseDuration(query.queryStats.totalCpuTime) - lastCpuTime) / elapsedSecsSinceLastRefresh;
                var currentRowInputRate = (query.queryStats.processedInputPositions - lastRowInput) / elapsedSecsSinceLastRefresh;
                var currentByteInputRate = (parseDataSize(query.queryStats.processedInputDataSize) - lastByteInput) / elapsedSecsSinceLastRefresh;
                this.setState({
                    cpuTimeRate: addToHistory(currentCpuTimeRate, this.state.cpuTimeRate),
                    rowInputRate: addToHistory(currentRowInputRate, this.state.rowInputRate),
                    byteInputRate: addToHistory(currentByteInputRate, this.state.byteInputRate),
                    reservedMemory: addToHistory(parseDataSize(query.queryStats.totalMemoryReservation), this.state.reservedMemory),
                });
            }
            this.resetTimer();
        }.bind(this))
        .error(function() {
            this.setState({
                initialized: true,
            })
            this.resetTimer();
        }.bind(this));
    },
    handleTaskRefreshClick: function() {
        if (this.state.taskRefresh) {
            this.setState({
                taskRefresh: false,
                lastSnapshotTasks: this.state.query.outputStage,
            });
        }
        else {
            this.setState({
                taskRefresh: true,
            });
        }
    },
    renderTaskRefreshButton: function() {
        if (this.state.taskRefresh) {
            return <button className="btn btn-info live-button" onClick={ this.handleTaskRefreshClick }>Auto-Refresh: On</button>
        }
        else {
            return <button className="btn btn-info live-button" onClick={ this.handleTaskRefreshClick }>Auto-Refresh: Off</button>
        }
    },
    handleStageRefreshClick: function() {
        if (this.state.stageRefresh) {
            this.setState({
                stageRefresh: false,
                lastSnapshotStages: this.state.query.outputStage,
            });
        }
        else {
            this.setState({
                stageRefresh: true,
            });
        }
    },
    renderStageRefreshButton: function() {
        if (this.state.stageRefresh) {
            return <button className="btn btn-info live-button" onClick={ this.handleStageRefreshClick }>Auto-Refresh: On</button>
        }
        else {
            return <button className="btn btn-info live-button" onClick={ this.handleStageRefreshClick }>Auto-Refresh: Off</button>
        }
    },
    renderTaskFilterListItem: function(taskFilter, taskFilterText) {
        return (
            <li><a href="#" className={ this.state.taskFilter == taskFilter ? "selected" : ""} onClick={ this.handleTaskFilterClick.bind(this, taskFilter) }>{ taskFilterText }</a></li>
        );
    },
    handleTaskFilterClick: function(filter, event) {
        this.setState({
            taskFilter: filter
        });
        event.preventDefault();
    },
    killQuery: function() {
        $.ajax({url: 'v1/query/' + this.state.query.queryId, type: 'DELETE'});
    },
    getTasksFromStage: function (stage) {
        if (stage === undefined || !stage.hasOwnProperty('subStages') || !stage.hasOwnProperty('tasks')) {
            return []
        }

        return [].concat.apply(stage.tasks, stage.subStages.map(this.getTasksFromStage));
    },
    componentDidMount: function() {
        this.refreshLoop();
    },
    componentDidUpdate: function() {
        // prevent multiple calls to componentDidUpdate (resulting from calls to setState or otherwise) within the refresh interval from re-rendering sparklines/charts
        if (this.state.lastRender == null || (Date.now() - this.state.lastRender) >= 1000) {
            var renderTimestamp = Date.now();
            $('#cpu-time-rate-sparkline').sparkline(this.state.cpuTimeRate, $.extend({}, SMALL_SPARKLINE_PROPERTIES, {chartRangeMin: 0, numberFormatter: precisionRound}));
            $('#row-input-rate-sparkline').sparkline(this.state.rowInputRate, $.extend({}, SMALL_SPARKLINE_PROPERTIES, {numberFormatter: formatCount}));
            $('#byte-input-rate-sparkline').sparkline(this.state.byteInputRate, $.extend({}, SMALL_SPARKLINE_PROPERTIES, {numberFormatter: formatDataSize}));
            $('#reserved-memory-sparkline').sparkline(this.state.reservedMemory,  $.extend({}, SMALL_SPARKLINE_PROPERTIES, {numberFormatter: formatDataSize}));

            if (this.state.lastRender == null) {
                $('#query').each(function(i, block) {
                  hljs.highlightBlock(block);
                });
            }

            this.setState({
                lastRender: renderTimestamp,
            });
        }

        $('[data-toggle="tooltip"]').tooltip();
        new Clipboard('.copy-button');
    },
    renderTasks: function() {
        if (this.state.lastSnapshotTasks == null) {
            return;
        }

        var tasks = this.getTasksFromStage(this.state.lastSnapshotTasks).filter(function(task) { return this.state.taskFilter(task.taskStatus.state) }, this);

        return (
            <div>
                <div className="row">
                    <div className="col-xs-9">
                        <h3>Tasks</h3>
                    </div>
                    <div className="col-xs-3">
                        <table className="query-links">
                            <tr>
                                <td>
                                    <div className="input-group-btn text-right">
                                        <button type="button" className="btn btn-default dropdown-toggle pull-right text-right" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Show <span className="caret"></span>
                                        </button>
                                        <ul className="dropdown-menu">
                                            { this.renderTaskFilterListItem(TASK_FILTER.ALL, "All") }
                                            { this.renderTaskFilterListItem(TASK_FILTER.PLANNED, "Planned") }
                                            { this.renderTaskFilterListItem(TASK_FILTER.RUNNING, "Running") }
                                            { this.renderTaskFilterListItem(TASK_FILTER.FINISHED, "Finished") }
                                            { this.renderTaskFilterListItem(TASK_FILTER.FINISHED, "Aborted/Canceled/Failed") }
                                        </ul>
                                    </div>
                                </td>
                                <td>&nbsp;&nbsp;{ this.renderTaskRefreshButton() }</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <TaskList key={ this.state.query.queryId } tasks={ tasks } />
                    </div>
                </div>
            </div>
        );
    },
    renderStages: function() {
        if (this.state.lastSnapshotStage == null) {
            return;
        }

        return (
            <div>
                <div className="row">
                    <div className="col-xs-9">
                        <h3>Stages</h3>
                    </div>
                    <div className="col-xs-3">
                        <table className="query-links">
                            <tr>
                                <td>
                                    { this.renderStageRefreshButton() }
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <StageList key={ this.state.query.queryId } outputStage={ this.state.lastSnapshotStage } />
                    </div>
                </div>
            </div>
        );
    },
    renderSessionProperties: function() {
        var query = this.state.query;

        var properties = [];
        for (var property in query.session.systemProperties) {
            if (query.session.systemProperties.hasOwnProperty(property)) {
                properties.push(
                    <span>- { property + "=" + query.session.systemProperties[property] } <br /></span>
                );
            }
        }

        for (var catalog in query.session.catalogProperties) {
            if (query.session.catalogProperties.hasOwnProperty(catalog)) {
                for (property in query.session.catalogProperties[catalog]) {
                    if (query.session.catalogProperties[catalog].hasOwnProperty(property)) {
                        properties.push(
                            <span>- { catalog + "." + property + "=" + query.session.catalogProperties[catalog][property] } </span>
                        );
                    }
                }
            }
        }

        return properties;
    },
    renderProgressBar: function() {
        var query = this.state.query;
        var progressBarStyle = { width: getProgressBarPercentage(query) + "%", backgroundColor: getQueryStateColor(query) };

        return (
            <div className="progress-large">
                <div className="progress-bar progress-bar-info" role="progressbar" aria-valuenow={ getProgressBarPercentage(query) } aria-valuemin="0" aria-valuemax="100" style={ progressBarStyle }>
                    { getProgressBarTitle(query) }
                </div>
            </div>
        )
    },
    renderFailureInfo: function() {
        var query = this.state.query;
        if (query.failureInfo) {
            return (
                <div className="row">
                    <div className="col-xs-12">
                        <h3>Error Information</h3>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="info-title">
                                        Error Type
                                    </td>
                                    <td className="info-text">
                                        { query.errorType }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Error Code
                                    </td>
                                    <td className="info-text">
                                        { query.errorCode.name + " (" + this.state.query.errorCode.code + ")" }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Stack Trace
                                        <a className="btn copy-button" data-clipboard-target="#stack-trace" data-toggle="tooltip" data-placement="right" title="Copy to clipboard">
                                            <span className="glyphicon glyphicon-copy" aria-hidden="true" alt="Copy to clipboard" />
                                        </a>
                                    </td>
                                    <td className="info-text">
                                        <pre id="stack-trace">
                                            { formatStackTrace(query.failureInfo) }
                                        </pre>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
        else {
            return "";
        }
    },
    render: function() {
        var query = this.state.query;

        if (query == null || this.state.initialized == false) {
            var label = (<div className="loader">Loading...</div>);
            if (this.state.initialized) {
                label = "Query not found";
            }
            return (
                    <div className="row error-message">
                        <div className="col-xs-12"><h4>{ label }</h4></div>
                    </div>
            );
        }

        return (
            <div>
                <div className="row">
                    <div className="col-xs-7">
                        <h2>
                            <span id="query-id">{ query.queryId }</span>
                            <a className="btn copy-button" data-clipboard-target="#query-id" data-toggle="tooltip" data-placement="right" title="Copy to clipboard">
                                <span className="glyphicon glyphicon-copy" aria-hidden="true" alt="Copy to clipboard" />
                            </a>
                        </h2>
                    </div>
                    <div className="col-xs-5">
                        <table className="query-links">
                            <tr>
                                <td>
                                    <a onClick={ this.killQuery } className={ "btn btn-warning " + (["FINISHED", "FAILED", "CANCELED"].indexOf(query.state) > -1 ? "disabled" : "") } target="_blank">Kill Query</a>
                                    &nbsp;&nbsp;&nbsp;
                                    <a href={ "plan.html?" + query.queryId } className="btn btn-info" target="_blank">Live Plan</a>
                                    &nbsp;
                                    <a href={ "/v1/query/" + query.queryId + "?pretty" } className="btn btn-info" target="_blank">Raw JSON</a>
                                    &nbsp;
                                    <a href={ "/timeline.html?" + query.queryId } className="btn btn-info" target="_blank">Split Timeline</a>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        { this.renderProgressBar() }
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <h3>Session</h3>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="info-title">
                                        User
                                    </td>
                                    <td className="info-text">
                                        <span id="query-user">{ query.session.user }</span>
                                        &nbsp;&nbsp;
                                        <a href="#" className="copy-button" data-clipboard-target="#query-user" data-toggle="tooltip" data-placement="right" title="Copy to clipboard">
                                            <span className="glyphicon glyphicon-copy" aria-hidden="true" alt="Copy to clipboard" />
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Principal
                                    </td>
                                    <td className="info-text">
                                        { query.session.principal }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Source
                                    </td>
                                    <td className="info-text">
                                        { query.session.source }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Client Address
                                    </td>
                                    <td className="info-text">
                                        { query.session.remoteUserAddress }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Submission Time
                                    </td>
                                    <td className="info-text">
                                        { formatShortDateTime(new Date(query.queryStats.createTime)) }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Completion Time
                                    </td>
                                    <td className="info-text">
                                        { query.queryStats.endTime ? formatShortDateTime(new Date(query.queryStats.endTime)) : "" }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Session Properties
                                    </td>
                                    <td className="info-text">
                                        { this.renderSessionProperties() }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-xs-6">
                        <h3>Data Source</h3>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="info-title">
                                        Catalog
                                    </td>
                                    <td className="info-text">
                                        { query.session.catalog }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Schema
                                    </td>
                                    <td className="info-text">
                                        { query.session.schema }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-xs-6">
                        <h3>Execution</h3>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="info-title">
                                        Elapsed Time
                                    </td>
                                    <td className="info-text">
                                        { query.queryStats.elapsedTime }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Queued Time
                                    </td>
                                    <td className="info-text">
                                        { query.queryStats.queuedTime }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="info-title">
                                        Resource Group
                                    </td>
                                    <td className="info-text">
                                        { query.resourceGroupName }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="row">
                            <div className="col-xs-6">
                                <h3>Resource Utilization Summary</h3>
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td className="info-title">
                                                CPU Time
                                            </td>
                                            <td className="info-text">
                                                { query.queryStats.totalCpuTime }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Input Rows
                                            </td>
                                            <td className="info-text">
                                                { formatCount(query.queryStats.processedInputPositions) }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Input Data
                                            </td>
                                            <td className="info-text">
                                                { query.queryStats.processedInputDataSize }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Raw Input Rows
                                            </td>
                                            <td className="info-text">
                                                { formatCount(query.queryStats.rawInputPositions) }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Raw Input Data
                                            </td>
                                            <td className="info-text">
                                                { query.queryStats.rawInputDataSize }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Peak Memory
                                            </td>
                                            <td className="info-text">
                                                { query.queryStats.peakMemoryReservation }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Memory Pool
                                            </td>
                                            <td className="info-text">
                                                { query.memoryPool }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Cumulative Memory
                                            </td>
                                            <td className="info-text">
                                                { formatDataSizeBytes(query.queryStats.cumulativeMemory / 1000.0, "") + " seconds" }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-xs-6">
                                <h3>Timeline</h3>
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td className="info-title">
                                                Parallelism
                                            </td>
                                            <td rowSpan="2">
                                                <div className="query-stats-sparkline-container">
                                                    <span className="sparkline" id="cpu-time-rate-sparkline"><div className="loader">Loading ...</div></span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-sparkline-text">
                                                { formatCount(this.state.cpuTimeRate[this.state.cpuTimeRate.length - 1]) }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Input Rows/s
                                            </td>
                                            <td rowSpan="2">
                                                <div className="query-stats-sparkline-container">
                                                    <span className="sparkline" id="row-input-rate-sparkline"><div className="loader">Loading ...</div></span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-sparkline-text">
                                                { formatCount(this.state.rowInputRate[this.state.rowInputRate.length - 1]) }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Input Bytes/s
                                            </td>
                                            <td rowSpan="2">
                                                <div className="query-stats-sparkline-container">
                                                    <span className="sparkline" id="byte-input-rate-sparkline"><div className="loader">Loading ...</div></span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-sparkline-text">
                                                { formatDataSize(this.state.byteInputRate[this.state.byteInputRate.length - 1]) }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-title">
                                                Memory Utilization
                                            </td>
                                            <td rowSpan="2">
                                                <div className="query-stats-sparkline-container">
                                                    <span className="sparkline" id="reserved-memory-sparkline"><div className="loader">Loading ...</div></span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="info-sparkline-text">
                                                { formatDataSize(this.state.reservedMemory[this.state.reservedMemory.length - 1]) }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                { this.renderFailureInfo() }
                <div className="row">
                    <div className="col-xs-12">
                        <h3>
                            Query
                            <a className="btn copy-button" data-clipboard-target="#query-text" data-toggle="tooltip" data-placement="right" title="Copy to clipboard">
                                <span className="glyphicon glyphicon-copy" aria-hidden="true" alt="Copy to clipboard" />
                            </a>
                        </h3>
                        <pre id="query">
                            <code className="lang-sql" id="query-text">
                                { query.query }
                            </code>
                        </pre>
                    </div>
                </div>
                { this.renderStages() }
                { this.renderTasks() }
            </div>
        );
    }
});

ReactDOM.render(
        <QueryDetail />,
        document.getElementById('query-detail')
);
