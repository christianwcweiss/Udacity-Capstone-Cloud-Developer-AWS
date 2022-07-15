import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');
import { createLogger } from '../utils/logger';
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');
export class TodoAccess {
    constructor(docClient = new XAWS.DynamoDB.DocumentClient(), todosTable = process.env.TODOS_TABLE) {
        this.docClient = docClient;
        this.todosTable = todosTable;
    }
    async getTodos(userId) {
        logger.info('Getting all todo items');
        const result = await this.docClient
            .query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
            .promise();
        return result.Items;
    }
    async getTodo(userId, todoId) {
        logger.info(`Getting todo item: ${todoId}`);
        const result = await this.docClient
            .query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        })
            .promise();
        const todoItem = result.Items[0];
        return todoItem;
    }
    async createTodo(newTodo) {
        logger.info(`Creating new todo item: ${newTodo.todoId}`);
        await this.docClient
            .put({
            TableName: this.todosTable,
            Item: newTodo
        })
            .promise();
        return newTodo;
    }
    async updateTodo(userId, todoId, updateData) {
        logger.info(`Updating a todo item: ${todoId}`);
        await this.docClient
            .update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ConditionExpression: 'attribute_exists(todoId)',
            UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
            ExpressionAttributeNames: { '#n': 'name' },
            ExpressionAttributeValues: {
                ':n': updateData.name,
                ':due': updateData.dueDate,
                ':dn': updateData.done
            }
        })
            .promise();
    }
    async deleteTodo(userId, todoId) {
        await this.docClient
            .delete({
            TableName: this.todosTable,
            Key: { userId, todoId }
        })
            .promise();
    }
    async saveImgUrl(userId, todoId, bucketName) {
        await this.docClient
            .update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ConditionExpression: 'attribute_exists(todoId)',
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
            }
        })
            .promise();
    }
}
//# sourceMappingURL=todosAcess.js.map