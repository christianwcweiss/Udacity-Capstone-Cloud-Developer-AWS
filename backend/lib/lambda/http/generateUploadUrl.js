import 'source-map-support/register';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { HEADERS } from "./statics";
import { generateUploadUrl } from "../../helpers/todos";
export const handler = middy(async (event) => {
    const todoId = event.pathParameters.todoId;
    try {
        const signedUrl = await generateUploadUrl(event, todoId);
        return {
            statusCode: 201,
            headers: HEADERS,
            body: JSON.stringify({ uploadUrl: signedUrl })
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
handler
    .use(httpErrorHandler())
    .use(cors({
    credentials: true
}));
//# sourceMappingURL=generateUploadUrl.js.map