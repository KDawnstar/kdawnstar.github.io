// [카시야스 보스전] 렌더링 색상/팔레트 해석 전담 (render_palette_system.js)
const RenderPaletteSystem = {
    clampColorChannel: function(value, fallback = 0) {
    const n = Math.round(parseFloat(value));
    if (isNaN(n)) return fallback;
    return Math.max(0, Math.min(255, n));
    },
    rgbToHex: function(r, g, b) {
    const toHex = (v) => this.clampColorChannel(v).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    },
    resolveRgbPalette: function(r, g, b, fallbackPalette = null) {
    const isFilled = (v) => {
        return v !== null &&
            v !== undefined &&
            String(v).trim() !== '' &&
            !isNaN(parseFloat(v));
    };

    if (!isFilled(r) || !isFilled(g) || !isFilled(b)) {
        return fallbackPalette;
    }

    const baseR = this.clampColorChannel(r);
    const baseG = this.clampColorChannel(g);
    const baseB = this.clampColorChannel(b);

    const darkR = this.clampColorChannel(baseR * 0.52);
    const darkG = this.clampColorChannel(baseG * 0.52);
    const darkB = this.clampColorChannel(baseB * 0.52);

    const lightR = this.clampColorChannel(baseR + (255 - baseR) * 0.60);
    const lightG = this.clampColorChannel(baseG + (255 - baseG) * 0.60);
    const lightB = this.clampColorChannel(baseB + (255 - baseB) * 0.60);

    return {
        dark: this.rgbToHex(darkR, darkG, darkB),
        mid: this.rgbToHex(baseR, baseG, baseB),
        light: this.rgbToHex(lightR, lightG, lightB)
    };
    },
    resolvePlayerPalette: function(playerOrRenderColor, r = null, g = null, b = null) {
    const isObjectInput = playerOrRenderColor && typeof playerOrRenderColor === 'object';

    const renderColor = isObjectInput
        ? playerOrRenderColor.renderColor
        : playerOrRenderColor;

    const rgbR = isObjectInput ? playerOrRenderColor.renderColorR : r;
    const rgbG = isObjectInput ? playerOrRenderColor.renderColorG : g;
    const rgbB = isObjectInput ? playerOrRenderColor.renderColorB : b;

    const key = String(renderColor || '').trim().toUpperCase();

    const map = {
        COLOR_DEFAULT_HUMAN: { dark: '#2c5f86', mid: '#6dd5ed', light: '#dff6ff' },

        COLOR_BLUE: { dark: '#2b6ca3', mid: '#4aa3df', light: '#d8f0ff' },
        COLOR_DARK_BLUE: { dark: '#1f3f5a', mid: '#355c7d', light: '#a7c4dd' },
        COLOR_CYAN: { dark: '#117a8b', mid: '#38d9e9', light: '#dcfbff' },

        COLOR_RED: { dark: '#9f2f24', mid: '#e74c3c', light: '#ffd7d1' },
        COLOR_DARK_RED: { dark: '#6e1f18', mid: '#b03a2e', light: '#e9b7b1' },

        COLOR_GREEN: { dark: '#1f6b3a', mid: '#38b26a', light: '#d8ffe7' },
        COLOR_DARK_GREEN: { dark: '#184d2d', mid: '#2b7a47', light: '#bfe6ca' },
        COLOR_LIGHT_GREEN: { dark: '#38a169', mid: '#68d391', light: '#e7fff0' },

        COLOR_PURPLE: { dark: '#5f3a78', mid: '#9b59b6', light: '#f1ddff' },

        COLOR_WHITE: { dark: '#bfc8cf', mid: '#ecf0f1', light: '#ffffff' },
        COLOR_DARK_WHITE: { dark: '#9ea7ad', mid: '#d7dde2', light: '#f7f9fb' },
        COLOR_SILVER_WHITE: { dark: '#8a98a6', mid: '#dde6ee', light: '#fcfdff' },

        COLOR_BEIGE: { dark: '#9a7b5f', mid: '#d2b48c', light: '#f6eadb' },
        COLOR_APRICOT: { dark: '#b96f4a', mid: '#f4b183', light: '#ffe6d6' },
        COLOR_DARK_APRICOT: { dark: '#9a5a3a', mid: '#d99058', light: '#f5d2b5' },

        COLOR_GRAY: { dark: '#5f6b73', mid: '#95a5a6', light: '#dde6e8' },
        COLOR_BLACK: { dark: '#111315', mid: '#2d3436', light: '#7f8c8d' }
    };

    const fallbackPalette = map[key] || map.COLOR_DEFAULT_HUMAN;

    return this.resolveRgbPalette(rgbR, rgbG, rgbB, fallbackPalette) || fallbackPalette;
    },
    resolveWeaponPaletteByType: function(weaponType, fallbackPalette = null) {
    const type = String(weaponType || '').trim().toUpperCase();

    const pick = (colorKey, fallback) => this.resolveWeaponPalette(colorKey, fallback);

    const map = {
        WEAPON_LARGE_SWORD: pick('COLOR_METAL_SILVER', '#95a5a6'),
        WEAPON_SMALL_SWORD: pick('COLOR_DARK_SILVER', '#7b8a90'),
        WEAPON_SMALL_CURVED_SWORD: pick('COLOR_CYAN', '#00d2ff'),

        WEAPON_GUN: pick('COLOR_GUN_BLACK', '#2c3e50'),

        WEAPON_WOOD_CLUB: pick('COLOR_WOOD', '#8e5a2b'),
        WEAPON_SMALL_BOW: pick('COLOR_WOOD', '#8e5a2b'),
        WEAPON_BOW: pick('COLOR_WOOD', '#8e5a2b'),

        WEAPON_STONE: pick('COLOR_STONE', '#8b949e'),

        WEAPON_LARGE_AXE: pick('COLOR_DARK_SILVER', '#7b8a90'),
        WEAPON_MAGIC_STAFF: pick('COLOR_GOLD', '#f1c40f')
    };

    if (map[type]) return map[type];

    if (fallbackPalette) return fallbackPalette;

    return {
        dark: '#5f6b73',
        mid: '#95a5a6',
        light: '#dde6e8',
        accent: '#f5f5f5'
    };
    },
    resolveWeaponPalette: function(renderColor, fallback = '#95a5a6') {
    const fallbackMid = fallback || '#95a5a6';

    const map = {
        COLOR_METAL_SILVER: { dark: '#5f6f73', mid: '#a8b8bc', light: '#e8f1f3', accent: '#d7e6ea' },
        COLOR_DARK_SILVER: { dark: '#4f5b60', mid: '#7b8a90', light: '#bac5ca', accent: '#dbe1e4' },
        COLOR_WOOD: { dark: '#5f3b1f', mid: '#8e5a2b', light: '#c58a52', accent: '#e2b07b' },
        COLOR_GUN_BLACK: { dark: '#0f151b', mid: '#2c3e50', light: '#66798c', accent: '#b9c7d3' },
        COLOR_STONE: { dark: '#586069', mid: '#8b949e', light: '#c9d1d9', accent: '#e5edf3' },
        COLOR_BLACK: { dark: '#0f1113', mid: '#2d3436', light: '#636e72', accent: '#b2bec3' },
        COLOR_BROWN: { dark: '#5d3412', mid: '#8b4513', light: '#c27a41', accent: '#e8b483' },
        COLOR_GOLD: { dark: '#9a6c08', mid: '#f1c40f', light: '#ffe082', accent: '#fff3bf' },
        COLOR_DARK_GOLD: { dark: '#8c6506', mid: '#d4ac0d', light: '#f6d365', accent: '#fff0b3' },
        COLOR_BLUE: { dark: '#1f5f97', mid: '#3498db', light: '#a7dbff', accent: '#e3f4ff' },
        COLOR_CYAN: { dark: '#0c7c86', mid: '#00d2ff', light: '#b9f7ff', accent: '#ecfeff' },
        COLOR_RED: { dark: '#922b21', mid: '#e74c3c', light: '#ffc9c2', accent: '#ffe7e3' }
    };

    if (map[renderColor]) return map[renderColor];

    return {
        dark: fallbackMid,
        mid: fallbackMid,
        light: '#ffffff',
        accent: '#f5f5f5'
    };
    },
    resolveWeaponColor: function(renderColor, fallback) {
    return this.resolveWeaponPalette(renderColor, fallback).mid;
    },
        resolveMonsterPalette: function(monster) {
    const d = monster.d || {};
    const key = String(d.renderColor || '').trim().toUpperCase();
    const renderType = String(d.renderType || '').trim().toUpperCase();
    const fallback = d.name && d.name.includes("키놀") ? "#d8dde6" : (d.color || '#95a5a6');

    const fallbackMapByType = {
        RENDER_GOBLIN: { dark: '#226b35', mid: '#4CAF50', light: '#b8f1b6' },
        RENDER_HUMAN: { dark: '#2c5f86', mid: '#6dd5ed', light: '#dff6ff' },
        RENDER_TAU: { dark: '#6b5742', mid: '#a07f62', light: '#d9b99a' },
        RENDER_SKELETON: { dark: '#8a8f94', mid: '#cfd6dc', light: '#fbfdff' },
        RENDER_ZOMBIE: { dark: '#4b5f39', mid: '#7f9a62', light: '#d9e7c8' },
        RENDER_WITCH: { dark: '#355c7d', mid: '#6c8fb3', light: '#d9ecff' }
    };

    const map = {
        COLOR_GREEN: { dark: '#226b35', mid: '#4CAF50', light: '#b8f1b6' },
        COLOR_LIGHT_GREEN: { dark: '#5f8f27', mid: '#8BC34A', light: '#e0f7b7' },
        COLOR_DARK_GREEN: { dark: '#1d5123', mid: '#2e7d32', light: '#8fd39a' },

        COLOR_RED: { dark: '#8f231d', mid: '#e74c3c', light: '#ffc8c2' },
        COLOR_DARK_RED: { dark: '#6f1d18', mid: '#b03a2e', light: '#eab7b1' },

        COLOR_BLUE: { dark: '#215d91', mid: '#3498db', light: '#c6ebff' },
        COLOR_DARK_BLUE: { dark: '#1c3e5a', mid: '#355c7d', light: '#a8c4db' },
        COLOR_CYAN: { dark: '#117a8b', mid: '#38d9e9', light: '#dcfbff' },

        COLOR_PURPLE: { dark: '#5b2a78', mid: '#9b59b6', light: '#ead4ff' },

        COLOR_STONE: { dark: '#59636d', mid: '#95a5a6', light: '#d9e2e3' },
        COLOR_GRAY: { dark: '#59636d', mid: '#95a5a6', light: '#d9e2e3' },
        COLOR_BLACK: { dark: '#111315', mid: '#2d3436', light: '#7f8c8d' },

        COLOR_WHITE: { dark: '#b9c3c8', mid: '#ecf0f1', light: '#ffffff' },
        COLOR_DARK_WHITE: { dark: '#9ea7ad', mid: '#d7dde2', light: '#f7f9fb' },
        COLOR_SILVER_WHITE: { dark: '#8d99a5', mid: '#dfe7ef', light: '#fbfdff' },

        COLOR_BEIGE: { dark: '#8f745d', mid: '#c9ab8a', light: '#f2e2d0' },
        COLOR_APRICOT: { dark: '#b96f4a', mid: '#f4b183', light: '#ffe6d6' },
        COLOR_DARK_APRICOT: { dark: '#9a5a3a', mid: '#d99058', light: '#f5d2b5' },

        COLOR_BROWN: { dark: '#5d3412', mid: '#8b4513', light: '#c27a41' },
        COLOR_GOLD: { dark: '#9a6c08', mid: '#f1c40f', light: '#ffe082' }
    };

    const fallbackPalette =
        map[key] ||
        fallbackMapByType[renderType] || {
            dark: fallback,
            mid: fallback,
            light: '#ffffff'
        };

    return this.resolveRgbPalette(
        d.renderColorR,
        d.renderColorG,
        d.renderColorB,
        fallbackPalette
    ) || fallbackPalette;
    },
    resolveMonsterBodyColor: function(monster) {
        return this.resolveMonsterPalette(monster).mid;
    },};
