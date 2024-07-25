CREATE TABLE Nodes
(
    id TEXT PRIMARY KEY
);

-- Create base table for Geography Nodes
CREATE TABLE GeographyNodes
(
    id            TEXT PRIMARY KEY,
    name_wes      TEXT,
    name_zh       TEXT,
    name_rom      TEXT,
    latitude      DECIMAL,
    longitude     DECIMAL,
    township_id   TEXT,
    county_id     TEXT,
    prefecture_id TEXT,
    province_id   TEXT,
    nation_id     TEXT,
    FOREIGN KEY (township_id) REFERENCES GeographyNodes (id),
    FOREIGN KEY (county_id) REFERENCES GeographyNodes (id),
    FOREIGN KEY (prefecture_id) REFERENCES GeographyNodes (id),
    FOREIGN KEY (province_id) REFERENCES GeographyNodes (id),
    FOREIGN KEY (nation_id) REFERENCES GeographyNodes (id)
) INHERITS (Nodes);

-- Create tables for main entities
CREATE TABLE CorporateEntities
(
    id                             TEXT PRIMARY KEY,
    name_western                   TEXT,
    alternative_name_western       TEXT,
    chinese_name_hanzi             TEXT,
    alternative_chinese_name_hanzi TEXT,
    name_romanized                 TEXT,
    alternative_name_romanized     TEXT,
    abbreviation                   TEXT,
    other_abbreviation             TEXT,
    corporate_entity_category      TEXT,
    corporate_entity_subcategory   TEXT,
    nationality                    TEXT,
    china_start                    INTEGER,
    christian_tradition            TEXT,
    religious_family               TEXT,
    start_day                      INTEGER,
    start_month                    INTEGER,
    start_year                     INTEGER,
    end_day                        INTEGER,
    end_month                      INTEGER,
    end_year                       INTEGER,
    notes                          TEXT,
    source                         TEXT
) INHERITS (Nodes);

CREATE TABLE Institutions
(
    id                             TEXT PRIMARY KEY,
    name_western                   TEXT,
    alternative_name_western       TEXT,
    chinese_name_hanzi             TEXT,
    alternative_chinese_name_hanzi TEXT,
    name_romanized                 TEXT,
    alternative_name_romanized     TEXT,
    institution_category           TEXT,
    institution_subcategory        TEXT,
    nationality                    TEXT,
    gender_served                  TEXT,
    christian_tradition            TEXT,
    religious_family               TEXT,
    start_day                      INTEGER,
    start_month                    INTEGER,
    start_year                     INTEGER,
    end_day                        INTEGER,
    end_month                      INTEGER,
    end_year                       INTEGER,
    notes                          TEXT,
    source                         TEXT
) INHERITS (Nodes);

CREATE TABLE People
(
    id                                 TEXT PRIMARY KEY,
    family_name_western                TEXT,
    given_name_western                 TEXT,
    alternative_name_western           TEXT,
    chinese_family_name_hanzi          TEXT,
    chinese_given_name_hanzi           TEXT,
    alternative_chinese_name_hanzi     TEXT,
    chinese_family_name_romanized      TEXT,
    chinese_given_name_romanized       TEXT,
    alternative_chinese_name_romanized TEXT,
    birth_day                          INTEGER,
    birth_month                        INTEGER,
    birth_year                         INTEGER,
    birth_place                        TEXT,
    death_day                          INTEGER,
    death_month                        INTEGER,
    death_year                         INTEGER,
    death_place                        TEXT,
    burial_place                       TEXT,
    gender                             TEXT,
    nationality                        TEXT,
    embarkment                         TEXT,
    title                              TEXT,
    occupation                         TEXT,
    degree                             TEXT,
    christian_tradition                TEXT,
    religious_family                   TEXT,
    baptism                            TEXT,
    confirmation                       TEXT,
    vestition                          TEXT,
    ordination_deacon                  TEXT,
    ordination_priest                  TEXT,
    ordination_bishop                  TEXT,
    ordination_archbishop              TEXT,
    beatification                      TEXT,
    canonization                       TEXT,
    notes                              TEXT,
    source                             TEXT
) INHERITS (Nodes);

CREATE TABLE Publications
(
    id                                 TEXT PRIMARY KEY,
    name_western                       TEXT,
    alternative_name_western           TEXT,
    chinese_name_hanzi                 TEXT,
    alternative_chinese_name_hanzi     TEXT,
    chinese_name_romanized             TEXT,
    alternative_chinese_name_romanized TEXT,
    edition                            INTEGER,
    volume_number                      INTEGER,
    issue_number                       INTEGER,
    issue_frequency                    TEXT,
    circulation                        TEXT,
    format                             TEXT,
    price                              TEXT,
    publication_language               TEXT,
    publication_category               TEXT,
    publication_subcategory            TEXT,
    start_day                          INTEGER,
    start_month                        INTEGER,
    start_year                         INTEGER,
    end_day                            INTEGER,
    end_month                          INTEGER,
    end_year                           INTEGER,
    notes                              TEXT,
    source                             TEXT
) INHERITS (Nodes);

