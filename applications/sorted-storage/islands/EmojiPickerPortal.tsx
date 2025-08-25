import { useState, useEffect, useRef } from "preact/hooks";
import { render } from "preact";

interface EmojiPickerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

// Comprehensive emoji collection organized by category with keywords
const EMOJI_KEYWORDS: Record<string, string[]> = {
  // Smileys
  "😀": ["grin", "happy", "smile", "face", "joy"],
  "😃": ["smiley", "happy", "joy", "smile", "face"],
  "😄": ["smile", "happy", "joy", "laugh", "face"],
  "😁": ["beaming", "grin", "smile", "happy", "face"],
  "😆": ["laugh", "happy", "lol", "satisfied", "face"],
  "😅": ["sweat", "smile", "nervous", "anxious", "face"],
  "🤣": ["rofl", "lmao", "laugh", "floor", "funny"],
  "😂": ["joy", "tears", "laugh", "cry", "lol"],
  "🙂": ["slight", "smile", "happy", "face"],
  "🙃": ["upside", "down", "silly", "face"],
  "😉": ["wink", "flirt", "smile", "face"],
  "😊": ["blush", "happy", "smile", "shy", "face"],
  "😇": ["angel", "halo", "innocent", "blessed", "face"],
  "🥰": ["love", "hearts", "adore", "crush", "face"],
  "😍": ["heart", "eyes", "love", "crush", "face"],
  "🤩": ["star", "eyes", "excited", "amazed", "wow"],
  "😘": ["kiss", "love", "flirt", "face"],
  "😗": ["kiss", "duck", "face", "pout"],
  "😚": ["kiss", "closed", "eyes", "face"],
  "😙": ["kiss", "smile", "face", "happy"],
  "😋": ["yum", "tongue", "delicious", "tasty", "face"],
  "😛": ["tongue", "playful", "silly", "face"],
  "😜": ["wink", "tongue", "silly", "playful", "face"],
  "🤪": ["crazy", "wild", "silly", "goofy", "face"],
  "😝": ["tongue", "closed", "eyes", "silly", "face"],
  "🤑": ["money", "dollar", "rich", "cash", "face"],
  "🤗": ["hug", "embrace", "warm", "friendly", "face"],
  "🤭": ["hand", "mouth", "giggle", "oops", "face"],
  "🤫": ["shh", "quiet", "silence", "secret", "face"],
  "🤔": ["think", "hmm", "consider", "ponder", "face"],
  "🤐": ["zip", "mouth", "secret", "quiet", "face"],
  "🤨": ["eyebrow", "skeptical", "suspicious", "doubt", "face"],
  "😐": ["neutral", "meh", "blank", "face"],
  "😑": ["expressionless", "blank", "meh", "face"],
  "😶": ["blank", "silent", "mute", "face"],
  "😏": ["smirk", "sly", "confident", "face"],
  "😒": ["unamused", "bored", "skeptical", "face"],
  "🙄": ["eyeroll", "whatever", "bored", "face"],
  "😬": ["grimace", "awkward", "nervous", "face"],
  "🤥": ["lie", "pinocchio", "dishonest", "face"],
  "😌": ["relieved", "calm", "peaceful", "face"],
  "😔": ["sad", "pensive", "depressed", "face"],
  "😪": ["sleepy", "tired", "drowsy", "face"],
  "🤤": ["drool", "hungry", "desire", "face"],
  "😴": ["sleep", "zzz", "tired", "face"],
  "😷": ["mask", "sick", "covid", "face"],
  "🤒": ["fever", "sick", "thermometer", "face"],
  "🤕": ["hurt", "bandage", "injured", "face"],
  
  // Objects
  "📁": ["folder", "directory", "files", "storage", "organize"],
  "📂": ["folder", "open", "directory", "files", "storage"],
  "📄": ["document", "file", "page", "paper", "text"],
  "📃": ["page", "document", "curl", "paper", "file"],
  "📋": ["clipboard", "checklist", "task", "list", "document"],
  "📌": ["pin", "tack", "attach", "mark", "location"],
  "📎": ["paperclip", "attach", "link", "clip", "document"],
  "🔗": ["link", "chain", "url", "connect", "hyperlink"],
  "📊": ["chart", "bar", "graph", "statistics", "data"],
  "📈": ["chart", "growth", "trend", "up", "increase"],
  "📉": ["chart", "decline", "trend", "down", "decrease"],
  "📐": ["triangle", "ruler", "geometry", "math", "measure"],
  "📏": ["ruler", "measure", "straight", "length", "tool"],
  "✂️": ["scissors", "cut", "snip", "trim", "tool"],
  "🖊️": ["pen", "write", "ballpoint", "ink", "tool"],
  "🖋️": ["pen", "fountain", "write", "ink", "tool"],
  "✒️": ["pen", "nib", "write", "ink", "tool"],
  "📝": ["memo", "note", "write", "document", "pencil"],
  "💼": ["briefcase", "business", "work", "office", "bag"],
  "📦": ["package", "box", "delivery", "shipping", "parcel"],
  "📫": ["mailbox", "mail", "letter", "flag", "inbox"],
  "📪": ["mailbox", "closed", "mail", "letter", "inbox"],
  "📬": ["mailbox", "open", "mail", "letter", "inbox"],
  "📭": ["mailbox", "empty", "mail", "letter", "inbox"],
  "💾": ["disk", "floppy", "save", "storage", "retro"],
  "💿": ["cd", "disc", "dvd", "media", "storage"],
  "📀": ["dvd", "disc", "cd", "media", "storage"],
  "🖥️": ["computer", "desktop", "monitor", "pc", "screen"],
  "💻": ["laptop", "computer", "macbook", "notebook", "tech"],
  "⌨️": ["keyboard", "type", "input", "keys", "computer"],
  "🖱️": ["mouse", "computer", "click", "cursor", "input"],
  "🖨️": ["printer", "print", "paper", "document", "office"],
  "☎️": ["phone", "telephone", "call", "contact", "retro"],
  "📱": ["mobile", "phone", "smartphone", "iphone", "cell"],
  "📞": ["phone", "call", "telephone", "receiver", "contact"],
  "📟": ["pager", "beeper", "message", "retro", "device"],
  "📠": ["fax", "machine", "document", "send", "office"],
  "🔋": ["battery", "power", "charge", "energy", "electric"],
  "🔌": ["plug", "electric", "power", "socket", "cord"],
  "💡": ["bulb", "light", "idea", "bright", "electric"],
  "🔦": ["flashlight", "torch", "light", "beam", "tool"],
  "🕯️": ["candle", "light", "flame", "wax", "fire"],
  "🗑️": ["trash", "bin", "delete", "garbage", "waste"],
  "🛢️": ["oil", "drum", "barrel", "fuel", "container"],
  "💸": ["money", "wings", "spend", "cash", "flying"],
  "💵": ["dollar", "money", "bill", "cash", "currency"],
  "💴": ["yen", "money", "bill", "cash", "currency"],
  "💶": ["euro", "money", "bill", "cash", "currency"],
  
  // Nature
  "🌲": ["evergreen", "tree", "pine", "forest", "nature"],
  "🌳": ["tree", "deciduous", "forest", "nature", "wood"],
  "🌴": ["palm", "tree", "tropical", "beach", "nature"],
  "🌵": ["cactus", "desert", "plant", "dry", "nature"],
  "🌾": ["wheat", "grain", "rice", "crop", "nature"],
  "🌿": ["herb", "leaf", "plant", "green", "nature"],
  "☘️": ["shamrock", "clover", "irish", "lucky", "nature"],
  "🍀": ["clover", "lucky", "four", "leaf", "nature"],
  "🍁": ["maple", "leaf", "autumn", "fall", "canada"],
  "🍂": ["leaves", "fallen", "autumn", "fall", "nature"],
  "🍃": ["leaf", "wind", "blow", "flutter", "nature"],
  "🌺": ["hibiscus", "flower", "tropical", "hawaii", "nature"],
  "🌻": ["sunflower", "flower", "yellow", "bright", "nature"],
  "🌹": ["rose", "flower", "red", "love", "romance"],
  "🌷": ["tulip", "flower", "spring", "easter", "nature"],
  "🌸": ["cherry", "blossom", "flower", "sakura", "spring"],
  "🌼": ["daisy", "flower", "white", "nature", "bloom"],
  "🌱": ["seedling", "sprout", "plant", "grow", "nature"],
  "🍄": ["mushroom", "fungus", "toadstool", "nature", "food"],
  "🌰": ["chestnut", "nut", "acorn", "autumn", "nature"],
  "🦋": ["butterfly", "insect", "wings", "nature", "fly"],
  "🐛": ["bug", "caterpillar", "insect", "nature", "crawl"],
  "🐜": ["ant", "insect", "bug", "nature", "small"],
  "🐝": ["bee", "honeybee", "insect", "buzz", "nature"],
  "🐞": ["ladybug", "beetle", "insect", "nature", "spots"],
  "🦗": ["cricket", "grasshopper", "insect", "nature", "jump"],
  "🕷️": ["spider", "arachnid", "web", "insect", "nature"],
  "🕸️": ["web", "spider", "cobweb", "trap", "nature"],
  "🦂": ["scorpion", "sting", "desert", "nature", "dangerous"],
  "🐢": ["turtle", "tortoise", "slow", "shell", "nature"],
  "🐍": ["snake", "serpent", "reptile", "nature", "slither"],
  "🦎": ["lizard", "gecko", "reptile", "nature", "small"],
  "🦖": ["trex", "dinosaur", "extinct", "prehistoric", "nature"],
  "🦕": ["dinosaur", "sauropod", "extinct", "prehistoric", "nature"],
  
  // Food
  "🍎": ["apple", "red", "fruit", "healthy", "food"],
  "🍊": ["orange", "citrus", "fruit", "vitamin", "food"],
  "🍋": ["lemon", "citrus", "sour", "yellow", "fruit"],
  "🍌": ["banana", "fruit", "yellow", "potassium", "food"],
  "🍉": ["watermelon", "fruit", "summer", "sweet", "food"],
  "🍇": ["grapes", "fruit", "wine", "bunch", "food"],
  "🍓": ["strawberry", "berry", "fruit", "sweet", "food"],
  "🍈": ["melon", "cantaloupe", "fruit", "sweet", "food"],
  "🍒": ["cherry", "cherries", "fruit", "red", "food"],
  "🍑": ["peach", "fruit", "fuzzy", "sweet", "food"],
  "🥭": ["mango", "tropical", "fruit", "sweet", "food"],
  "🍍": ["pineapple", "tropical", "fruit", "hawaii", "food"],
  "🥥": ["coconut", "tropical", "palm", "milk", "food"],
  "🥝": ["kiwi", "fruit", "green", "fuzzy", "food"],
  "🍅": ["tomato", "vegetable", "red", "salad", "food"],
  "🥑": ["avocado", "guacamole", "green", "healthy", "food"],
  "🥦": ["broccoli", "vegetable", "green", "healthy", "food"],
  "🥬": ["lettuce", "leafy", "green", "salad", "vegetable"],
  "🥒": ["cucumber", "pickle", "vegetable", "green", "food"],
  "🌶️": ["pepper", "chili", "hot", "spicy", "food"],
  "🌽": ["corn", "maize", "vegetable", "yellow", "food"],
  "🥕": ["carrot", "vegetable", "orange", "rabbit", "food"],
  "🥔": ["potato", "vegetable", "starch", "fries", "food"],
  "🍆": ["eggplant", "aubergine", "vegetable", "purple", "food"],
  "🥐": ["croissant", "french", "pastry", "bread", "breakfast"],
  "🍞": ["bread", "loaf", "wheat", "bakery", "food"],
  "🥖": ["baguette", "french", "bread", "long", "food"],
  "🥨": ["pretzel", "twisted", "snack", "salty", "food"],
  "🧀": ["cheese", "dairy", "yellow", "swiss", "food"],
  "🥚": ["egg", "breakfast", "protein", "shell", "food"],
  "🍳": ["egg", "fried", "cooking", "breakfast", "pan"],
  "🥞": ["pancakes", "breakfast", "syrup", "stack", "food"],
  "🥓": ["bacon", "meat", "breakfast", "pork", "food"],
  "🥩": ["steak", "meat", "beef", "raw", "food"],
  "🍗": ["chicken", "poultry", "drumstick", "meat", "food"],
  "🍖": ["meat", "bone", "ribs", "bbq", "food"],
  "🌭": ["hotdog", "sausage", "american", "fast", "food"],
  "🍔": ["burger", "hamburger", "fast", "food", "american"],
  "🍟": ["fries", "french", "potato", "fast", "food"],
  "🍕": ["pizza", "italian", "slice", "cheese", "food"],
  
  // Activities  
  "⚽": ["soccer", "football", "ball", "sport", "kick"],
  "🏀": ["basketball", "ball", "hoop", "sport", "nba"],
  "🏈": ["football", "american", "nfl", "sport", "ball"],
  "⚾": ["baseball", "ball", "sport", "mlb", "pitch"],
  "🥎": ["softball", "ball", "sport", "pitch", "game"],
  "🎾": ["tennis", "ball", "racket", "sport", "court"],
  "🏐": ["volleyball", "ball", "beach", "sport", "net"],
  "🏉": ["rugby", "ball", "sport", "tackle", "game"],
  "🥏": ["frisbee", "disc", "flying", "sport", "throw"],
  "🎱": ["pool", "billiards", "eight", "ball", "game"],
  "🏓": ["pingpong", "paddle", "table", "tennis", "sport"],
  "🏸": ["badminton", "racket", "birdie", "sport", "net"],
  "🏒": ["hockey", "ice", "stick", "puck", "sport"],
  "🏑": ["hockey", "field", "stick", "sport", "game"],
  "🥍": ["lacrosse", "stick", "net", "sport", "ball"],
  "🏏": ["cricket", "bat", "sport", "wicket", "game"],
  "🥅": ["goal", "net", "soccer", "hockey", "sport"],
  "⛳": ["golf", "flag", "hole", "sport", "green"],
  "🏹": ["archery", "bow", "arrow", "target", "sport"],
  "🎣": ["fishing", "pole", "hook", "sport", "catch"],
  "🥊": ["boxing", "glove", "fight", "sport", "punch"],
  "🥋": ["martial", "arts", "uniform", "karate", "judo"],
  "🎽": ["shirt", "running", "singlet", "sport", "marathon"],
  "🛹": ["skateboard", "skate", "trick", "sport", "wheels"],
  "🛷": ["sled", "sledge", "winter", "snow", "sport"],
  "⛷️": ["ski", "skiing", "snow", "winter", "sport"],
  "🏂": ["snowboard", "snow", "winter", "sport", "board"],
  "🏋️": ["weight", "lifting", "gym", "barbell", "sport"],
  "🤸": ["cartwheel", "gymnastics", "flip", "sport", "acrobat"],
  "🤺": ["fencing", "sword", "sport", "duel", "mask"],
  "🤾": ["handball", "throw", "sport", "ball", "game"],
  "🏇": ["horse", "racing", "jockey", "sport", "bet"],
  
  // Travel
  "🚗": ["car", "red", "automobile", "vehicle", "drive"],
  "🚕": ["taxi", "cab", "yellow", "vehicle", "transport"],
  "🚙": ["suv", "car", "blue", "vehicle", "drive"],
  "🚌": ["bus", "vehicle", "transport", "public", "school"],
  "🚎": ["trolley", "bus", "transport", "public", "vehicle"],
  "🏎️": ["race", "car", "f1", "fast", "sport"],
  "🚓": ["police", "car", "cop", "vehicle", "emergency"],
  "🚑": ["ambulance", "emergency", "medical", "vehicle", "hospital"],
  "🚒": ["fire", "truck", "engine", "emergency", "vehicle"],
  "🚐": ["minibus", "van", "vehicle", "transport", "group"],
  "🚚": ["truck", "delivery", "vehicle", "transport", "cargo"],
  "🚛": ["truck", "articulated", "lorry", "vehicle", "transport"],
  "🚜": ["tractor", "farm", "vehicle", "agriculture", "rural"],
  "🛵": ["scooter", "motor", "vespa", "vehicle", "transport"],
  "🏍️": ["motorcycle", "bike", "motor", "vehicle", "ride"],
  "🚲": ["bicycle", "bike", "cycle", "vehicle", "pedal"],
  "🛴": ["scooter", "kick", "vehicle", "transport", "ride"],
  "🚏": ["bus", "stop", "wait", "transport", "public"],
  "🛤️": ["railway", "track", "train", "rail", "transport"],
  "⛽": ["fuel", "gas", "pump", "station", "petrol"],
  "🚨": ["siren", "light", "emergency", "police", "alert"],
  "🚥": ["traffic", "light", "signal", "stop", "go"],
  "🚦": ["traffic", "light", "signal", "vertical", "stop"],
  "🚧": ["construction", "barrier", "warning", "roadwork", "caution"],
  "⚓": ["anchor", "ship", "boat", "marine", "nautical"],
  "⛵": ["sailboat", "yacht", "sailing", "boat", "marine"],
  "🚤": ["speedboat", "boat", "fast", "marine", "water"],
  "🛳️": ["ship", "cruise", "passenger", "boat", "marine"],
  "⛴️": ["ferry", "boat", "ship", "transport", "marine"],
  "🚢": ["ship", "boat", "vessel", "marine", "ocean"],
  "✈️": ["airplane", "plane", "flight", "travel", "fly"],
  "🛩️": ["airplane", "small", "plane", "private", "fly"],
  
  // Symbols
  "❤️": ["heart", "love", "red", "romance", "like"],
  "🧡": ["heart", "orange", "love", "warm", "care"],
  "💛": ["heart", "yellow", "love", "happy", "friendship"],
  "💚": ["heart", "green", "love", "nature", "health"],
  "💙": ["heart", "blue", "love", "trust", "loyalty"],
  "💜": ["heart", "purple", "love", "bts", "army"],
  "🖤": ["heart", "black", "dark", "gothic", "love"],
  "🤍": ["heart", "white", "pure", "love", "clean"],
  "🤎": ["heart", "brown", "love", "earth", "chocolate"],
  "💔": ["heart", "broken", "breakup", "sad", "hurt"],
  "❣️": ["heart", "exclamation", "love", "emphasis", "strong"],
  "💕": ["hearts", "two", "love", "pink", "cute"],
  "💞": ["hearts", "revolving", "love", "spinning", "cute"],
  "💓": ["heart", "beating", "pulse", "love", "alive"],
  "💗": ["heart", "growing", "love", "pink", "increase"],
  "💖": ["heart", "sparkling", "love", "shiny", "special"],
  "💘": ["heart", "arrow", "cupid", "love", "romance"],
  "💝": ["heart", "ribbon", "gift", "love", "present"],
  "⭐": ["star", "favorite", "best", "rating", "night"],
  "🌟": ["star", "glowing", "shining", "bright", "special"],
  "✨": ["sparkles", "stars", "magic", "shiny", "clean"],
  "⚡": ["lightning", "bolt", "electric", "fast", "power"],
  "🔥": ["fire", "flame", "hot", "lit", "trending"],
  "💥": ["explosion", "boom", "bang", "collision", "impact"],
  "☀️": ["sun", "sunny", "weather", "bright", "day"],
  "🌈": ["rainbow", "pride", "colorful", "weather", "hope"],
  "☁️": ["cloud", "weather", "sky", "cloudy", "white"],
  "🌧️": ["rain", "cloud", "weather", "wet", "drops"],
  "⛈️": ["storm", "thunder", "lightning", "weather", "cloud"],
  "🌩️": ["lightning", "storm", "thunder", "weather", "cloud"],
  "❄️": ["snowflake", "snow", "winter", "cold", "frozen"],
  "☃️": ["snowman", "winter", "snow", "cold", "frosty"],
  "🎯": ["target", "bullseye", "dart", "goal", "aim"],
  "🏆": ["trophy", "winner", "champion", "gold", "prize"],
  "🥇": ["medal", "gold", "first", "winner", "champion"],
  "🥈": ["medal", "silver", "second", "place", "runner"],
  "🥉": ["medal", "bronze", "third", "place", "winner"],
  "🏅": ["medal", "sports", "winner", "achievement", "award"],
  "🎖️": ["medal", "military", "honor", "decoration", "award"],
  "🏵️": ["rosette", "flower", "decoration", "award", "prize"],
  
  // Flags
  "🏁": ["checkered", "flag", "race", "finish", "start"],
  "🚩": ["flag", "red", "triangular", "golf", "warning"],
  "🏴": ["flag", "black", "pirate", "anarchist", "dark"],
  "🏳️": ["flag", "white", "surrender", "peace", "blank"],
  "🏳️‍🌈": ["pride", "flag", "rainbow", "lgbt", "gay"],
  "🏳️‍⚧️": ["trans", "flag", "transgender", "pride", "lgbt"],
  "🏴‍☠️": ["pirate", "flag", "jolly", "roger", "skull"],
  "🇺🇸": ["usa", "america", "flag", "united", "states"],
  "🇬🇧": ["uk", "britain", "flag", "england", "united"],
  "🇨🇦": ["canada", "flag", "maple", "leaf", "north"],
  "🇦🇺": ["australia", "flag", "aussie", "down", "under"],
  "🇩🇪": ["germany", "flag", "deutsch", "german", "europe"],
  "🇫🇷": ["france", "flag", "french", "tricolor", "europe"],
  "🇮🇹": ["italy", "flag", "italian", "italia", "europe"],
  "🇪🇸": ["spain", "flag", "spanish", "españa", "europe"],
  "🇲🇽": ["mexico", "flag", "mexican", "latino", "north"],
  "🇧🇷": ["brazil", "flag", "brazilian", "brasil", "south"],
  "🇦🇷": ["argentina", "flag", "argentinian", "south", "america"],
  "🇨🇳": ["china", "flag", "chinese", "asia", "prc"],
  "🇯🇵": ["japan", "flag", "japanese", "nippon", "asia"],
  "🇰🇷": ["korea", "south", "flag", "korean", "asia"],
  "🇮🇳": ["india", "flag", "indian", "bharat", "asia"],
  "🇷🇺": ["russia", "flag", "russian", "moscow", "europe"],
  "🇳🇱": ["netherlands", "flag", "dutch", "holland", "europe"],
  "🇸🇪": ["sweden", "flag", "swedish", "nordic", "europe"],
  "🇳🇴": ["norway", "flag", "norwegian", "nordic", "europe"],
  "🇩🇰": ["denmark", "flag", "danish", "nordic", "europe"],
  "🇫🇮": ["finland", "flag", "finnish", "nordic", "europe"],
  "🇮🇸": ["iceland", "flag", "icelandic", "nordic", "europe"],
  "🇵🇱": ["poland", "flag", "polish", "polska", "europe"],
  "🇨🇿": ["czech", "flag", "czechia", "prague", "europe"],
  "🇦🇹": ["austria", "flag", "austrian", "vienna", "europe"],
  "🇨🇭": ["switzerland", "flag", "swiss", "neutral", "europe"],
  "🇧🇪": ["belgium", "flag", "belgian", "brussels", "europe"],
  "🇵🇹": ["portugal", "flag", "portuguese", "lisbon", "europe"],
  "🇬🇷": ["greece", "flag", "greek", "athens", "europe"]
};

