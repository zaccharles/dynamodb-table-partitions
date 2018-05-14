import React, { Component } from 'react';
import _  from 'lodash';

export default class ProgressList extends Component {
    render() {
        var tasks = _.keys(this.props.tasks).map( key => {
            let task = this.props.tasks[key];
            let status;
            let badgeStyles = { marginLeft: '3px' }

            switch (task.status) {
            case "skip":
                status = (<span style={badgeStyles} className="badge badge-info">Skip</span>)
                break;
            case "done":
                status = (<span style={badgeStyles} className="badge badge-success">Done</span>)
                break;
            case "failed":
                status = (<span style={badgeStyles} className="badge badge-danger">Failed</span>)
                break;
            case "inprogress":
                status = (<span style={badgeStyles} className="badge badge-primary">In Progress</span>)
                break;
            default:
                status = "";
                break;
            }

            return (
                <tr key={key}>
                    <td>
                        {task.text}
                    </td>
                    <td className="text-right">
                        {status}
                    </td>
                </tr>
            )
        });

        return (
            <div>
                <table className="table">
                    <tbody>
                        {tasks}
                    </tbody>
                </table>
            </div>
        )
    }
}