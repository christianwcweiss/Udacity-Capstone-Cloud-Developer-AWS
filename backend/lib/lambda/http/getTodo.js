import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getTodo } from "../../helpers/todos";
import { HEADERS } from "./statics";
export const handler = middy(async (event) => {
    const todoId = event.pathParameters.todoId;
    try {
        const todoItem = await getTodo(event, todoId);
        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({ todoItem })
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
//# sourceMappingURL=getTodo.js.map