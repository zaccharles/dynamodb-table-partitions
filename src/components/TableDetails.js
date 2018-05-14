import React, { Component } from 'react';

export default class TableDetails extends Component {
    render() {
        let streamStatus = this.props.streamEnabled ? "ENABLED" : "DISABLED";
        let streamStatusClass;

        if (this.props.streamInitiallyEnabled) {
            streamStatusClass = this.props.streamEnabled ? "success" : "warning";
        }
        else {
            streamStatusClass = this.props.streamEnabled ? "warning" : "success";
        }

        return (
            <div>
                <strong>Table:</strong> <span className="text-monospace">{this.props.tableName}</span><br />
                <strong>Status:</strong> <span className={"badge " + (this.props.tableStatus === "ACTIVE" ? "badge-success" : "badge-warning")}>{this.props.tableStatus}</span><br />
                <strong>DynamoDB Stream:</strong> <span  className={"badge badge-" + streamStatusClass}>{streamStatus}</span>
            </div>
        )
    }
}