import { default as app } from '../index';
import fs from 'node:fs';

try {
  const doc = app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: {
      title: 'Echo API',
      version: '1.0.0',
      description: '受け取った入力値をそのまま応答するAPI',
    },
  });
  fs.writeFileSync('../frontend/openapi.json', JSON.stringify(doc, null, 2));
  console.info('OpenAPI document generated successfully');
} catch (error: unknown) {
  console.error('Failed to generate OpenAPI document');
  console.error(`Error Message: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
}
