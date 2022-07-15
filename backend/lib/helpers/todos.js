import { TodoAccess } from './todosAcess';
import * as uuid from 'uuid';
import { getUserId } from "../lambda/utils";
import * as AWS from 'aws-sdk';
const todoAccess = new TodoAccess();
export async function getTodos(event) {
    const userId = getUserId(event);
    return todoAccess.getTodos(userId);
}
export async function getTodo(event, todoId) {
    const userId = getUserId(event);
    return todoAccess.getTodo(userId, todoId);
}
export async function createTodo(event, newTodoData) {
    const todoId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date().toISOString();
    const done = false;
    const newTodo = Object.assign({ todoId, userId, createdAt, done }, newTodoData);
    return todoAccess.createTodo(newTodo);
}
export async function updateTodo(event, todoId, updateData) {
    const userId = getUserId(event);
    return todoAccess.updateTodo(userId, todoId, updateData);
}
export async function deleteTodo(event, todoId) {
    const userId = getUserId(event);
    return todoAccess.deleteTodo(userId, todoId);
}
export async function generateUploadUrl(event, todoId) {
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
//# sourceMappingURL=todos.js.map