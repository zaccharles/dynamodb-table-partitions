# DynamoDB Table Partitions

This is a simple tool to determine number of [partitions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.Partitions.html) in a DynamoDB table. It does so by looking at the number of shards in the table's [DynamoDB Stream](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html). If the table doesn't have its stream enabled, the tool will enable it temporarily and disable it after getting the number of shards.

## Getting Started

As this is a client-side tool, you can just use it via [https://dynamodb-table-partitions.github.io](https://dynamodb-table-partitions.github.io/)  

Or, if you'd like to run the code locally, pull down this repository, run `npm install`, then `npm start`.

You'll need to enter AWS credentials with the following permissions on the chosen table:
 * `dynamodb:DescribeTable`
 * `dynamodb:DescribeStream`
 * `dynamodb:UpdateTable`

## Security

This tool only makes calls to the AWS DynamoDB and DynamoDB Streams APIs. It's entirely client-side and does not send any data or keys elsewhere.

## Safety
This tool is read-only except for temporarily enabling DynamoDB Streams on some tables. You will be informed if this is going to happen. AWS have confirmed that this operation is safe to do in production.

## Limitations
While DynamoDB Streams are enabled, the provisioned write capacity of your table will be limited to 40,000 units in us-east-1 and 10,000 units in all other regions.  

AWS may apply hidden API rate limiting if you automate this tool and run it too fast.

## Contributing

I'm just learning React, so if you find any mistakes or want to make any major refactorings, I'm all ears!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
