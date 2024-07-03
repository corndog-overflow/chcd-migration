-- Import data into tables
INSERT INTO people (
    id, family_name_western, given_name_western, alternative_name_western,
    chinese_family_name_hanzi, chinese_given_name_hanzi, alternative_chinese_name_hanzi,
    chinese_family_name_romanized, chinese_given_name_romanized, birth_day, birth_month,
    birth_year, birth_place, death_day, death_month, death_year, death_place, burial_place,
    gender, nationality, embarkment, title, occupation, degree, christian_tradition,
    religious_family, baptism, confirmation, vestition, ordination_deacon, ordination_priest,
    ordination_bishop, ordination_archbishop, beatification, canonization, notes, source
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), family_name_western, given_name_western, alternative_name_western,
    chinese_family_name_hanzi, chinese_given_name_hanzi, alternative_chinese_name_hanzi,
    chinese_family_name_romanized, chinese_given_name_romanized, birth_day, birth_month,
    birth_year, birth_place, death_day, death_month, death_year, death_place, burial_place,
    gender, nationality, embarkment, title, occupation, degree, christian_tradition,
    religious_family, baptism, confirmation, vestition, ordination_deacon, ordination_priest,
    ordination_bishop, ordination_archbishop, beatification, canonization, notes, source
FROM temp_nodes
WHERE label = 'Person';

-- Insert data into Institutions table
INSERT INTO institutions (
    id, name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_romanized, alternative_name_romanized,
    institution_category, institution_subcategory, nationality, gender_served,
    christian_tradition, religious_family, notes, source
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_rom, alternative_chinese_name_romanized,
    institution_category, institution_subcategory, nationality, gender_served,
    christian_tradition, religious_family, notes, source
FROM temp_nodes
WHERE label = 'Institution';

INSERT INTO CorporateEntities (
    id, name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_romanized, alternative_name_romanized,
    abbreviation, other_abbreviation, corporate_entity_category, corporate_entity_subcategory,
    nationality, china_start, christian_tradition, religious_family, start_day, start_month,
    start_year, end_day, end_month, end_year, notes, source
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_rom, alternative_chinese_name_romanized,
    abbreviation, other_abbreviation, corporate_entity_category, corporate_entity_subcategory,
    nationality, china_start, christian_tradition, religious_family, start_day, start_month,
    start_year, end_day, end_month, end_year, notes, source
FROM temp_nodes
WHERE label = 'CorporateEntity';

INSERT INTO Publications (
    id, name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, chinese_name_romanized, alternative_chinese_name_romanized,
    issue_frequency, circulation, format, price,
    publication_language, publication_category, publication_subcategory, start_day, start_month,
    start_year, end_day, end_month, end_year, notes, source
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_rom, alternative_chinese_name_romanized,
    issue_frequency, circulation, format, price, publication_language,
    publication_category, publication_subcategory, start_day, start_month,
    start_year, end_day, end_month, end_year, notes, source
FROM temp_nodes
WHERE label = 'Publication';

INSERT INTO Events (
    id, name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_romanized, alternative_name_romanized,
    event_category, event_subcategory, christian_tradition, religious_family,
    start_day, start_month, start_year, end_day, end_month, end_year, notes, source
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), name_western, alternative_name_western, chinese_name_hanzi,
    alternative_chinese_name_hanzi, name_rom, alternative_chinese_name_romanized,
    event_category, event_subcategory, christian_tradition, religious_family,
    start_day, start_month, start_year, end_day, end_month, end_year, notes, source
FROM temp_nodes
WHERE label = 'Event';

INSERT INTO GeneralAreas (
    id, name_western, alternative_name_western
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), name_western, alternative_name_western
FROM temp_nodes
WHERE label = 'GeneralArea';

INSERT INTO GeographyNode (
    id, level, name_wes, name_zh, name_rom, latitude, longitude
)
SELECT
    CAST(SUBSTRING(chcd_id,3) AS INTEGER), CAST(SUBSTRING(chcd_id,1,1) AS CHAR),name_wes, name_zh, name_rom, latitude, longitude
FROM temp_nodes
WHERE label in ('Village', 'Township', 'County', 'Prefecture', 'Province', 'Nation')
ON CONFLICT DO NOTHING;
