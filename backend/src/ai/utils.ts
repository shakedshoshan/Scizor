export function getContentType(format: string): string {
    const contentTypes = {
      'mp3': 'audio/mpeg',
      'opus': 'audio/opus',
      'aac': 'audio/aac',
      'flac': 'audio/flac',
    };
    
    return contentTypes[format] || 'audio/mpeg';
  }