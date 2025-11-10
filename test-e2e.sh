#!/bin/bash

# End-to-End Test Script for LocalStack CRUD UI
# This script tests all AWS services via AWS CLI

set -e

ENDPOINT="http://localhost:4566"
REGION="us-east-1"

echo "============================================"
echo "LocalStack CRUD UI - End-to-End Test"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "1. Testing S3 Service"
echo "--------------------"

# Create bucket
aws --endpoint-url=$ENDPOINT s3 mb s3://test-bucket-e2e --region $REGION 2>/dev/null
test_result $? "Create S3 bucket"

# List buckets
aws --endpoint-url=$ENDPOINT s3 ls --region $REGION | grep "test-bucket-e2e" >/dev/null
test_result $? "List S3 buckets"

# Upload file
echo "Hello from LocalStack!" > /tmp/test-file.txt
aws --endpoint-url=$ENDPOINT s3 cp /tmp/test-file.txt s3://test-bucket-e2e/ --region $REGION 2>/dev/null
test_result $? "Upload object to S3"

# List objects
aws --endpoint-url=$ENDPOINT s3 ls s3://test-bucket-e2e/ --region $REGION | grep "test-file.txt" >/dev/null
test_result $? "List S3 objects"

# Download file
aws --endpoint-url=$ENDPOINT s3 cp s3://test-bucket-e2e/test-file.txt /tmp/test-file-downloaded.txt --region $REGION 2>/dev/null
test_result $? "Download object from S3"

# Delete object
aws --endpoint-url=$ENDPOINT s3 rm s3://test-bucket-e2e/test-file.txt --region $REGION 2>/dev/null
test_result $? "Delete S3 object"

# Delete bucket
aws --endpoint-url=$ENDPOINT s3 rb s3://test-bucket-e2e --region $REGION 2>/dev/null
test_result $? "Delete S3 bucket"

echo ""
echo "2. Testing DynamoDB Service"
echo "---------------------------"

# Create table
aws --endpoint-url=$ENDPOINT dynamodb create-table \
    --table-name test-table-e2e \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION >/dev/null 2>&1
test_result $? "Create DynamoDB table"

# List tables
aws --endpoint-url=$ENDPOINT dynamodb list-tables --region $REGION | grep "test-table-e2e" >/dev/null
test_result $? "List DynamoDB tables"

# Put item
aws --endpoint-url=$ENDPOINT dynamodb put-item \
    --table-name test-table-e2e \
    --item '{"id":{"S":"test-id-1"},"name":{"S":"Test Item"},"value":{"N":"42"}}' \
    --region $REGION >/dev/null 2>&1
test_result $? "Put item to DynamoDB"

# Get item
aws --endpoint-url=$ENDPOINT dynamodb get-item \
    --table-name test-table-e2e \
    --key '{"id":{"S":"test-id-1"}}' \
    --region $REGION | grep "test-id-1" >/dev/null
test_result $? "Get item from DynamoDB"

# Scan table
aws --endpoint-url=$ENDPOINT dynamodb scan \
    --table-name test-table-e2e \
    --region $REGION | grep "Test Item" >/dev/null
test_result $? "Scan DynamoDB table"

# Delete item
aws --endpoint-url=$ENDPOINT dynamodb delete-item \
    --table-name test-table-e2e \
    --key '{"id":{"S":"test-id-1"}}' \
    --region $REGION >/dev/null 2>&1
test_result $? "Delete item from DynamoDB"

# Delete table
aws --endpoint-url=$ENDPOINT dynamodb delete-table \
    --table-name test-table-e2e \
    --region $REGION >/dev/null 2>&1
test_result $? "Delete DynamoDB table"

echo ""
echo "3. Testing SQS Service"
echo "----------------------"

# Create queue
QUEUE_URL=$(aws --endpoint-url=$ENDPOINT sqs create-queue \
    --queue-name test-queue-e2e \
    --region $REGION \
    --output text --query 'QueueUrl')
test_result $? "Create SQS queue"

# List queues
aws --endpoint-url=$ENDPOINT sqs list-queues --region $REGION | grep "test-queue-e2e" >/dev/null
test_result $? "List SQS queues"