const EMOJI_DATA = {
  "Smileys": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
    "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
    "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
    "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
    "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕"
  ],
  "Objects": [
    "📁", "📂", "📄", "📃", "📋", "📌", "📎", "🔗",
    "📊", "📈", "📉", "📐", "📏", "✂️", "🖊️", "🖋️",
    "✒️", "📝", "💼", "📦", "📫", "📪", "📬", "📭",
    "💾", "💿", "📀", "🖥️", "💻", "⌨️", "🖱️", "🖨️",
    "☎️", "📱", "📞", "📟", "📠", "🔋", "🔌", "💡",
    "🔦", "🕯️", "🗑️", "🛢️", "💸", "💵", "💴", "💶"
  ],
  "Nature": [
    "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀",
    "🍁", "🍂", "🍃", "🌺", "🌻", "🌹", "🌷", "🌸",
    "🌼", "🌿", "🌱", "🌾", "🌵", "🌴", "🌳", "🌲",
    "🍄", "🌰", "🦋", "🐛", "🐜", "🐝", "🐞", "🦗",
    "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕"
  ],
  "Food": [
    "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈",
    "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑",
    "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🥔", "🍆",
    "🥐", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🥞",
    "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕"
  ],
  "Activities": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
    "🥏", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏",
    "🥅", "⛳", "🏹", "🎣", "🥊", "🥋", "🎽", "🛹",
    "🛷", "⛷️", "🏂", "🏋️", "🤸", "🤺", "🤾", "🏇"
  ],
  "Travel": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
    "🚒", "🚐", "🚚", "🚛", "🚜", "🛵", "🏍️", "🚲",
    "🛴", "🚏", "🛤️", "⛽", "🚨", "🚥", "🚦", "🚧",
    "⚓", "⛵", "🚤", "🛳️", "⛴️", "🚢", "✈️", "🛩️"
  ],
  "Symbols": [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "⭐", "🌟", "✨", "⚡", "🔥", "💥",
    "☀️", "🌈", "☁️", "🌧️", "⛈️", "🌩️", "❄️", "☃️",
    "🎯", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️"
  ],
  "Flags": [
    "🏁", "🚩", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇺🇸",
    "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸",
    "🇲🇽", "🇧🇷", "🇦🇷", "🇨🇳", "🇯🇵", "🇰🇷", "🇮🇳",
    "🇷🇺", "🇳🇱", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮", "🇮🇸",
    "🇵🇱", "🇨🇿", "🇦🇹", "🇨🇭", "🇧🇪", "🇵🇹", "🇬🇷"
  ]
};

