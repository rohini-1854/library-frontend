export const isTamilEncoded = (text) => {
    if (!text) return false;
    // Legacy Tamil fonts like Amudham/Bamini map Tamil glyphs to standard ASCII characters.
    // Detection markers:
    // 1. Special punctuation: ; " ' @ # $ [ ] { } | \ ^ ~ : ,
    // 2. Trailing ';' (pulli) or uppercase markers in middle of words (glyph vowels)
    // 3. Unique character combinations like 'zs', 'vh', 'Vh', 'fij', 'Ez:fiy'
    const tamilMarkers = /[;"'@#\$\[\]\{\}\|\\\^~:,]|;$|[a-z][A-Z]|zs|vh|Vh|v\s|V\s|[a-z][pPMEWV][a-z]|[a-z][pPMEWV]$|^fij$|^Ez:fiy$/;
    return tamilMarkers.test(text);
};

export const baminiToUnicode = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Character Map (Condensed for frontend use)
    const charMap = {
        'm': 'அ', 'M': 'ஆ', 'p': 'இ', 'P': 'ஈ', 'E': 'உ', 'W': 'ஊ', 'v': 'எ', 'V': 'ஏ', 'I': 'ஐ', 'x': 'ஒ', 'X': 'ஓ',
        'f': 'க', 's': 'ச', 'l': 'ட', 'j': 'த', 'g': 'ப', 'k': 'ம', 'a': 'ய', 'h': 'ர', 'y': 'ல', 't': 'வ', 'u': 'ழ', 'G': 'ள', 'w': 'ற', 'd': 'ன',
        'z': 'ண', 'O': 'ஞ', 'J': 'ஜ', 'S': 'ஷ', 'n': 'ஸ', 'H': 'ஹ', 'N': 'க்ஷ',
        'h': 'ா', 'p': 'ி', 'P': 'ீ', 'S': 'ு', 'R': 'ூ', 'b': 'ெ', 'B': 'ே', 'i': 'ை', 'Q': 'ொ', 'W': 'ோ', 'T': 'ௌ',
        ';': '்', '"': 'ஞ்', '[': 'ு', '#': 'ஷ', ',': 'வி', 'W': 'று', 'D': 'னு'
    };

    const prefixes = ['b', 'B', 'i'];
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (prefixes.includes(char) && i + 1 < text.length) {
            const nextChar = text[i + 1];
            result += (charMap[nextChar] || nextChar) + (charMap[char] || char);
            i++;
        } else {
            result += charMap[char] || char;
        }
    }
    return result;
};

export const unicodeToBamini = (text) => {
    if (!text) return "";
    const map = {
        'அ': 'm', 'ஆ': 'M', 'இ': 'p', 'ஈ': 'P', 'உ': 'E', 'ஊ': 'W', 'எ': 'v', 'ஏ': 'V', 'ஐ': 'I', 'ஒ': 'x', 'ஓ': 'X', 'ஔ': 'Xzs',
        'க': 'f', 'ங': 's', 'ச': 'r', 'ஞ': 'O', 'ட': 'l', 'ண': 'Z', 'த': 'j', 'ந': 'e', 'ப': 'g', 'ம': 'k', 'ய': 'a', 'ர': 'h', 'ல': 'y', 'வ': 't', 'ழ': 'u', 'ள': 'G', 'ற': 'w', 'ன': 'd',
        'ஷ': 'S', 'ஸ': 'n', 'ஹ': 'H', 'ஜ': 'J',
        'ா': 'h', 'ி': 'p', 'ீ': 'P', 'ு': 'E', 'ூ': 'W', 'ெ': 'v', 'ே': 'V', 'ை': 'I', 'ொ': 'v h', 'ோ': 'V h', 'ௌ': 'v zs', '்': ';',
        'ஶ': 'N'
    };

    let result = "";
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i + 1];

        if (nextChar === 'ெ' || nextChar === 'ே' || nextChar === 'ை') {
            result += (map[nextChar] || "") + (map[char] || char);
            i++;
        } else if (nextChar === 'ொ') {
            result += 'v' + (map[char] || char) + 'h';
            i++;
        } else if (nextChar === 'ோ') {
            result += 'V' + (map[char] || char) + 'h';
            i++;
        } else if (nextChar === 'ௌ') {
            result += 'v' + (map[char] || char) + 'zs';
            i++;
        } else if (map[char]) {
            result += map[char];
        } else {
            result += char;
        }
    }
    return result;
};