# Send message
aws --endpoint-url=$ENDPOINT sqs send-message \
    --queue-url $QUEUE_URL \
    --message-body "Test message from e2e test" \
    --region $REGION >/dev/null 2>&1
test_result $? "Send message to SQS"

# Receive message
MESSAGE=$(aws --endpoint-url=$ENDPOINT sqs receive-message \
    --queue-url $QUEUE_URL \
    --region $REGION 2>/dev/null | grep "Test message" || echo "")
if [ -n "$MESSAGE" ]; then
    test_result 0 "Receive message from SQS"
else
    test_result 1 "Receive message from SQS"
fi

# Delete queue
aws --endpoint-url=$ENDPOINT sqs delete-queue \
    --queue-url $QUEUE_URL \
    --region $REGION >/dev/null 2>&1
test_result $? "Delete SQS queue"

echo ""
echo "4. Testing SNS Service"
echo "----------------------"

# Create topic
TOPIC_ARN=$(aws --endpoint-url=$ENDPOINT sns create-topic \
    --name test-topic-e2e \
    --region $REGION \
    --output text --query 'TopicArn')
test_result $? "Create SNS topic"

# List topics
aws --endpoint-url=$ENDPOINT sns list-topics --region $REGION | grep "test-topic-e2e" >/dev/null
test_result $? "List SNS topics"

# Publish message
aws --endpoint-url=$ENDPOINT sns publish \
    --topic-arn $TOPIC_ARN \
    --message "Test notification from e2e test" \
    --region $REGION >/dev/null 2>&1
test_result $? "Publish message to SNS"

# Subscribe to topic
SUBSCRIPTION_ARN=$(aws --endpoint-url=$ENDPOINT sns subscribe \
    --topic-arn $TOPIC_ARN \
    --protocol email \
    --notification-endpoint test@example.com \
    --region $REGION \
    --output text --query 'SubscriptionArn')
test_result $? "Subscribe to SNS topic"

# Unsubscribe
aws --endpoint-url=$ENDPOINT sns unsubscribe \
    --subscription-arn $SUBSCRIPTION_ARN \
    --region $REGION >/dev/null 2>&1
test_result $? "Unsubscribe from SNS topic"

# Delete topic
aws --endpoint-url=$ENDPOINT sns delete-topic \
    --topic-arn $TOPIC_ARN \
    --region $REGION >/dev/null 2>&1
test_result $? "Delete SNS topic"

echo ""
echo "5. Testing Lambda Service"
echo "-------------------------"

# Create a simple Lambda function zip
cat > /tmp/lambda-function.js <<'EOF'
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello from Lambda!' })
    };
};
EOF

cd /tmp && zip lambda-function.zip lambda-function.js >/dev/null 2>&1
test_result $? "Create Lambda function package"

# Create Lambda function
aws --endpoint-url=$ENDPOINT lambda create-function \
    --function-name test-function-e2e \
    --runtime nodejs18.x \
    --handler lambda-function.handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --zip-file fileb:///tmp/lambda-function.zip \
    --region $REGION >/dev/null 2>&1
test_result $? "Create Lambda function"

# List functions
aws --endpoint-url=$ENDPOINT lambda list-functions --region $REGION | grep "test-function-e2e" >/dev/null
test_result $? "List Lambda functions"

# Invoke function
INVOKE_OUTPUT=$(aws --endpoint-url=$ENDPOINT lambda invoke \
    --function-name test-function-e2e \
    --region $REGION \
    /tmp/lambda-output.txt 2>&1)
if echo "$INVOKE_OUTPUT" | grep "200" >/dev/null; then
    test_result 0 "Invoke Lambda function"
else
    test_result 1 "Invoke Lambda function"
fi

# Delete function
aws --endpoint-url=$ENDPOINT lambda delete-function \
    --function-name test-function-e2e \
    --region $REGION >/dev/null 2>&1
test_result $? "Delete Lambda function"

# Cleanup
rm -f /tmp/test-file.txt /tmp/test-file-downloaded.txt /tmp/lambda-function.js /tmp/lambda-function.zip /tmp/lambda-output.txt

echo ""
echo "============================================"
echo "Test Summary"
echo "============================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
