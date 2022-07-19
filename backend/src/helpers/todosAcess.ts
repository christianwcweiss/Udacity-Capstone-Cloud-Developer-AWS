import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoItemsAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoDynamoTable = process.env.TODO_DYNAMO_TABLE || '',
    private readonly todoIdDynamoIndex = process.env.TODO_ID_DYNAMO_INDEX || ''
  ) {}

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todoDynamoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async findItemById(userId: string, todoId: string): Promise<TodoItem | null> {
    const result = await this.docClient
      .query({
        TableName: this.todoDynamoTable,
        IndexName: this.todoIdDynamoIndex,
        ConsistentRead: true,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()

    if (result.Count === 0 || !result.Items) {
      return null
    }

    return result.Items[0] as TodoItem
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todoDynamoTable,
        Item: todoItem
      })
      .promise()

    return todoItem
  }

  async updateTodoItem(
    userId: string,
    todoId: string,
    update: TodoUpdate
  ): Promise<boolean> {
    const todoItem = await this.findItemById(userId, todoId)
    if (!todoItem) {
      return false
    }

    const createdAt = todoItem.createdAt

    await this.docClient
      .update({
        TableName: this.todoDynamoTable,
        Key: { userId, createdAt },
        UpdateExpression:
          'set #itemName = :itemName, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':itemName': update.name,
          ':dueDate': update.dueDate,
          ':done': update.done
        },
        ExpressionAttributeNames: {
          '#itemName': 'name'
        }
      })
      .promise()

    return true
  }

  async deleteTodoItem(userId: string, todoId: string): Promise<void> {
    const todoItem = await this.findItemById(userId, todoId)

    if (!todoItem) {
      return
    }

    const createdAt = todoItem.createdAt
    await this.docClient
      .delete({
        TableName: this.todoDynamoTable,
        Key: { userId, createdAt }
      })
      .promise()
  }
}
