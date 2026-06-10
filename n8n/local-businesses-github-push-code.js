/**
 * n8n Code node: zet Pack JSON (publish) om naar GitHub Push velden.
 * Plaats tussen "Pack JSON (publish)" en "GitHub Push".
 *
 * Input:  { jsonText, stagingFileName, envelope, ... }
 * Output: { fileName, fileContent, byteSize, generatedAt, rowCount }
 */
const j = $input.first().json;
const fileContent = String(j.jsonText ?? '');
if (!fileContent) {
  throw new Error('Pack JSON: jsonText ontbreekt of is leeg');
}

const fileName = 'data/local-businesses.json';

return [
  {
    json: {
      fileName,
      fileContent,
      byteSize: Buffer.byteLength(fileContent, 'utf8'),
      generatedAt: j.envelope?.generatedAt ?? null,
      rowCount: j.envelope?.rowCount ?? null,
      stagingFileName: j.stagingFileName ?? 'local-businesses.staging.json',
    },
  },
];