// Icons for categories (using emojis as icons)
const CATEGORY_ICONS: Record<string, string> = {
  "Smileys": "😀",
  "Objects": "📁",
  "Nature": "🌿",
  "Food": "🍎",
  "Activities": "⚽",
  "Travel": "✈️",
  "Symbols": "❤️",
  "Flags": "🏁"
};

function EmojiPickerModal({ isOpen, onClose, onSelect, currentEmoji }: EmojiPickerPortalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Smileys");

  const getFilteredEmojis = () => {
    const searchTerm = search.trim().toLowerCase();
    
    if (searchTerm) {
      const results: string[] = [];
      const addedEmojis = new Set<string>();
      
      // First, search through individual emoji keywords
      Object.entries(EMOJI_KEYWORDS).forEach(([emoji, keywords]) => {
        if (keywords.some(keyword => keyword.includes(searchTerm))) {
          if (!addedEmojis.has(emoji)) {
            results.push(emoji);
            addedEmojis.add(emoji);
          }
        }
      });
      
      // Then, check category names
      Object.entries(EMOJI_DATA).forEach(([category, emojis]) => {
        if (category.toLowerCase().includes(searchTerm)) {
          emojis.forEach(emoji => {
            if (!addedEmojis.has(emoji)) {
              results.push(emoji);
              addedEmojis.add(emoji);
            }
          });
        }
      });
      
      return results;
    }
    
    return EMOJI_DATA[selectedCategory as keyof typeof EMOJI_DATA] || [];
  };

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setSearch(""); // Clear search when selecting
    onClose();
  };
  
  const handleClose = () => {
    setSearch(""); // Clear search when closing
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!isOpen) return null;

  return (
    <div>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999999,
        }}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000000,
          width: '340px',
          maxWidth: '90vw',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header with Title and Close Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#1a1a1a',
          }}>
            Choose an Emoji
          </h3>
          <button
            onClick={handleClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#666',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
              (e.target as HTMLElement).style.color = '#333';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
              (e.target as HTMLElement).style.color = '#666';
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{
            position: 'relative',
          }}>
            <input
              type="text"
              placeholder="Search emojis..."
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9f9f9',
                color: '#333',
                outline: 'none',
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#d0d0d0';
                (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e5e5';
                (e.target as HTMLInputElement).style.backgroundColor = '#f9f9f9';
              }}
              autoFocus
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Category Icons - Hidden when searching */}
        {!search && (
          <div style={{
            display: 'flex',
            padding: '8px',
            borderBottom: '1px solid #f0f0f0',
            overflowX: 'auto',
            gap: '4px',
          }}>
            {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px',
                  fontSize: '20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedCategory === category ? '#e8e8e8' : 'transparent',
                  cursor: 'pointer',
                  minWidth: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    (e.target as HTMLElement).style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
                title={category}
              >
                {icon}
              </button>
            ))}
          </div>
        )}
        
        {/* Search Results Indicator */}
        {search && (
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid #f0f0f0',
            fontSize: '13px',
            color: '#666',
          }}>
            Search results for "{search}" ({getFilteredEmojis().length} found)
          </div>
        )}

        {/* Emoji Grid */}
        <div style={{
          height: '250px',
          overflowY: 'auto',
          padding: '8px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '2px',
          }}>
            {getFilteredEmojis().map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                style={{
                  aspectRatio: '1',
                  padding: '4px',
                  fontSize: '24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentEmoji === emoji ? '#e8f4ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.1s',
                  fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, sans-serif',
                }}
                onMouseEnter={(e) => {
                  if (currentEmoji !== emoji) {
                    (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
                  }
                  (e.target as HTMLElement).style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = currentEmoji === emoji ? '#e8f4ff' : 'transparent';
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
          {getFilteredEmojis().length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>😔</div>
              <div style={{ fontSize: '14px' }}>No emojis found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmojiPickerPortal(props: EmojiPickerPortalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create container if needed
    if (props.isOpen) {
      if (!containerRef.current) {
        containerRef.current = document.createElement('div');
        containerRef.current.id = 'emoji-picker-portal-root';
        document.body.appendChild(containerRef.current);
      }
      
      // Render the modal
      render(
        <EmojiPickerModal {...props} />,
        containerRef.current
      );
    } else if (containerRef.current) {
      // Clean up
      render(null, containerRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        render(null, containerRef.current);
        if (containerRef.current.parentNode) {
          containerRef.current.parentNode.removeChild(containerRef.current);
        }
        containerRef.current = null;
      }
    };
  }, [props.isOpen, props.currentEmoji]);

  return null; // This component doesn't render anything in place
}