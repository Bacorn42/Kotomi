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
