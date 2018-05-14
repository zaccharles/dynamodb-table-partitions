import React, { Component } from 'react';

export default class InputsForm extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      region: 'eu-west-1',
      tableName: '',
      accessKeyId: '',
      secretAccessKey: '',
      sessionToken: null
    };
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state);
  }

  render() {
        return (
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="region">Region</label>
              <select className="form-control" id="region" value={this.state.region} onChange={this.handleChange}>
                <option value="us-east-2">US East (Ohio)</option>
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-1">US West (N. California)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
                <option value="ap-northeast-3">Asia Pacific (Osaka-Local)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                <option value="ca-central-1">Canada (Central)</option>
                <option value="cn-north-1">China (Beijing)	cn</option>
                <option value="eu-central-1">EU (Frankfurt)</option>
                <option value="eu-west-1">EU (Ireland)</option>
                <option value="eu-west-2">EU (London)</option>
                <option value="eu-west-3">EU (Paris)</option>
                <option value="sa-east-1">South America (São Paulo)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tableName">Table Name</label>
              <input type="text" className={"form-control " + (!!this.props.errors.tableName ? "is-invalid" : "" )} id="tableName" required="required" onChange={this.handleChange} value={this.state.tableName} />
              <div className="invalid-feedback">{this.props.errors.tableName}</div>
            </div>
            <div className="form-group">
              <label htmlFor="accessKeyId">Access Key ID</label>
              <input type="text" className={"form-control " + (!!this.props.errors.accessKeyId ? "is-invalid" : "" )} id="accessKeyId" required="required" onChange={this.handleChange} value={this.state.accessKeyId} />
              <div className="invalid-feedback">{this.props.errors.accessKeyId}</div>
            </div>
            <div className="form-group">
              <label htmlFor="secretAccessKey">Secret Access Key</label>
              <input type="text" className={"form-control " + (!!this.props.errors.secretAccessKey ? "is-invalid" : "" )} id="secretAccessKey" onChange={this.handleChange} value={this.state.secretAccessKey} />
              <div className="invalid-feedback">{this.props.errors.secretAccessKey}</div>
            </div>
            <div className="form-group">
              <label htmlFor="sessionToken">Session Token <span className="text-muted">(optional)</span></label>
              <textarea className={"form-control " + (this.state.sessionToken && !!this.props.errors.sessionToken ? "is-invalid" : "" )} id="sessionToken" rows="3" onChange={this.handleChange}>{this.state.sessionToken}</textarea>
              <div className="invalid-feedback">{this.props.errors.sessionToken}</div>
            </div>
            <button type="submit" className="btn btn-primary">Check</button>
            <small id="submitHelpBlock" className="form-text text-muted">
              This is a read-only operation.
            </small>
          </form>
        )
    }
}