CREATE TABLE Events
(
    id                             TEXT PRIMARY KEY,
    name_western                   TEXT,
    alternative_name_western       TEXT,
    chinese_name_hanzi             TEXT,
    alternative_chinese_name_hanzi TEXT,
    name_romanized                 TEXT,
    alternative_name_romanized     TEXT,
    event_category                 TEXT,
    event_subcategory              TEXT,
    christian_tradition            TEXT,
    religious_family               TEXT,
    start_day                      INTEGER,
    start_month                    INTEGER,
    start_year                     INTEGER,
    end_day                        INTEGER,
    end_month                      INTEGER,
    end_year                       INTEGER,
    notes                          TEXT,
    source                         TEXT
) INHERITS (Nodes);

CREATE TABLE GeneralAreas
(
    id                       TEXT PRIMARY KEY,
    name_western             TEXT,
    alternative_name_western TEXT
) INHERITS (Nodes);

-- Create relationship tables
CREATE TABLE Relationship
(
    entity_from_id TEXT,
    entity_to_id   TEXT,
    rel_type       TEXT,
    start_day      INTEGER,
    start_month    INTEGER,
    start_year     INTEGER,
    end_day        INTEGER,
    end_month      INTEGER,
    end_year       INTEGER,
    notes          TEXT,
    source         TEXT,

    PRIMARY KEY (entity_from_id, entity_to_id)
);

CREATE TABLE PartOf
(
) INHERITS (Relationship);

CREATE TABLE PresentAt
(
) INHERITS (Relationship);

CREATE TABLE People_RelatedTo_People
(
    FOREIGN KEY (entity_from_id) REFERENCES People (id),
    FOREIGN KEY (entity_to_id) REFERENCES People (id)
) INHERITS (Relationship);

CREATE TABLE LinkedTo
(
) INHERITS (Relationship);

CREATE TABLE InvolvedWith
(
) INHERITS (Relationship);

CREATE TABLE LocatedIn
(
) INHERITS (Relationship);

CREATE TABLE Institutions_PartOf_CorporateEntities
(
    FOREIGN KEY (entity_from_id) REFERENCES Institutions (id),
    FOREIGN KEY (entity_to_id) REFERENCES CorporateEntities (id)
) INHERITS (PartOf);

CREATE TABLE Events_PartOf_CorporateEntities
(
    FOREIGN KEY (entity_from_id) REFERENCES Events (id),
    FOREIGN KEY (entity_to_id) REFERENCES CorporateEntities (id)
) INHERITS (PartOf);

CREATE TABLE People_PartOf_CorporateEntities
(
    FOREIGN KEY (entity_from_id) REFERENCES People (id),
    FOREIGN KEY (entity_to_id) REFERENCES CorporateEntities (id)
) INHERITS (PartOf);

CREATE TABLE CorporateEntities_PartOf_CorporateEntities
(
    FOREIGN KEY (entity_from_id) REFERENCES CorporateEntities (id),
    FOREIGN KEY (entity_to_id) REFERENCES CorporateEntities (id)
) INHERITS (PartOf);

CREATE TABLE People_PresentAt_Events
(
    FOREIGN KEY (entity_from_id) REFERENCES People (id),
    FOREIGN KEY (entity_to_id) REFERENCES Events (id)
) INHERITS (PresentAt);

CREATE TABLE People_PresentAt_Institutions
(
    FOREIGN KEY (entity_from_id) REFERENCES People (id),
    FOREIGN KEY (entity_to_id) REFERENCES Institutions (id)
) INHERITS (PresentAt);

CREATE TABLE People_PresentAt_GeneralAreas
(
    FOREIGN KEY (entity_from_id) REFERENCES People (id),
    FOREIGN KEY (entity_to_id) REFERENCES GeneralAreas (id)
) INHERITS (PresentAt);

CREATE TABLE Institutions_LinkedTo_Events
(
    FOREIGN KEY (entity_from_id) REFERENCES Institutions (id),
    FOREIGN KEY (entity_to_id) REFERENCES Events (id)
) INHERITS (LinkedTo);

CREATE TABLE Events_LinkedTo_Events
(
    FOREIGN KEY (entity_from_id) REFERENCES Events (id),
    FOREIGN KEY (entity_to_id) REFERENCES Events (id)
) INHERITS (LinkedTo);

CREATE TABLE Institutions_LinkedTo_Institutions
(
    FOREIGN KEY (entity_from_id) REFERENCES Institutions (id),
    FOREIGN KEY (entity_to_id) REFERENCES Institutions (id)
) INHERITS (LinkedTo);

CREATE TABLE People_InvolvedWith_Publications
(
    FOREIGN KEY (entity_from_id) REFERENCES People (id),
    FOREIGN KEY (entity_to_id) REFERENCES Publications (id)
) INHERITS (InvolvedWith);

CREATE TABLE CorporateEntities_InvolvedWith_Publications
(
    FOREIGN KEY (entity_from_id) REFERENCES CorporateEntities (id),
    FOREIGN KEY (entity_to_id) REFERENCES Publications (id)
) INHERITS (InvolvedWith);

