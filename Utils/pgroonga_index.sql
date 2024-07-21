CREATE EXTENSION IF NOT EXISTS pgroonga;

-- Only for testing purposes
SET enable_seqscan = off;

ALTER TABLE people
    ADD COLUMN full_text_search_content TEXT,
    ADD COLUMN full_text_name_content   TEXT;

UPDATE people
SET full_text_name_content = CONCAT_WS(' ',
                                       chinese_family_name_hanzi,
                                       chinese_given_name_hanzi,
                                       alternative_chinese_name_hanzi,
                                       family_name_western,
                                       given_name_western,
                                       alternative_name_western,
                                       chinese_family_name_romanized,
                                       chinese_given_name_romanized,
                                       alternative_chinese_name_romanized);

UPDATE people
SET full_text_search_content = CONCAT_WS(' ',
                                         birth_place,
                                         death_place,
                                         burial_place,
                                         gender,
                                         nationality,
                                         embarkment,
                                         title,
                                         occupation,
                                         degree,
                                         christian_tradition,
                                         religious_family,
                                         baptism,
                                         confirmation,
                                         vestition,
                                         ordination_deacon,
                                         ordination_priest,
                                         ordination_bishop,
                                         ordination_archbishop,
                                         beatification,
                                         canonization,
                                         notes,
                                         source);

CREATE INDEX pgroonga_memos_index
    ON people
        USING pgroonga ((ARRAY [full_text_name_content, full_text_search_content]))
    WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');

SELECT pgroonga_score(tableoid, ctid) AS score, *
FROM people
WHERE ARRAY [full_text_name_content, full_text_search_content] &@~
      ('Mabel',
       ARRAY [5, 1],
       ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
       'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
ORDER BY score DESC;

-- CorporateEntities
ALTER TABLE CorporateEntities
    ADD COLUMN full_text_search_content TEXT,
    ADD COLUMN full_text_name_content   TEXT;

UPDATE CorporateEntities
SET full_text_name_content = CONCAT_WS(' ',
                                       chinese_name_hanzi,
                                       alternative_chinese_name_hanzi,
                                       name_western,
                                       alternative_name_western,
                                       name_romanized,
                                       alternative_name_romanized
                             );

UPDATE CorporateEntities
SET full_text_search_content = CONCAT_WS(' ',
                                         abbreviation,
                                         other_abbreviation,
                                         corporate_entity_category,
                                         corporate_entity_subcategory,
                                         nationality,
                                         notes,
                                         source);

CREATE INDEX pgroonga_corporate_entities_index
    ON CorporateEntities
        USING pgroonga ((ARRAY [full_text_name_content, full_text_search_content]))
    WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');

-- Institutions
ALTER TABLE Institutions
    ADD COLUMN full_text_search_content TEXT,
    ADD COLUMN full_text_name_content   TEXT;

UPDATE Institutions
SET full_text_name_content = CONCAT_WS(' ',
                                       chinese_name_hanzi,
                                       alternative_chinese_name_hanzi,
                                       name_western,
                                       alternative_name_western,
                                       name_romanized,
                                       alternative_name_romanized
                             );

UPDATE Institutions
SET full_text_search_content = CONCAT_WS(' ',
                                         institution_category,
                                         institution_subcategory,
                                         nationality,
                                         gender_served,
                                         notes,
                                         source);

CREATE INDEX pgroonga_institutions_index
    ON Institutions
        USING pgroonga ((ARRAY [full_text_name_content, full_text_search_content]))
    WITH (tokenizer='TokenNgram
("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');

-- Publications
ALTER TABLE Publications
    ADD COLUMN full_text_search_content TEXT,
    ADD COLUMN full_text_name_content   TEXT;

UPDATE Publications
SET full_text_name_content = CONCAT_WS(' ',
                                       chinese_name_hanzi,
                                       alternative_chinese_name_hanzi,
                                       name_western,
                                       alternative_name_western,
                                       chinese_name_romanized,
                                       alternative_chinese_name_romanized
                             );

UPDATE Publications
SET full_text_search_content = CONCAT_WS(' ',
                                         issue_frequency,
                                         circulation,
                                         format,
                                         price,
                                         publication_language,
                                         publication_category,
                                         publication_subcategory,
                                         notes,
                                         source);

CREATE INDEX pgroonga_publications_index
    ON Publications
        USING pgroonga ((ARRAY [full_text_name_content, full_text_search_content]))
    WITH (tokenizer='TokenNgram
("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');

-- Events
ALTER TABLE Events
    ADD COLUMN full_text_search_content TEXT,
    ADD COLUMN full_text_name_content   TEXT;

UPDATE Events
SET full_text_name_content = CONCAT_WS(' ',
                                       chinese_name_hanzi,
                                       alternative_chinese_name_hanzi,
                                       name_western,
                                       alternative_name_western,
                                       name_romanized,
                                       alternative_name_romanized
                             );

UPDATE Events
SET full_text_search_content = CONCAT_WS(' ',
                                         event_category,
                                         event_subcategory,
                                         christian_tradition,
                                         religious_family,
                                         notes,
                                         source);

CREATE INDEX pgroonga_events_index
    ON Events
        USING pgroonga ((ARRAY [full_text_name_content, full_text_search_content]))
    WITH (tokenizer='TokenNgram
("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');
