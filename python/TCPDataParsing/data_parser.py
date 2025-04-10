def parse_data(data):
    properties = {}
    mode = ""
    segments = data.split('/')
    for segment in segments:
        if '=' in segment:
            key, value = segment.split('=')
            if key == 'SMDD':
                current_key = value[2:]  # Remove the 'g_' prefix
            elif key == 'LD':
                properties[current_key] = value
            elif key == '>ADR':
                mode = value    
    return (mode, properties)

def parse_response(response):
    """
    Parses the received data string into a dictionary of key-value pairs.
    """
    data = {}
    parts = response.split('/')
    for part in parts:
        if 'SMDD=' in part:
            key = part.split('=')[1][2:]  # Remove the 'g_' prefix
            if key and 'LD=' in parts[parts.index(part) + 1]:
                value = parts[parts.index(part) + 1].split('=')[1]
                data[key] = int(value)
    return data