CREATE TABLE Publications_InvolvedWith_Publications
(
    FOREIGN KEY (entity_from_id) REFERENCES Publications (id),
    FOREIGN KEY (entity_to_id) REFERENCES Publications (id)
) INHERITS (InvolvedWith);

CREATE TABLE Events_InvolvedWith_Publications
(
    FOREIGN KEY (entity_from_id) REFERENCES Events (id),
    FOREIGN KEY (entity_to_id) REFERENCES Publications (id)
) INHERITS (InvolvedWith);

CREATE TABLE Institutions_InvolvedWith_Publications
(
    FOREIGN KEY (entity_from_id) REFERENCES Institutions (id),
    FOREIGN KEY (entity_to_id) REFERENCES Publications (id)
) INHERITS (InvolvedWith);

CREATE TABLE Publications_InvolvedWith_GeneralAreas
(
    FOREIGN KEY (entity_from_id) REFERENCES Publications (id),
    FOREIGN KEY (entity_to_id) REFERENCES GeneralAreas (id)
) INHERITS (InvolvedWith);

CREATE TABLE Institutions_LocatedIn
(
    FOREIGN KEY (entity_from_id) REFERENCES Institutions (id),
    FOREIGN KEY (entity_to_id) REFERENCES GeographyNodes (id)
) INHERITS (LocatedIn);

CREATE TABLE Events_LocatedIn
(
    FOREIGN KEY (entity_from_id) REFERENCES Events (id),
    FOREIGN KEY (entity_to_id) REFERENCES GeographyNodes (id)
) INHERITS (LocatedIn);

CREATE TABLE GeneralAreas_LocatedIn
(
    FOREIGN KEY (entity_from_id) REFERENCES GeneralAreas (id),
    FOREIGN KEY (entity_to_id) REFERENCES GeographyNodes (id)
) INHERITS (LocatedIn);

-- Create tmp tables for import
CREATE TABLE temp_nodes
(
    neo4j_id                           INT PRIMARY KEY,
    label                              TEXT,
    chcd_id                            TEXT,
    abbreviation                       TEXT,
    alternative_chinese_name_hanzi     TEXT,
    alternative_chinese_name_romanized TEXT,
    alternative_name_western           TEXT,
    baptism                            TEXT,
    baptismal_name_western             TEXT,
    beatification                      TEXT,
    beatification_date                 TEXT,
    birth_day                          INTEGER,
    birth_month                        INTEGER,
    birth_place                        TEXT,
    birth_year                         INTEGER,
    burial_place                       TEXT,
    canonization_date                  TEXT,
    canonization                       TEXT,
    china_start                        INTEGER,
    chinese_family_name_hanzi          TEXT,
    chinese_family_name_romanized      TEXT,
    chinese_given_name_hanzi           TEXT,
    chinese_given_name_romanized       TEXT,
    chinese_name_hanzi                 TEXT,
    chinese_name_romanized             TEXT,
    christian_tradition                TEXT,
    circulation                        TEXT,
    confirmation                       TEXT,
    corporate_entity_category          TEXT,
    corporate_entity_subcategory       TEXT,
    death_day                          INTEGER,
    death_month                        INTEGER,
    death_place                        TEXT,
    death_year                         INTEGER,
    degree                             TEXT,
    embarkment                         TEXT,
    end_day                            INTEGER,
    end_month                          INTEGER,
    end_year                           INTEGER,
    event_category                     TEXT,
    event_subcategory                  TEXT,
    family_name_western                TEXT,
    format                             TEXT,
    gender                             TEXT,
    gender_served                      TEXT,
    given_name_western                 TEXT,
    institution_category               TEXT,
    institution_subcategory            TEXT,
    issue_frequency                    TEXT,
    latitude                           DECIMAL,
    longitude                          DECIMAL,
    name_rom                           TEXT,
    name_wes                           TEXT,
    name_western                       TEXT,
    name_zh                            TEXT,
    nationality                        TEXT,
    notes                              TEXT,
    occupation                         TEXT,
    ordination_archbishop              TEXT,
    ordination_bishop                  TEXT,
    ordination_deacon                  TEXT,
    ordination_priest                  TEXT,
    other_abbreviation                 TEXT,
    price                              TEXT,
    publication_category               TEXT,
    publication_language               TEXT,
    publication_subcategory            TEXT,
    religious_family                   TEXT,
    source                             TEXT,
    start_day                          INTEGER,
    start_month                        INTEGER,
    start_year                         INTEGER,
    title                              TEXT,
    vestition                          TEXT
);

CREATE TABLE temp_relationships
(
    start_id    INT,
    end_id      INT,
    type        TEXT,
    end_day     INTEGER,
    end_month   INTEGER,
    end_year    INTEGER,
    notes       TEXT,
    rel_type    TEXT,
    source      TEXT,
    start_day   INTEGER,
    start_month INTEGER,
    start_year  INTEGER
);

