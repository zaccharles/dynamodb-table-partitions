const AWS = require('aws-sdk');

export default class AwsApi {
    constructor(options) {
        options.sessionToken = options.sessionToken || null;
        options.maxRetries = 2;

        this.dynamodb = new AWS.DynamoDB(options);
        this.dynamodbstreams = new AWS.DynamoDBStreams(options);
    }

    async getTableStatus(tableName) {
        let data = await this.dynamodb.describeTable({TableName: tableName}).promise();
        return data.Table.TableStatus;
    }

    async isTableStreamEnabled(tableName) {
        let data = await this.dynamodb.describeTable({TableName: tableName}).promise();
        if (!data.Table.StreamSpecification) return false;
        return data.Table.StreamSpecification.StreamEnabled;
    }

    async enableTableStream(tableName) {
        var params = {
            TableName: tableName,
            StreamSpecification: {
                StreamEnabled: true,
                StreamViewType: "KEYS_ONLY"
            }
        };

        await this.dynamodb.updateTable(params).promise();
    }

    async disableTableStream(tableName) {
        var params = {
            TableName: tableName,
            StreamSpecification: {
                StreamEnabled: false
            }
        };

        await this.dynamodb.updateTable(params).promise();
    }

    async getLatestStreamArn(tableName) {
        let data = await this.dynamodb.describeTable({TableName: tableName}).promise();
        return data.Table.LatestStreamArn;
    }

    async getNumberOfShardsInStream(streamArn) {
        let data = await this.dynamodbstreams.describeStream({StreamArn: streamArn}).promise();
        return data.StreamDescription.Shards.length;
    }
}