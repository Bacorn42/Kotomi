CREATE TABLE IF NOT EXISTS Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Sessions (
    SessionID TEXT PRIMARY KEY,
    UserID INTEGER NOT NULL,
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiresDate TEXT NOT NULL,
    
    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ImageGeneratorImages
(
    ImageID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Filename TEXT NOT NULL,
    Prompt TEXT NOT NULL,
    EnhancedPrompt TEXT,
    Width INTEGER NOT NULL,
    Height INTEGER NOT NULL,
    Steps INTEGER NOT NULL,
    Seed INTEGER,
    Model TEXT,
    CreatedDate TEXT NOT NULL,

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGameRolls (
    RollID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    DiceValues TEXT NOT NULL,
    DiceCount INTEGER NOT NULL,
    Weights TEXT NOT NULL,
    Score INTEGER NOT NULL,
    MoneyCents INTEGER NOT NULL,
    CreatedDate TEXT NOT NULL,

    FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGameAchievements (
    AchievementID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    Description TEXT NOT NULL,
    Icon TEXT NOT NULL,
    RequirementType TEXT NOT NULL,
    RequirementValue INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS DiceGameUserAchievements (
    UserID INTEGER NOT NULL,
    AchievementID INTEGER NOT NULL,
    UnlockedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (
        UserID,
        AchievementID
    ),

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE,

    FOREIGN KEY(AchievementID)
        REFERENCES DiceGameAchievements(AchievementID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGamePlayers
(
    UserID INTEGER PRIMARY KEY,
    MoneyCents INTEGER NOT NULL DEFAULT 0,
    DiceSkin TEXT NOT NULL DEFAULT 'classic',
    MaxActiveItems INTEGER NOT NULL DEFAULT 2,
    LastRollTime TEXT,
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGameItemDefinitions
(
    DefinitionID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT NOT NULL,
    Icon TEXT NOT NULL,
    CostCents INTEGER NOT NULL,
    CanGenerate INTEGER NOT NULL DEFAULT 0,
    DropWeight INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS DiceGameItemDefinitionEffects
(
    EffectID INTEGER PRIMARY KEY AUTOINCREMENT,
    DefinitionID INTEGER NOT NULL,
    EffectType TEXT NOT NULL,
    EffectData TEXT NOT NULL,

    FOREIGN KEY (DefinitionID)
        REFERENCES DiceGameItemDefinitions(DefinitionID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGamePlayerItems
(
    PlayerItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    DefinitionID INTEGER NOT NULL,
    GeneratedName TEXT,
    Rarity TEXT,
    IsEquipped INTEGER NOT NULL DEFAULT 0,
    ObtainedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE,

    FOREIGN KEY (DefinitionID)
        REFERENCES DiceGameItemDefinitions(DefinitionID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGamePlayerItemEffects
(
    EffectID INTEGER PRIMARY KEY AUTOINCREMENT,
    PlayerItemID INTEGER NOT NULL,
    EffectType TEXT NOT NULL,
    EffectData TEXT NOT NULL,

    FOREIGN KEY (PlayerItemID)
        REFERENCES DiceGamePlayerItems(PlayerItemID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DiceGameUpgradeDefinitions
(
    UpgradeID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT NOT NULL,
    CostCents INTEGER NOT NULL,
    UpgradeType TEXT NOT NULL,
    UpgradeData TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS DiceGamePlayerUpgrades
(
    PlayerUpgradeID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    UpgradeID INTEGER NOT NULL,
    PurchasedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(UserID, UpgradeID),

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE,

    FOREIGN KEY(UpgradeID)
        REFERENCES DiceGameUpgradeDefinitions(UpgradeID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ChatConversations (
    ConversationID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Title TEXT NOT NULL DEFAULT 'New Chat',
    Model TEXT,
    LastPromptTokens INTEGER CHECK (LastPromptTokens >= 0),
    LastResponseTokens INTEGER CHECK (LastResponseTokens >= 0),
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ChatMessages (
    MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
    ConversationID INTEGER NOT NULL,
    Role TEXT NOT NULL
        CHECK (Role IN ('user', 'assistant', 'system')),
    Content TEXT NOT NULL,
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ConversationID)
        REFERENCES ChatConversations(ConversationID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ChatSettings (
    UserID INTEGER PRIMARY KEY,
    DefaultModel TEXT,
    ContextWindow INTEGER NOT NULL DEFAULT 8192
        CHECK (ContextWindow > 0),
    Temperature REAL NOT NULL DEFAULT 0.7
        CHECK (Temperature >= 0.0 AND Temperature <= 2.0),

    FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_ChatConversations_UserID_UpdatedDate
    ON ChatConversations(UserID, UpdatedDate DESC);

CREATE INDEX IF NOT EXISTS IX_ChatMessages_ConversationID_MessageID
    ON ChatMessages(ConversationID, MessageID);


CREATE TABLE IF NOT EXISTS MusicTracks (
    TrackID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    StorageKey TEXT NOT NULL UNIQUE,
    OriginalFilename TEXT,
    Title TEXT NOT NULL CHECK(length(trim(Title)) > 0),
    Artist TEXT,
    Album TEXT,
    AlbumArtist TEXT,
    Genre TEXT,
    Duration REAL CHECK(Duration IS NULL OR Duration >= 0),
    FileSize INTEGER NOT NULL CHECK(FileSize >= 0),
    Format TEXT NOT NULL,
    MimeType TEXT NOT NULL,
    TrackNumber INTEGER CHECK(TrackNumber IS NULL OR TrackNumber > 0),
    DiscNumber INTEGER CHECK(DiscNumber IS NULL OR DiscNumber > 0),
    FileHash TEXT,
    ArtworkStorageKey TEXT,
    AddedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(UserID, TrackID),

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MusicPlaylists (
    PlaylistID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Name TEXT NOT NULL CHECK(length(trim(Name)) > 0),
    Description TEXT,
    ArtworkStorageKey TEXT,
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(UserID, PlaylistID),

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MusicPlaylistTracks (
    UserID INTEGER NOT NULL,
    PlaylistID INTEGER NOT NULL,
    TrackID INTEGER NOT NULL,
    Position INTEGER NOT NULL CHECK(Position >= 0),

    PRIMARY KEY(PlaylistID, TrackID),
    UNIQUE(PlaylistID, Position),

    FOREIGN KEY(UserID, PlaylistID)
        REFERENCES MusicPlaylists(UserID, PlaylistID)
        ON DELETE CASCADE,

    FOREIGN KEY(UserID, TrackID)
        REFERENCES MusicTracks(UserID, TrackID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MusicTags (
    TagID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Name TEXT NOT NULL COLLATE NOCASE
        CHECK(length(trim(Name)) > 0),
    CreatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(UserID, TagID),
    UNIQUE(UserID, Name),

    FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MusicTrackTags (
    UserID INTEGER NOT NULL,
    TrackID INTEGER NOT NULL,
    TagID INTEGER NOT NULL,

    PRIMARY KEY(TrackID, TagID),

    FOREIGN KEY(UserID, TrackID)
        REFERENCES MusicTracks(UserID, TrackID)
        ON DELETE CASCADE,

    FOREIGN KEY(UserID, TagID)
        REFERENCES MusicTags(UserID, TagID)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_MusicTracks_UserID
    ON MusicTracks(UserID);

CREATE INDEX IF NOT EXISTS idx_MusicTracks_UserID_Title
    ON MusicTracks(UserID, Title COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_MusicTracks_UserID_Artist
    ON MusicTracks(UserID, Artist COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_MusicPlaylistTracks_UserID_PlaylistID
    ON MusicPlaylistTracks(UserID, PlaylistID);

CREATE INDEX IF NOT EXISTS idx_MusicPlaylistTracks_UserID_TrackID
    ON MusicPlaylistTracks(UserID, TrackID);

CREATE INDEX IF NOT EXISTS idx_MusicTrackTags_UserID_TagID
    ON MusicTrackTags(UserID, TagID);
