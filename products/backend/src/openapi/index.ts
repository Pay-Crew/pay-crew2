import { default as app } from '../index';
import fs from 'node:fs';

try {
  const doc = app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: {
      title: 'Pay Crew2 API',
      version: '0.0.1',
      description: 'API documentation for Pay Crew2 backend',
    },
  });
  fs.writeFileSync('../frontend/openapi.json', JSON.stringify(doc, null, 2));
  console.info('OpenAPI document generated successfully');
} catch (error: unknown) {
  console.error('Failed to generate OpenAPI document');
  console.error(`Error Message: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
}
