import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { HEADERS } from "./statics";
import { createTodo } from "../../helpers/todos";
import { checkForExpiration } from "../auth/auth0Authorizer";
export const handler = middy(async (event) => {
    const newTodoBody = JSON.parse(event.body);
    if (!newTodoBody) {
        return {
            statusCode: 400,
            body: JSON.stringify("Wrong body sent to the request.")
        };
    }
    try {
        const newTodo = await createTodo(event, newTodoBody);
        await checkForExpiration(event.headers.Authorization);
        return {
            statusCode: 201,
            headers: HEADERS,
            body: JSON.stringify({ newTodo })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error })
        };
    }
});
handler.use(cors({
    credentials: true
}));
//# sourceMappingURL=createTodo.js.map