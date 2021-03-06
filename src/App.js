import React, { Component } from 'react';
import './App.css';
import _  from 'lodash';

import InputsForm from './components/InputsForm';
import ProgressList from './components/ProgressList';
import TableDetails from './components/TableDetails';

import AwsApi from './api/AwsApi';

class App extends Component {
  constructor(props) {
    super(props);
    this.onInputsFormSubmit = this.onInputsFormSubmit.bind(this);
    this.onProceedClicked = this.onProceedClicked.bind(this);
    this.onBackOrRestartClick = this.onBackOrRestartClick.bind(this);

    this.tasks = {
      1: { text: "Wait for table to become active" },
      2: { text: "Enable table's DynamoDB Stream" },
      3: { text: "Wait for table to become active" },
      4: { text: "Get latest stream ARN" },
      5: { text: "Get number of shards in stream" },
      6: { text: "Disable table's DynamoDB Stream" },
      7: { text: "Wait for table to become active (slow)" }
    };

    this.state = {
      tasks: null,
      inputErrors: {},
      stage: 1
    }
  }

  onBackOrRestartClick() {
    this.setState({
      stage: 1,
      tasks: null,
      inputErrors: {},
      numberOfShards: null,
      tableName: null,
      tableStatus: null,
      streamInitiallyEnabled: null,
      streamEnabled: null,
      proceedHelpMessage: null,
      finished: false,
      error: null
    });
  }

  async onInputsFormSubmit(inputs) {
  this.setState({error: null});

    this.aws = new AwsApi(inputs);

    try {
      let tableStatus = await this.aws.getTableStatus(inputs.tableName);
      let streamEnabled = await this.aws.isTableStreamEnabled(inputs.tableName);

      this.setState({
        tableName: inputs.tableName,
        tableStatus,
        streamInitiallyEnabled: streamEnabled,
        streamEnabled,
        proceedHelpMessage: streamEnabled 
                              ? "The table's stream is already enabled, so this will be a read-only operation." 
                              : "The table's stream will be enabled then disabled.",
        stage: 2
      });
    }
    catch (e) {
      switch (e.code) {
        case "ExpiredTokenException":
          this.setState({ inputErrors: { accessKeyId: "The given credentials have expired.", secretAccessKey: " ", sessionToken: " " }})
        break;

        case "CredentialsError":
        case "UnrecognizedClientException":
        case "InvalidSignatureException":
          this.setState({ inputErrors: { accessKeyId: "The given credentials are not valid.", secretAccessKey: " ", sessionToken: " " }})
        break;

        case "ResourceNotFoundException":
          this.setState({ inputErrors: { tableName: "This table does not exist." }})
        break;

        default:
          this.setState({ error: `An unexpected error occurred while calling AWS: ${e}`})
      }
    }
  }

  async onProceedClicked() {
    await this.setState({ stage: 3, tasks: _.cloneDeep(this.tasks), numberOfShards: null });
    let currentTaskId = 0;

    try {
      // 1. Wait for table to become active
      currentTaskId = 1;
      await this.setTaskStatus(1, "inprogress");
      await this.waitForTableToHaveStatus(this.state.tableName, "ACTIVE");
      await this.setTaskStatus(1, "done");

      // 2. Enable table's DynamoDB Stream	
      if (this.state.streamInitiallyEnabled) {
        await this.setTaskStatus(2, "skip");
      }
      else {
        currentTaskId = 2;
        await this.setTaskStatus(2, "inprogress");
        await this.aws.enableTableStream(this.state.tableName);
        await this.setState({streamEnabled: true});
        await this.setTaskStatus(2, "done");
      }

      // 3. Wait for table to become active	
      if (this.state.streamInitiallyEnabled) {
        await this.setTaskStatus(3, "skip");
      }
      else {
        currentTaskId = 3;
        await this.setTaskStatus(3, "inprogress");
        await this.waitForTableToHaveStatus(this.state.tableName, "ACTIVE");
        await this.setTaskStatus(3, "done");
      }

      // 4. Get latest stream ARN
      currentTaskId = 4;
      await this.setTaskStatus(4, "inprogress");
      let latestStreamArn = await this.aws.getLatestStreamArn(this.state.tableName);
      await this.setTaskStatus(4, "done");

      // 5. Get number of shards in stream	
      currentTaskId = 5;
      await this.setTaskStatus(5, "inprogress");
      let numberOfShards = await this.aws.getNumberOfShardsInStream(latestStreamArn);
      this.setState({ numberOfShards });
      await this.setTaskStatus(5, "done");

      // 6. Disable table's DynamoDB Stream	
      if (this.state.streamInitiallyEnabled) {
        await this.setTaskStatus(6, "skip");
      }
      else {
        currentTaskId = 6;
        await this.setTaskStatus(6, "inprogress");
        await this.aws.disableTableStream(this.state.tableName);
        await this.setState({streamEnabled: false});
        await this.setTaskStatus(6, "done");
      }

      // 7. Wait for table to become active
      if (this.state.streamInitiallyEnabled) {
        await this.setTaskStatus(7, "skip");
      }
      else {
        currentTaskId = 7;
        await this.setTaskStatus(7, "inprogress");
        await this.waitForTableToHaveStatus(this.state.tableName, "ACTIVE");
        await this.setTaskStatus(7, "done");
      }

      // finished
      this.setState({finished: true});
    }
    catch (e) {
        await this.setTaskStatus(currentTaskId, "failed");
        this.setState({ error: `An unexpected error occurred while calling AWS: ${e}`})
        console.log(e, e.code, e.message);
    }
  }

