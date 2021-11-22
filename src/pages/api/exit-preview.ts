// eslint-disable-next-line @typescript-eslint/no-var-requires
const url = require('url');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function exit(req, res) {
  res.clearPreviewData();

  const queryObject = url.parse(req.url, true).query;
  const redirectUrl =
    queryObject && queryObject.currentUrl ? queryObject.currentUrl : '/';

  res.writeHead(307, { Location: redirectUrl });
  res.end();
}
