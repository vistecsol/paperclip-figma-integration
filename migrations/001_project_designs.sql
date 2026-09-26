CREATE TABLE plugin_figma_2fe47c3b41.project_designs (
  company_id text NOT NULL,
  project_id text NOT NULL,
  revision bigint NOT NULL CHECK (revision > 0 AND revision <= 9007199254740991),
  attachments jsonb NOT NULL CHECK (jsonb_typeof(attachments) = 'array' AND jsonb_array_length(attachments) <= 100),
  PRIMARY KEY (company_id, project_id)
);