  async waitForTableToHaveStatus(tableName, status) {
    console.log(`Waiting for ${tableName} to have status ${status}`)
    while (true) {
      let currentStatus = await this.aws.getTableStatus(this.state.tableName);
      console.log(`Current status is ${currentStatus}`);
      await this.setState({tableStatus: currentStatus});

      if (currentStatus === "ACTIVE") return;
      await this.sleep(1000);
    }
  }

  setTaskStatus(taskId, status) {
    return new Promise(resolve => {
      let tasks = {...this.state.tasks};
      tasks[taskId].status = status;
      this.setState({tasks}, resolve);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  render() {
    return (
      <div className="App">
        <div style={{display: this.state.stage === 1 ? "block" : "none"}}>
          <div className="alert alert-info" role="alert">
            <p>This is a simple tool to determine number of partitions in a DynamoDB table. It does so by looking at the number of shards in the table's DynamoDB Stream.</p>
            <p>If the table doesn't have its stream enabled, the tool will enable it temporarily and disable it after getting the number of shards.</p>
            <p>Checkout the repo on <a href="https://github.com/zaccharles/dynamodb-table-partitions">GitHub</a> for more details.</p>
          </div>
          { this.state.error ? (<div className="alert alert-danger" role="alert"><strong>Oops!</strong> {this.state.error}</div>) : null }
          <InputsForm onSubmit={this.onInputsFormSubmit} errors={this.state.inputErrors} />
        </div>

        <div style={{display: this.state.stage === 2 ? "block" : "none"}}>
          { this.state.error ? (<div className="alert alert-danger" role="alert"><strong>Oops!</strong> {this.state.error}</div>) : null }
          <TableDetails tableName={this.state.tableName} tableStatus={this.state.tableStatus} streamEnabled={this.state.streamEnabled} streamInitiallyEnabled={this.state.streamInitiallyEnabled} />
          <br />
          <button type="button" className="btn btn-primary" onClick={this.onProceedClicked}>Proceed</button>
          <button type="button" className="btn btn-link" onClick={this.onBackOrRestartClick}>Go Back</button>
          <small id="submitHelpBlock" className="form-text text-muted">
            {this.state.proceedHelpMessage}
          </small>
        </div>

        <div style={{display: this.state.stage === 3 ? "block" : "none"}}>
          <TableDetails tableName={this.state.tableName} tableStatus={this.state.tableStatus} streamEnabled={this.state.streamEnabled} streamInitiallyEnabled={this.state.streamInitiallyEnabled} />
          <br />
          { this.state.error ? (<div className="alert alert-danger" role="alert"><strong>Oops!</strong> {this.state.error}</div>) : null }
          <ProgressList tasks={this.state.tasks} />
          { !!this.state.numberOfShards && !this.state.finished ? (
            <div>
              <div className="alert alert-success" role="alert">This table has <strong>{this.state.numberOfShards}</strong> partition(s)</div>
              <button type="button" className="btn btn-primary disabled">Please wait...</button>
              <small id="submitHelpBlock" className="form-text text-muted">
              There are actions still in progress.
              </small>
            </div>
          ) : null }
          { !!this.state.numberOfShards && this.state.finished ? (
            <div>
              <div className="alert alert-success" role="alert">This table has <strong>{this.state.numberOfShards}</strong> partition(s)</div>
              <button type="button" className="btn btn-primary" onClick={this.onBackOrRestartClick}>Restart</button>
            </div>
          ) : null }
        </div>
      </div>        
    )
  }
}

export default App;
