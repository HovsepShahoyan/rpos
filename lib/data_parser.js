function parseData(data) {
    const properties = {};
    let mode = "";
    let currentKey = "";
    const segments = data.split('/');

    for (let segment of segments) {
        if (segment.startsWith('>ADR=')) {
            mode = segment.split('=')[1];
        } else if (segment.startsWith('SMDD=')) {
            currentKey = segment.split('=')[1].substring(2); // remove g_ or prefix
        } else if (segment.startsWith('LD=')) {
            properties[currentKey] = segment.split('=')[1];
        }
    }

    return { mode, properties };
}

function parseResponse(response) {
    const data = {};
    const parts = response.split('/');
    
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('SMDD=')) {
            const key = parts[i].split('=')[1].substring(2);
            if (parts[i+1] && parts[i+1].startsWith('LD=')) {
                const value = parts[i+1].split('=')[1];
                data[key] = parseInt(value);
            }
        }
    }

    return data;
}

module.exports = {
    parseData,
    parseResponse
};

