import {TodoAccess} from './todosAcess'
import { TodoItem } from '../models/TodoItem'

import * as uuid from 'uuid'
import {getUserId} from "../lambda/utils";
import {TodoUpdate} from "../models/TodoUpdate";
import {TodoCreate} from "../models/TodoCreate";
import * as AWS from 'aws-sdk';
import {APIGatewayProxyEvent} from "aws-lambda";

const todoAccess = new TodoAccess();

export async function getTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  const userId: string = getUserId(event);
  return todoAccess.getTodos(userId);
}

export async function getTodo(event: APIGatewayProxyEvent, todoId: string): Promise<TodoItem> {
  const userId: string = getUserId(event);
  return todoAccess.getTodo(userId, todoId);
}

export async function createTodo(event: APIGatewayProxyEvent, newTodoData: TodoCreate): Promise<TodoItem> {
  const todoId = uuid.v4();
  const userId = getUserId(event);
  const createdAt = new Date().toISOString();
  const done = false;
  const newTodo: TodoItem = { todoId, userId, createdAt, done, ...newTodoData };
  return todoAccess.createTodo(newTodo);
}

export async function updateTodo(
event: APIGatewayProxyEvent,
todoId: string,
  updateData: TodoUpdate
): Promise<void> {
  const userId = getUserId(event);
  return todoAccess.updateTodo(userId, todoId, updateData);
}

export async function deleteTodo(event: APIGatewayProxyEvent, todoId: string): Promise<void> {
  const userId = getUserId(event);
  return todoAccess.deleteTodo(userId, todoId);
}

export async function generateUploadUrl(event: APIGatewayProxyEvent, todoId: string): Promise<string> {
  const userId = getUserId(event);
  const bucketName = process.env.IMAGES_S3_BUCKET;
  const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
  const s3 = new AWS.S3({ signatureVersion: 'v4' });
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
  await todoAccess.saveImgUrl(userId, todoId, bucketName);
  return signedUrl;
}