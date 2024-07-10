-- Add the tsv_content column to the people table
ALTER TABLE people
    ADD COLUMN tsv_content TSVECTOR;

-- Update the tsv_content column with concatenated, vectorized text from relevant columns
UPDATE people
SET tsv_content = to_tsvector('english',
                              COALESCE(family_name_western, '') || ' ' ||
                              COALESCE(given_name_western, '') || ' ' ||
                              COALESCE(alternative_name_western, '') || ' ' ||
                              COALESCE(chinese_family_name_hanzi, '') || ' ' ||
                              COALESCE(chinese_given_name_hanzi, '') || ' ' ||
                              COALESCE(alternative_chinese_name_hanzi, '') || ' ' ||
                              COALESCE(chinese_family_name_romanized, '') || ' ' ||
                              COALESCE(chinese_given_name_romanized, '') || ' ' ||
                              COALESCE(alternative_chinese_name_romanized, '') || ' ' ||
                              COALESCE(birth_place, '') || ' ' ||
                              COALESCE(death_place, '') || ' ' ||
                              COALESCE(burial_place, '') || ' ' ||
                              COALESCE(gender, '') || ' ' ||
                              COALESCE(nationality, '') || ' ' ||
                              COALESCE(embarkment, '') || ' ' ||
                              COALESCE(title, '') || ' ' ||
                              COALESCE(occupation, '') || ' ' ||
                              COALESCE(degree, '') || ' ' ||
                              COALESCE(christian_tradition, '') || ' ' ||
                              COALESCE(religious_family, '') || ' ' ||
                              COALESCE(baptism, '') || ' ' ||
                              COALESCE(confirmation, '') || ' ' ||
                              COALESCE(vestition, '') || ' ' ||
                              COALESCE(ordination_deacon, '') || ' ' ||
                              COALESCE(ordination_priest, '') || ' ' ||
                              COALESCE(ordination_bishop, '') || ' ' ||
                              COALESCE(ordination_archbishop, '') || ' ' ||
                              COALESCE(beatification, '') || ' ' ||
                              COALESCE(canonization, '') || ' ' ||
                              COALESCE(notes, '') || ' ' ||
                              COALESCE(source, '')
                  );

-- Create a GIN index on the tsv_content column
CREATE INDEX people_tsv_content_idx ON people USING GIN (tsv_content);

-- CorporateEntities
ALTER TABLE CorporateEntities
    ADD COLUMN tsv_content TSVECTOR;
UPDATE CorporateEntities
SET tsv_content = to_tsvector('english',
                              COALESCE(name_western, '') || ' ' ||
                              COALESCE(alternative_name_western, '') || ' ' ||
                              COALESCE(chinese_name_hanzi, '') || ' ' ||
                              COALESCE(alternative_chinese_name_hanzi, '') || ' ' ||
                              COALESCE(name_romanized, '') || ' ' ||
                              COALESCE(alternative_name_romanized, '') || ' ' ||
                              COALESCE(abbreviation, '') || ' ' ||
                              COALESCE(other_abbreviation, '') || ' ' ||
                              COALESCE(corporate_entity_category, '') || ' ' ||
                              COALESCE(corporate_entity_subcategory, '') || ' ' ||
                              COALESCE(nationality, '') || ' ' ||
                              COALESCE(notes, '') || ' ' ||
                              COALESCE(source, '')
                  );
CREATE INDEX corporateentities_tsv_content_idx ON CorporateEntities USING GIN (tsv_content);

-- Institutions
ALTER TABLE Institutions
    ADD COLUMN tsv_content TSVECTOR;
UPDATE Institutions
SET tsv_content = to_tsvector('english',
                              COALESCE(name_western, '') || ' ' ||
                              COALESCE(alternative_name_western, '') || ' ' ||
                              COALESCE(chinese_name_hanzi, '') || ' ' ||
                              COALESCE(alternative_chinese_name_hanzi, '') || ' ' ||
                              COALESCE(name_romanized, '') || ' ' ||
                              COALESCE(alternative_name_romanized, '') || ' ' ||
                              COALESCE(institution_category, '') || ' ' ||
                              COALESCE(institution_subcategory, '') || ' ' ||
                              COALESCE(nationality, '') || ' ' ||
                              COALESCE(gender_served, '') || ' ' ||
                              COALESCE(notes, '') || ' ' ||
                              COALESCE(source, '')
                  );
CREATE INDEX institutions_tsv_content_idx ON Institutions USING GIN (tsv_content);

-- Publications
ALTER TABLE Publications
    ADD COLUMN tsv_content TSVECTOR;
UPDATE Publications
SET tsv_content = to_tsvector('english',
                              COALESCE(name_western, '') || ' ' ||
                              COALESCE(alternative_name_western, '') || ' ' ||
                              COALESCE(chinese_name_hanzi, '') || ' ' ||
                              COALESCE(alternative_chinese_name_hanzi, '') || ' ' ||
                              COALESCE(chinese_name_romanized, '') || ' ' ||
                              COALESCE(alternative_chinese_name_romanized, '') || ' ' ||
                              COALESCE(publication_category, '') || ' ' ||
                              COALESCE(publication_subcategory, '') || ' ' ||
                              COALESCE(publication_language, '') || ' ' ||
                              COALESCE(notes, '') || ' ' ||
                              COALESCE(source, '')
                  );
CREATE INDEX publications_tsv_content_idx ON Publications USING GIN (tsv_content);

-- Events
ALTER TABLE Events
    ADD COLUMN tsv_content TSVECTOR;
UPDATE Events
SET tsv_content = to_tsvector('english',
                              COALESCE(name_western, '') || ' ' ||
                              COALESCE(alternative_name_western, '') || ' ' ||
                              COALESCE(chinese_name_hanzi, '') || ' ' ||
                              COALESCE(alternative_chinese_name_hanzi, '') || ' ' ||
                              COALESCE(name_romanized, '') || ' ' ||
                              COALESCE(alternative_name_romanized, '') || ' ' ||
                              COALESCE(event_category, '') || ' ' ||
                              COALESCE(event_subcategory, '') || ' ' ||
                              COALESCE(notes, '') || ' ' ||
                              COALESCE(source, '')
                  );

CREATE INDEX events_tsv_content_idx ON Events USING GIN (tsv_content);

-- Sample query to search
SELECT *
FROM people
WHERE tsv_content @@ plainto_tsquery('english', 'Tom Mabel');

-- People
SELECT 'Person' AS type, id, tsv_content
FROM people
WHERE tsv_content @@ plainto_tsquery('english', 'Tom Mabel')
UNION
-- Institutions
SELECT 'Institution' AS type, id, tsv_content
FROM institutions
WHERE tsv_content @@ plainto_tsquery('english', 'Tom Mabel')
UNION
-- CorporateEntities
SELECT 'CorporateEntity' AS type, id, tsv_content
FROM corporateentities
WHERE tsv_content @@ plainto_tsquery('english', 'Tom Mabel')
UNION
-- Events
SELECT 'Event' AS type, id, tsv_content
FROM events
WHERE tsv_content @@ plainto_tsquery('english', 'Tom Mabel')
UNION
-- Publications
SELECT 'Publication' AS type, id, tsv_content
FROM publications
WHERE tsv_content @@ plainto_tsquery('english', 'Tom Mabel')
LIMIT 1000;